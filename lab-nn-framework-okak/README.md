# Лабораторная работа по курсу "Искусственный интеллект"
# Создание своего нейросетевого фреймворка — **okak**

### Студенты:

| ФИО        | Роль в проекте                                                                                      | Оценка |
|------------|-----------------------------------------------------------------------------------------------------|--------|
| Ганяк      | Руководил проектом: постановка архитектуры, разработка `SequentialModel`, функций потерь и примеров |        |
| Никольский | Программировал ядро фреймворка: слои, функции активации, инициализаторы весов, утилиты данных       |        |
| Пинчук     | Программировал оптимизаторы (SGD, MomentumSGD, Adam, GradientClipping) и детектор фейков            |        |

> *Комментарии проверяющего*

---

## Соответствие требованиям

| Требование | Реализация | Статус |
|---|---|---|
| Создание многослойной нейросети перечислением слоёв | `SequentialModel([Dense(...), ReLU(), ...])` | ✅ |
| Удобный набор функций для работы с данными | `minibatch_generator`, `train_test_split`, `normalize_data`, `one_hot_encode` | ✅ |
| Не менее 3 алгоритмов оптимизации | SGD, MomentumSGD, Adam, GradientClipping — 4 штуки | ✅ |
| Передаточные функции и функции потерь | ReLU, Sigmoid, Tanh, Softmax + MSE, CrossEntropy, BinaryCrossEntropy | ✅ |
| Обучение "в несколько строк" | `model.compile(...)` + `model.fit(...)` | ✅ |
| 2–3 примера на классических задачах | Iris, MNIST-like, **Детектор фейков** | ✅ |
| Документация README.md | Данный файл | ✅ |

**Оригинальная особенность:** детектор фейковых новостей на русском языке — пример, не встречающийся в стандартных учебных работах. Модель анализирует текстовые признаки (доля заглавных букв, восклицательные знаки, кликбейтные фразы, эмоциональные слова) и классифицирует заголовки как фейк или правда.

---

## Структура проекта

```
lab_nn_framework/
├── core/
│   ├── layers.py          — Dense-слой (forward/backward, градиенты)
│   ├── activations.py     — ReLU, Sigmoid, Tanh, Softmax
│   ├── losses.py          — MSE, CrossEntropyLoss, SoftmaxCrossEntropyLoss, BinaryCrossEntropyLoss
│   ├── model.py           — SequentialModel (compile / fit / predict / evaluate / accuracy)
│   ├── optimizers.py      — SGD, MomentumSGD, Adam, GradientClipping
│   └── initializers.py    — He, Xavier, RandomNormal, Zeros, Ones
├── utils/
│   ├── data_utils.py      — minibatch_generator, train_test_split, normalize_data, one_hot_encode
│   └── text_features.py   — TextFeatureExtractor (8 признаков для текста на русском)
└── datasets/
    └── text_datasets.py   — load_fake_news_dataset

examples/
├── iris_classification.py     — классификация цветов Iris (3 класса, ~95% точности)
├── mnist_classification.py    — классификация синтетических MNIST-цифр (10 классов)
└── fake_news_detector.py      — детектор фейков по заголовкам на русском языке

data/
└── fake_news/
    ├── real_news.txt
    └── fake_news.txt
```

---

## Быстрый старт

```bash
pip install -r requirements.txt
```

### Пример: обучить нейросеть за несколько строк

```python
from lab_nn_framework.core.layers import Dense
from lab_nn_framework.core.activations import ReLU
from lab_nn_framework.core.losses import SoftmaxCrossEntropyLoss
from lab_nn_framework.core.optimizers import Adam
from lab_nn_framework.core.model import SequentialModel

model = SequentialModel([
    Dense(4, 16),
    ReLU(),
    Dense(16, 8),
    ReLU(),
    Dense(8, 3)
])

model.compile(
    loss=SoftmaxCrossEntropyLoss(),
    optimizer=Adam(learning_rate=0.01)
)

history = model.fit(X_train, y_train, epochs=200, batch_size=16,
                    validation_data=(X_test, y_test))

print(f"Точность: {model.accuracy(X_test, y_test):.2%}")
```

---

## Компоненты фреймворка

### Слои (`lab_nn_framework.core.layers`)

**`Dense(input_size, output_size, weight_initializer, bias_initializer)`**  
Полносвязный слой. Реализует прямой проход (`y = Wx + b`) и обратный проход (вычисление градиентов по весам и входу).

### Функции активации (`lab_nn_framework.core.activations`)

| Класс | Формула |
|-------|---------|
| `ReLU` | max(0, x) |
| `Sigmoid` | 1 / (1 + e^−x), численно стабильная реализация |
| `Tanh` | (e^x − e^−x) / (e^x + e^−x) |
| `Softmax` | e^xᵢ / Σe^xⱼ, с полным якобианом в backward |

### Функции потерь (`lab_nn_framework.core.losses`)

| Класс | Применение |
|-------|-----------|
| `MSE` | Регрессия |
| `CrossEntropyLoss` | Мультиклассовая классификация |
| `SoftmaxCrossEntropyLoss` | То же, но softmax объединён с loss (численно стабильно) |
| `BinaryCrossEntropyLoss` | Бинарная классификация |

### Оптимизаторы (`lab_nn_framework.core.optimizers`)

| Класс | Описание |
|-------|---------|
| `SGD(learning_rate)` | Стохастический градиентный спуск |
| `MomentumSGD(learning_rate, momentum)` | SGD с накоплением импульса |
| `Adam(learning_rate, beta1, beta2, epsilon)` | Адаптивная оценка моментов |
| `GradientClipping(base_optimizer, max_norm)` | Обёртка над любым оптимизатором, ограничивает норму градиента |

Пример с GradientClipping поверх Adam:
```python
optimizer = GradientClipping(Adam(learning_rate=0.01), max_norm=1.0)
```

### Инициализаторы весов (`lab_nn_framework.core.initializers`)

`HeInitializer` (по умолчанию для Dense), `XavierInitializer`, `RandomNormalInitializer`, `ZerosInitializer`, `OnesInitializer`.

### Утилиты данных (`lab_nn_framework.utils.data_utils`)

```python
from lab_nn_framework.utils.data_utils import (
    minibatch_generator,   # итератор по мини-батчам
    train_test_split,      # разбивка на train/test
    normalize_data,        # стандартизация или min-max нормализация
    one_hot_encode         # one-hot кодирование меток
)

# Перебор мини-батчей вручную
for X_batch, y_batch in minibatch_generator(X, y, batch_size=32, shuffle=True):
    loss = model.train_step(X_batch, y_batch)

# Нормализация
X_norm, params = normalize_data(X, mode='standard')   # или mode='minmax'
```

---

## Примеры

### 1. Классификация Iris (`examples/iris_classification.py`)

150 образцов, 4 признака, 3 класса. Сеть: `Dense(4,16) → ReLU → Dense(16,8) → ReLU → Dense(8,3)`.  
Оптимизатор: Adam. Достигаемая точность на тесте: **~95%**.

```bash
python examples/iris_classification.py
```

### 2. MNIST-подобная задача (`examples/mnist_classification.py`)

2000 синтетических образцов с 784 признаками (28×28), 10 классов.  
Сеть: `Dense(784,128) → ReLU → Dense(128,64) → ReLU → Dense(64,10)`.

```bash
python examples/mnist_classification.py
```

### 3. Детектор фейковых новостей (`examples/fake_news_detector.py`)

Оригинальный пример. Из текста заголовка на русском извлекаются 8 признаков:
- длина текста
- доля заглавных букв
- число восклицательных знаков
- число вопросительных знаков
- число эмоциональных слов (шок, срочно, катастрофа…)
- число кликбейтных фраз (вы не поверите, что скрывают…)
- число чисел в тексте
- средняя длина слова

Модель обучается на собственном датасете (`data/fake_news/`). Поддерживает интерактивный ввод заголовков.

```bash
python examples/fake_news_detector.py
```

Пример работы:
```
Заголовок: "ШОК!!! Знаменитости скрывают этот секрет красоты!"
Вердикт: фейк
Уверенность: 94.3%
Признаки фейка:  3 воскл. знаков,  Много ЗАГЛАВНЫХ букв,  Эмоциональные слова,  Кликбейтные фразы

Заголовок: "В городской библиотеке прошла выставка редких книг"
Вердикт: правда
Уверенность: 88.7%
```

---

## Установка

```bash
git clone <репозиторий>
cd lab-nn-framework-okak
pip install -r requirements.txt
# или установить как пакет
pip install -e .
```

**Зависимости:** только `numpy`. Никаких PyTorch, TensorFlow или других ML-библиотек.
