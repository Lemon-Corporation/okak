# Code Style проекта

Документ описывает правила разработки Python-проекта: архитектурное разделение, DI/IoC-подход, работу с конфигурацией, оформление классов, исключений и базовые соглашения по коду.

## 1. Общие принципы

Проект разрабатывается в стиле **Dependency Injection**: классы не создают свои зависимости самостоятельно, а получают их извне.

Основные правила:

- бизнес-код не должен напрямую создавать подключения к БД, Redis, HTTP-клиенты и другие инфраструктурные зависимости;
- зависимости передаются явно через поля класса;
- для IoC-контейнера, сервисов, репозиториев и suppliers используются `dataclass`;
- в IoC-классах не пишется ручной `__init__` без необходимости;
- поля классов объявляются явно в теле класса через аннотации типов;
- конфигурация описывается через `pydantic-settings`;
- настройки группируются во вложенные объекты;
- все переменные окружения проекта имеют общий префикс `OKAK_`;
- код делится на уровни: `presentation`, `services`, `repository`, `suppliers`, `schemas`;
- каждый слой отвечает только за свою область ответственности.

## 2. Структура проекта

Рекомендуемая структура:

```text
app/
├── config/
│   ├── __init__.py
│   └── settings.py
│
├── ioc/
│   ├── __init__.py
│   ├── builders.py
│   └── container.py
│
├── suppliers/
│   ├── __init__.py
│   ├── bitrix.py
│   ├── llm.py
│   └── notifications.py
│
├── repository/
│   ├── __init__.py
│   ├── users.py
│   ├── tokens.py
│   └── cache.py
│
├── services/
│   ├── __init__.py
│   ├── users.py
│   └── auth.py
│
├── presentation/
│   ├── __init__.py
│   ├── api.py
│   └── users.py
│
├── schemas/
│   ├── __init__.py
│   ├── users.py
│   ├── auth.py
│   └── errors.py
│
├── exceptions/
│   ├── __init__.py
│   └── base.py
│
└── main.py
```

### 2.1. Что хранится в `schemas`

В проекте не используются отдельные директории `domain/` и `dto/`.

Все структуры данных, которые передаются между слоями, хранятся в `schemas`:

- request-схемы для API;
- response-схемы для API;
- команды для сервисов;
- result-схемы;
- внутренние модели передачи данных;
- enum'ы, если они относятся к данным приложения.

Пример:

```text
app/schemas/
├── users.py
├── auth.py
├── tokens.py
└── errors.py
```

## 3. Ответственность слоёв

### 3.1. `presentation`

Слой `presentation` отвечает за взаимодействие с внешним миром на уровне транспорта.

Для FastAPI сюда относятся:

- routers;
- endpoints;
- request/response-схемы;
- преобразование входных данных в command-схемы;
- преобразование результата сервиса в HTTP-ответ;
- маппинг прикладных исключений в HTTP-ошибки.

В `presentation` не должно быть бизнес-логики и прямого доступа к БД, Redis, кешу или внешним API.

Пример:

```python
from uuid import UUID

from fastapi import APIRouter, Depends

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container
from app.schemas.users import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    container: AppContainer = Depends(get_container),
) -> UserResponse:
    user = await container.user_service.get_user(user_id)
    return UserResponse.model_validate(user)
```

### 3.2. `services`

Слой `services` содержит бизнес-логику приложения.

Сервис может:

- валидировать бизнес-правила;
- координировать несколько репозиториев;
- вызывать suppliers, если бизнес-сценарию нужно внешнее взаимодействие;
- принимать бизнес-решения;
- выбрасывать прикладные исключения.

Сервис не должен напрямую работать с FastAPI, request/response-объектами, SQL-запросами, Redis-командами или низкоуровневыми драйверами.

Пример:

```python
from dataclasses import dataclass
from uuid import UUID

from app.exceptions.base import UserAppError
from app.repository.users import UserRepository
from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class UserService:
    user_repository: UserRepository

    async def get_user(self, user_id: UUID) -> UserSchema:
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserAppError(
                code="user_not_found",
                message="User not found",
                details={"user_id": str(user_id)},
            )

        return user
```

### 3.3. `repository`

Слой `repository` отвечает за взаимодействие с хранилищами данных проекта.

Через `repository` выполняется работа с:

- базой данных;
- кешем;
- поисковым индексом;
- файловой системой, если она используется как внутреннее хранилище;
- другими внутренними источниками данных.

Важно: взаимодействие с базами данных производится через `repository`, а не через `suppliers`.

Репозиторий не должен содержать бизнес-логику. Его задача — получить, сохранить, обновить или удалить данные.

Пример:

```python
from dataclasses import dataclass
from uuid import UUID

from asyncpg import Pool

from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class UserRepository:
    pool: Pool

    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        query = """
        SELECT id, email, name
        FROM users
        WHERE id = $1
        """
        async with self.pool.acquire() as connection:
            row = await connection.fetchrow(query, user_id)

        if row is None:
            return None

        return UserSchema(
            id=row["id"],
            email=row["email"],
            name=row["name"],
        )
```

### 3.4. `suppliers`

Слой `suppliers` отвечает только за внешнее взаимодействие с системами, которые не являются внутренним хранилищем данных проекта.

Примеры suppliers:

- клиент внешнего API;
- клиент Bitrix24;
- клиент LLM-провайдера;
- клиент сервиса уведомлений;
- клиент платёжного провайдера;
- клиент внешнего файлового хранилища;
- producer/consumer внешней очереди сообщений, если очередь используется как интеграция с внешней системой.

В `suppliers` не должно быть бизнес-логики.

В `suppliers` не нужно выносить работу с основной БД проекта. SQL-запросы, Redis-команды и работа с внутренними хранилищами должны находиться в `repository`.

Пример:

```python
from dataclasses import dataclass

from httpx import AsyncClient

from app.schemas.notifications import SendNotificationResult


@dataclass(slots=True, kw_only=True)
class NotificationSupplier:
    client: AsyncClient
    base_url: str

    async def send_message(self, user_id: str, text: str) -> SendNotificationResult:
        response = await self.client.post(
            f"{self.base_url}/messages",
            json={"user_id": user_id, "text": text},
        )
        response.raise_for_status()
        return SendNotificationResult.model_validate(response.json())
```

## 4. Правила зависимостей между слоями

Разрешённое направление зависимостей:

```text
presentation -> services -> repository
                         -> suppliers
```

То есть:

- `presentation` вызывает `services`;
- `services` вызывают `repository`, если нужны данные из БД, кеша или внутреннего хранилища;
- `services` вызывают `suppliers`, если нужно внешнее взаимодействие;
- `repository` не зависит от `services`;
- `suppliers` не зависят от `services`;
- `repository` и `suppliers` не должны зависеть друг от друга.

Запрещено:

```text
services -> presentation
repository -> presentation
repository -> services
suppliers -> presentation
suppliers -> services
suppliers -> repository
repository -> suppliers
```

Примеры:

- `presentation` может вызывать `UserService`;
- `UserService` может вызывать `UserRepository`;
- `UserService` может вызывать `NotificationSupplier`;
- `UserRepository` не должен импортировать FastAPI-router;
- `NotificationSupplier` не должен знать о бизнес-сервисах;
- `UserRepository` не должен ходить во внешний API через supplier.

## 5. DI и IoC

### 5.1. Общий подход

Все зависимости должны передаваться явно.

Плохо:

```python
class UserService:
    def __init__(self) -> None:
        self.repository = UserRepository()
```

Хорошо:

```python
from dataclasses import dataclass

from app.repository.users import UserRepository


@dataclass(slots=True, kw_only=True)
class UserService:
    user_repository: UserRepository
```

Класс не должен сам решать, какую реализацию зависимости использовать. Это задача IoC-контейнера.

### 5.2. IoC через `dataclass`

IoC-контейнер собирает объектный граф приложения.

Пример:

```python
from dataclasses import dataclass

from asyncpg import Pool
from httpx import AsyncClient

from app.config.settings import Settings
from app.repository.tokens import TokenRepository
from app.repository.users import UserRepository
from app.services.auth import AuthService
from app.services.users import UserService
from app.suppliers.notifications import NotificationSupplier


@dataclass(slots=True, kw_only=True)
class AppContainer:
    settings: Settings

    postgres_pool: Pool
    http_client: AsyncClient

    notification_supplier: NotificationSupplier

    user_repository: UserRepository
    token_repository: TokenRepository

    user_service: UserService
    auth_service: AuthService
```

Создание контейнера выносится в отдельную функцию.

```python
async def build_container() -> AppContainer:
    settings = Settings()

    postgres_pool = await build_postgres_pool(settings.postgres)
    http_client = build_http_client(settings.http_client)

    notification_supplier = NotificationSupplier(
        client=http_client,
        base_url=settings.notifications.base_url,
    )

    user_repository = UserRepository(pool=postgres_pool)
    token_repository = TokenRepository(pool=postgres_pool)

    user_service = UserService(
        user_repository=user_repository,
        notification_supplier=notification_supplier,
    )
    auth_service = AuthService(
        user_repository=user_repository,
        token_repository=token_repository,
    )

    return AppContainer(
        settings=settings,
        postgres_pool=postgres_pool,
        http_client=http_client,
        notification_supplier=notification_supplier,
        user_repository=user_repository,
        token_repository=token_repository,
        user_service=user_service,
        auth_service=auth_service,
    )
```

### 5.3. Не писать ручной `__init__` без необходимости

В классах, участвующих в DI/IoC, не нужно писать ручной `__init__`, если `dataclass` уже делает это автоматически.

Плохо:

```python
class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        token_repository: TokenRepository,
    ) -> None:
        self.user_repository = user_repository
        self.token_repository = token_repository
```

Хорошо:

```python
from dataclasses import dataclass


@dataclass(slots=True, kw_only=True)
class AuthService:
    user_repository: UserRepository
    token_repository: TokenRepository
```

Ручной `__init__` допускается только в случаях, когда без него нельзя корректно выразить инициализацию.

Отдельное исключение — классы ошибок. Для них можно использовать ручной `__init__`, если нужно удобно хранить `code`, `message`, `details` или другие поля ошибки.

### 5.4. Поля классов

Поля классов должны объявляться явно в теле класса через аннотации типов.

Хорошо:

```python
from dataclasses import dataclass


@dataclass(slots=True, kw_only=True)
class PasswordService:
    hash_rounds: int
    salt_size: int
```

Плохо:

```python
class PasswordService:
    def __init__(self, hash_rounds: int, salt_size: int) -> None:
        self.hash_rounds = hash_rounds
        self.salt_size = salt_size
```

Если поле является настоящей константой класса, нужно использовать `ClassVar`.

```python
from dataclasses import dataclass
from typing import ClassVar


@dataclass(slots=True, kw_only=True)
class PasswordPolicy:
    MIN_PASSWORD_LENGTH: ClassVar[int] = 8

    max_password_length: int
```

Важно: зависимости и состояние экземпляра должны быть обычными dataclass-полями, а не `ClassVar`.

## 6. Конфигурация через `pydantic-settings`

### 6.1. Общий подход

Для конфигурации используется `pydantic-settings`.

Настройки должны быть сгруппированы во вложенные объекты:

- `app`;
- `postgres`;
- `redis`;
- `auth`;
- `logging`;
- `http_client`;
- `notifications`;
- другие группы по необходимости.

У всех переменных окружения должен быть общий префикс проекта: `OKAK_`.

Пример:

```python
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseModel):
    name: str = "okak-service"
    debug: bool = False


class PostgresSettings(BaseModel):
    host: str
    port: int = 5432
    user: str
    password: str
    database: str

    @property
    def dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.database}"
        )


class RedisSettings(BaseModel):
    host: str
    port: int = 6379
    database: int = 0


class AuthSettings(BaseModel):
    access_token_ttl_seconds: int = 3600
    refresh_token_ttl_seconds: int = 2_592_000


class HttpClientSettings(BaseModel):
    timeout_seconds: float = 10.0


class NotificationSettings(BaseModel):
    base_url: str


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="OKAK_",
        env_nested_delimiter="__",
        extra="ignore",
    )

    app: AppSettings = Field(default_factory=AppSettings)
    postgres: PostgresSettings
    redis: RedisSettings
    auth: AuthSettings = Field(default_factory=AuthSettings)
    http_client: HttpClientSettings = Field(default_factory=HttpClientSettings)
    notifications: NotificationSettings
```

### 6.2. Переменные окружения

Для вложенных настроек используется разделитель `__`.

Так как задан `env_prefix="OKAK_"`, все переменные окружения должны начинаться с `OKAK_`.

Пример `.env`:

```env
OKAK_APP__NAME=okak-service
OKAK_APP__DEBUG=true

OKAK_POSTGRES__HOST=localhost
OKAK_POSTGRES__PORT=5432
OKAK_POSTGRES__USER=postgres
OKAK_POSTGRES__PASSWORD=postgres
OKAK_POSTGRES__DATABASE=app

OKAK_REDIS__HOST=localhost
OKAK_REDIS__PORT=6379
OKAK_REDIS__DATABASE=0

OKAK_AUTH__ACCESS_TOKEN_TTL_SECONDS=3600
OKAK_AUTH__REFRESH_TOKEN_TTL_SECONDS=2592000

OKAK_HTTP_CLIENT__TIMEOUT_SECONDS=10
OKAK_NOTIFICATIONS__BASE_URL=https://notifications.example.com
```

### 6.3. Правила работы с настройками

Настройки должны создаваться один раз на этапе сборки контейнера.

Плохо:

```python
@dataclass(slots=True, kw_only=True)
class UserService:
    user_repository: UserRepository

    async def get_user(self, user_id: UUID) -> UserSchema:
        settings = Settings()
        ...
```

Хорошо:

```python
@dataclass(slots=True, kw_only=True)
class TokenService:
    settings: AuthSettings
    token_repository: TokenRepository
```

Правила:

- не создавать `Settings()` внутри бизнес-методов;
- не читать `os.environ` напрямую в сервисах, репозиториях и suppliers;
- не передавать весь `Settings`, если нужен только конкретный вложенный объект;
- передавать в класс только те настройки, которые ему реально нужны;
- секреты не логировать.

## 7. Использование абстракций

Сервисы по возможности должны зависеть не от конкретных реализаций, а от интерфейсов/протоколов.

Пример:

```python
from typing import Protocol
from uuid import UUID

from app.schemas.users import UserSchema


class UserReader(Protocol):
    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        ...
```

Сервис:

```python
from dataclasses import dataclass
from uuid import UUID

from app.exceptions.base import UserAppError
from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class UserService:
    user_reader: UserReader

    async def get_user(self, user_id: UUID) -> UserSchema:
        user = await self.user_reader.get_by_id(user_id)
        if user is None:
            raise UserAppError(
                code="user_not_found",
                message="User not found",
                details={"user_id": str(user_id)},
            )

        return user
```

Конкретная реализация может находиться в `repository`:

```python
from dataclasses import dataclass
from uuid import UUID

from asyncpg import Pool

from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class UserRepository:
    pool: Pool

    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        ...
```

## 8. Правила для сервисов

Сервис должен:

- содержать бизнес-логику;
- иметь явно объявленные зависимости;
- быть легко тестируемым;
- не создавать инфраструктурные объекты самостоятельно;
- не знать о HTTP-слое;
- не выполнять SQL-запросы;
- не выполнять Redis-команды напрямую;
- не возвращать FastAPI `Response`, `JSONResponse` и подобные объекты;
- выбрасывать осмысленные прикладные исключения.

Плохо:

```python
@dataclass(slots=True, kw_only=True)
class UserService:
    async def get_user(self, user_id: UUID) -> JSONResponse:
        ...
```

Хорошо:

```python
@dataclass(slots=True, kw_only=True)
class UserService:
    user_repository: UserRepository

    async def get_user(self, user_id: UUID) -> UserSchema:
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserAppError(
                code="user_not_found",
                message="User not found",
                details={"user_id": str(user_id)},
            )

        return user
```

## 9. Правила для репозиториев

Репозиторий должен:

- инкапсулировать работу с конкретным внутренним источником данных;
- выполнять SQL-запросы, Redis-команды и другие операции хранения данных;
- возвращать схемы из `schemas` или примитивные значения;
- не содержать бизнес-правила;
- не работать с HTTP-запросами и HTTP-ответами;
- не вызывать suppliers;
- не создавать подключение к БД самостоятельно, если оно должно приходить из DI.

Плохо:

```python
@dataclass(slots=True, kw_only=True)
class UserRepository:
    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        pool = await asyncpg.create_pool(...)
        ...
```

Хорошо:

```python
from dataclasses import dataclass
from uuid import UUID

from asyncpg import Pool

from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class UserRepository:
    pool: Pool

    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        ...
```

## 10. Правила для suppliers

Supplier должен:

- инкапсулировать работу с внешней системой;
- скрывать детали HTTP-запросов, SDK или API внешнего сервиса;
- возвращать схемы из `schemas` или примитивные значения;
- не содержать бизнес-правила;
- не выполнять SQL-запросы к основной БД проекта;
- не обращаться к repository;
- не знать о presentation-слое.

Плохо:

```python
@dataclass(slots=True, kw_only=True)
class BitrixSupplier:
    client: AsyncClient
    user_repository: UserRepository

    async def sync_user(self, user_id: UUID) -> None:
        user = await self.user_repository.get_by_id(user_id)
        ...
```

Хорошо:

```python
@dataclass(slots=True, kw_only=True)
class BitrixSupplier:
    client: AsyncClient
    base_url: str

    async def get_contact(self, contact_id: int) -> BitrixContactSchema:
        response = await self.client.get(f"{self.base_url}/contacts/{contact_id}")
        response.raise_for_status()
        return BitrixContactSchema.model_validate(response.json())
```

Координация между repository и supplier должна находиться в service.

```python
@dataclass(slots=True, kw_only=True)
class SyncUserService:
    user_repository: UserRepository
    bitrix_supplier: BitrixSupplier

    async def sync_user(self, user_id: UUID) -> None:
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserAppError(
                code="user_not_found",
                message="User not found",
                details={"user_id": str(user_id)},
            )

        await self.bitrix_supplier.update_contact(user)
```

## 11. Правила для presentation-слоя

Presentation-слой должен:

- принимать входные данные;
- валидировать формат входных данных через Pydantic-схемы;
- вызывать сервисы;
- преобразовывать результат сервиса в API-response;
- маппить прикладные исключения в HTTP-ошибки.

Presentation-слой не должен:

- выполнять SQL-запросы;
- обращаться к Redis напрямую;
- вызывать suppliers напрямую;
- содержать бизнес-логику;
- собирать сложные зависимости вручную внутри endpoint'а.

Плохо:

```python
@router.get("/{user_id}")
async def get_user(user_id: UUID) -> UserResponse:
    pool = await asyncpg.create_pool(...)
    repository = UserRepository(pool=pool)
    service = UserService(user_repository=repository)
    user = await service.get_user(user_id)
    return UserResponse.model_validate(user)
```

Хорошо:

```python
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    container: AppContainer = Depends(get_container),
) -> UserResponse:
    user = await container.user_service.get_user(user_id)
    return UserResponse.model_validate(user)
```

## 12. Нейминг

### 12.1. Файлы и модули

Файлы называются в `snake_case`:

```text
user_service.py
user_repository.py
bitrix_supplier.py
```

Допустимо использовать короткие имена, если слой уже указан директорией:

```text
services/users.py
repository/users.py
suppliers/bitrix.py
schemas/users.py
```

### 12.2. Классы

Классы называются в `PascalCase`:

```python
UserService
UserRepository
BitrixSupplier
AppContainer
CreateUserCommand
UserResponse
```

### 12.3. Функции и методы

Функции и методы называются в `snake_case`:

```python
get_user
create_user
build_container
get_by_id
```

### 12.4. Переменные

Переменные называются в `snake_case`:

```python
user_id
access_token
created_at
```

### 12.5. Константы

Константы называются в `UPPER_SNAKE_CASE`:

```python
DEFAULT_PAGE_SIZE = 100
MAX_RETRY_COUNT = 3
```

## 13. Типизация

Код должен быть типизирован.

Обязательны аннотации:

- у аргументов функций;
- у возвращаемых значений функций;
- у полей dataclass-классов;
- у сложных структур данных.

Пример:

```python
from uuid import UUID

from app.schemas.users import UserSchema


async def get_user(user_id: UUID) -> UserSchema:
    ...
```

Не использовать `Any` без необходимости.

Плохо:

```python
def process(data: Any) -> Any:
    ...
```

Хорошо:

```python
def process(command: CreateUserCommand) -> UserSchema:
    ...
```

## 14. Schemas

Все структуры данных проекта хранятся в `schemas`.

В `schemas` могут находиться:

- Pydantic request/response-схемы;
- dataclass-команды для сервисов;
- result-схемы;
- схемы для данных из внешних API;
- схемы для данных из repository;
- enum'ы, относящиеся к данным приложения.

Пример `schemas/users.py`:

```python
from dataclasses import dataclass
from uuid import UUID

from pydantic import BaseModel, EmailStr


class CreateUserRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str


class UserSchema(BaseModel):
    id: UUID
    email: EmailStr
    name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateUserCommand:
    email: str
    name: str
    password: str
```

Endpoint должен преобразовывать request-схему в command-схему:

```python
@router.post("/", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    container: AppContainer = Depends(get_container),
) -> UserResponse:
    command = CreateUserCommand(
        email=request.email,
        name=request.name,
        password=request.password,
    )
    user = await container.user_service.create_user(command)
    return UserResponse.model_validate(user)
```

## 15. Исключения

Исключения должны быть осмысленными и располагаться в отдельном модуле.

Не нужно создавать отдельный класс под каждую возможную ошибку. Вместо этого используется одна базовая ошибка приложения и несколько основных видов ошибок.

Рекомендуемая структура:

- `AppError` — базовая ошибка приложения;
- `UserAppError` — ошибка, вызванная действиями пользователя или некорректными входными данными;
- `LocalAppError` — внутренняя локальная ошибка приложения, например ошибка состояния, конфигурации или нарушенного инварианта;
- `ServerAppError` — серверная ошибка или ошибка внешней инфраструктуры.

Для классов ошибок можно использовать ручной `__init__`.

Пример:

```python
from typing import Any


class AppError(Exception):
    def __init__(
        self,
        *,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details or {}


class UserAppError(AppError):
    pass


class LocalAppError(AppError):
    pass


class ServerAppError(AppError):
    pass
```

Плохо:

```python
class UserNotFoundError(Exception):
    ...


class UserEmailAlreadyExistsError(Exception):
    ...


class UserPasswordTooWeakError(Exception):
    ...
```

Хорошо:

```python
raise UserAppError(
    code="user_not_found",
    message="User not found",
    details={"user_id": str(user_id)},
)

raise UserAppError(
    code="email_already_exists",
    message="Email already exists",
    details={"email": email},
)

raise UserAppError(
    code="password_too_weak",
    message="Password is too weak",
)
```

Сервис выбрасывает прикладное исключение:

```python
if user is None:
    raise UserAppError(
        code="user_not_found",
        message="User not found",
        details={"user_id": str(user_id)},
    )
```

Presentation-слой преобразует его в HTTP-ошибку:

```python
from fastapi import HTTPException, status

from app.exceptions.base import LocalAppError, ServerAppError, UserAppError


def map_app_error_to_http(error: AppError) -> HTTPException:
    if isinstance(error, UserAppError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": error.code,
                "message": error.message,
                "details": error.details,
            },
        )

    if isinstance(error, LocalAppError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": error.code,
                "message": error.message,
                "details": error.details,
            },
        )

    if isinstance(error, ServerAppError):
        return HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "code": error.code,
                "message": error.message,
                "details": error.details,
            },
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={"code": "internal_error", "message": "Internal error"},
    )
```

## 16. Асинхронный код

Если проект использует async-стек, нужно соблюдать единый подход:

- repository-методы для БД и кеша должны быть `async`, если используемый драйвер асинхронный;
- supplier-методы должны быть `async`, если внешний клиент асинхронный;
- services могут быть `async`, если вызывают async-зависимости;
- presentation вызывает async-сервисы через `await`;
- не использовать блокирующие операции внутри async-функций.

Плохо:

```python
import time


async def get_user(user_id: UUID) -> UserSchema:
    time.sleep(5)
    ...
```

Хорошо:

```python
import asyncio


async def get_user(user_id: UUID) -> UserSchema:
    await asyncio.sleep(5)
    ...
```

## 17. Тестируемость

Код должен быть удобен для unit-тестирования.

Благодаря DI сервис можно тестировать без реальной БД.

Пример:

```python
from dataclasses import dataclass
from uuid import UUID

from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class FakeUserRepository:
    user: UserSchema | None = None

    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        return self.user


async def test_get_user_success() -> None:
    user = UserSchema(id=UUID(int=1), email="test@example.com", name="Test")
    repository = FakeUserRepository(user=user)
    service = UserService(user_reader=repository)

    result = await service.get_user(user.id)

    assert result == user
```

В unit-тестах не нужно поднимать PostgreSQL/Redis, если тестируется только бизнес-логика сервиса.

Инфраструктурные зависимости нужны для integration-тестов.

## 18. Что запрещено

Запрещено:

- создавать зависимости внутри бизнес-сервисов;
- создавать `Settings()` внутри методов сервисов, репозиториев и suppliers;
- писать ручной `__init__` в IoC/dataclass-классах без необходимости;
- смешивать SQL и бизнес-логику в одном классе;
- обращаться к БД из presentation-слоя;
- обращаться к suppliers из presentation-слоя;
- вызывать suppliers из repository;
- вызывать repository из suppliers;
- возвращать HTTP-объекты из services;
- хранить бизнес-логику в routers;
- передавать весь контейнер в сервисы;
- использовать глобальные mutable-объекты для хранения состояния приложения;
- логировать секреты, токены и пароли;
- создавать отдельный класс исключения под каждую частную ошибку.

## 19. Краткий чек-лист для нового кода

Перед добавлением нового кода проверь:

- [ ] Класс оформлен через `dataclass`, если это сервис, репозиторий, supplier или IoC-компонент.
- [ ] У класса нет ручного `__init__`, если он не нужен.
- [ ] Исключение может иметь ручной `__init__`, если нужно хранить `code`, `message`, `details`.
- [ ] Все зависимости передаются через поля класса.
- [ ] Класс не создаёт свои зависимости самостоятельно.
- [ ] Настройки берутся из `pydantic-settings`.
- [ ] Все env-переменные проекта начинаются с `OKAK_`.
- [ ] Настройки сгруппированы во вложенные объекты.
- [ ] Сервис не знает про FastAPI/request/response.
- [ ] Репозиторий не содержит бизнес-логики.
- [ ] Репозиторий отвечает за БД, кеш и внутренние хранилища.
- [ ] Supplier отвечает только за внешние интеграции.
- [ ] Presentation-слой не ходит напрямую в БД/Redis/suppliers.
- [ ] Код типизирован.
- [ ] Слой зависит только от допустимых нижележащих слоёв.
- [ ] Новый код легко протестировать через fake/mock зависимости.

## 20. Минимальный пример полного flow

```python
# config/settings.py
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class PostgresSettings(BaseModel):
    host: str
    port: int = 5432
    user: str
    password: str
    database: str


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="OKAK_",
        env_nested_delimiter="__",
        extra="ignore",
    )

    postgres: PostgresSettings
```

```python
# schemas/users.py
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserSchema(BaseModel):
    id: UUID
    email: EmailStr
    name: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    name: str
```

```python
# repository/users.py
from dataclasses import dataclass
from uuid import UUID

from asyncpg import Pool

from app.schemas.users import UserSchema


@dataclass(slots=True, kw_only=True)
class UserRepository:
    pool: Pool

    async def get_by_id(self, user_id: UUID) -> UserSchema | None:
        query = "SELECT id, email, name FROM users WHERE id = $1"

        async with self.pool.acquire() as connection:
            row = await connection.fetchrow(query, user_id)

        if row is None:
            return None

        return UserSchema(
            id=row["id"],
            email=row["email"],
            name=row["name"],
        )
```

```python
# suppliers/notifications.py
from dataclasses import dataclass

from httpx import AsyncClient


@dataclass(slots=True, kw_only=True)
class NotificationSupplier:
    client: AsyncClient
    base_url: str

    async def send_message(self, user_id: str, text: str) -> None:
        response = await self.client.post(
            f"{self.base_url}/messages",
            json={"user_id": user_id, "text": text},
        )
        response.raise_for_status()
```

```python
# services/users.py
from dataclasses import dataclass
from uuid import UUID

from app.exceptions.base import UserAppError
from app.repository.users import UserRepository
from app.schemas.users import UserSchema
from app.suppliers.notifications import NotificationSupplier


@dataclass(slots=True, kw_only=True)
class UserService:
    user_repository: UserRepository
    notification_supplier: NotificationSupplier

    async def get_user(self, user_id: UUID) -> UserSchema:
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserAppError(
                code="user_not_found",
                message="User not found",
                details={"user_id": str(user_id)},
            )

        return user
```

```python
# ioc/container.py
from dataclasses import dataclass

from asyncpg import Pool
from httpx import AsyncClient


@dataclass(slots=True, kw_only=True)
class AppContainer:
    settings: Settings
    postgres_pool: Pool
    http_client: AsyncClient
    notification_supplier: NotificationSupplier
    user_repository: UserRepository
    user_service: UserService


async def build_container() -> AppContainer:
    settings = Settings()

    postgres_pool = await build_postgres_pool(settings.postgres)
    http_client = build_http_client(settings.http_client)

    notification_supplier = NotificationSupplier(
        client=http_client,
        base_url=settings.notifications.base_url,
    )
    user_repository = UserRepository(pool=postgres_pool)
    user_service = UserService(
        user_repository=user_repository,
        notification_supplier=notification_supplier,
    )

    return AppContainer(
        settings=settings,
        postgres_pool=postgres_pool,
        http_client=http_client,
        notification_supplier=notification_supplier,
        user_repository=user_repository,
        user_service=user_service,
    )
```

```python
# presentation/users.py
from uuid import UUID

from fastapi import APIRouter, Depends

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container
from app.schemas.users import UserResponse


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    container: AppContainer = Depends(get_container),
) -> UserResponse:
    user = await container.user_service.get_user(user_id)
    return UserResponse.model_validate(user)
```

## 21. Главная идея

Код должен быть устроен так, чтобы бизнес-логика была отделена от инфраструктуры.

`presentation` описывает, **как внешний мир обращается к системе**.

`services` описывают, **что делает система**.

`repository` описывает, **как получить и сохранить данные во внутренних хранилищах**.

`suppliers` описывают, **как взаимодействовать с внешними системами**.

`schemas` описывают, **какими структурами данных обмениваются слои**.

IoC-контейнер описывает, **как всё это собрать вместе**.