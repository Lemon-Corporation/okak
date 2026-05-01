# Auth

> Prefix: `/api/v1/auth`  
> Публичные ендпоинты — токен не нужен.

---

## POST `/auth/register`

Регистрация нового пользователя.

**Body**
```json
{
  "email": "user@example.com",
  "password": "минимум8символов",
  "display_name": "Иван Иванов"
}
```

**Логика**
1. Проверить уникальность email → `409 email_taken` если занят
2. Хешировать пароль (bcrypt)
3. Создать запись в `users`
4. Выдать JWT

**Response 201**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Иван Иванов",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

## POST `/auth/login`

Вход по email и паролю.

**Body**
```json
{ "email": "user@example.com", "password": "пароль" }
```

**Логика**
1. Найти пользователя по email
2. Проверить bcrypt хеш
3. Выдать JWT

**Response 200** — та же структура что и register.  
**Ошибки:** `401 invalid_credentials`

---

## GET `/auth/me`

Профиль текущего пользователя. Требует Bearer токен.

**Response 200**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "Иван Иванов",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## PATCH `/auth/me`

Обновить профиль. Все поля опциональны.

**Body**
```json
{
  "display_name": "Новое имя",
  "password": "новый пароль"
}
```

**Логика**
- Если передан `password` — перехешировать и сохранить
- Обновить `updated_at`

**Response 200** — обновлённый объект пользователя.

---

## JWT

Токен живёт 7 дней (настраивается `ACCESS_TOKEN_EXPIRE_MINUTES` в `.env`).  
Payload содержит только `{ "sub": "<user_id>", "exp": <timestamp> }`.  
Передавать в заголовке: `Authorization: Bearer <token>`
