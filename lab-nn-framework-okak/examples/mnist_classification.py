import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from lab_nn_framework.core.layers import Dense
from lab_nn_framework.core.activations import ReLU, Softmax
from lab_nn_framework.core.losses import SoftmaxCrossEntropyLoss
from lab_nn_framework.core.optimizers import Adam
from lab_nn_framework.core.model import SequentialModel
from lab_nn_framework.utils.data_utils import train_test_split, normalize_data, one_hot_encode


def generate_synthetic_digits(n_samples: int = 1000) -> tuple:
    np.random.seed(42)
    

    n_features = 784  # 28x28
    n_classes = 10
    

    centers = np.random.randn(n_classes, n_features) * 0.5
    

    X = np.zeros((n_samples, n_features))
    y = np.zeros(n_samples, dtype=int)
    
    samples_per_class = n_samples // n_classes
    
    for i in range(n_classes):
        start_idx = i * samples_per_class
        end_idx = start_idx + samples_per_class
        

        X[start_idx:end_idx] = centers[i] + np.random.randn(samples_per_class, n_features) * 0.3
        y[start_idx:end_idx] = i
    

    X = np.tanh(X)
    

    X = (X - X.min()) / (X.max() - X.min())
    
    return X, y


def main(): 
    print("\n[1] Генерация синтетических данных")
    X, y_raw = generate_synthetic_digits(n_samples=2000)
    
    y = one_hot_encode(y_raw, num_classes=10)
    
    print(f"    Сгенерировано образцов: {len(X)}")
    print(f"    Размерность: {X.shape[1]} признаков (28x28 пикселей)")
    print(f"    Классов: 10 (цифры 0-9)")
    

    print("\n[2] Подготовка данных")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"    Обучающая выборка: {X_train.shape}")
    print(f"    Тестовая выборка: {X_test.shape}")
    

    print("\n[3] Создание нейросети")
    model = SequentialModel([
        Dense(784, 128),  
        ReLU(),
        Dense(128, 64),   
        ReLU(),
        Dense(64, 10)   
    ])
    
    model.summary()
    
    print("[4] Компиляция модели...")
    model.compile(
        loss=SoftmaxCrossEntropyLoss(),
        optimizer=Adam(learning_rate=0.001)
    )
    
    print("\n[5] Обучение модели...")
    print("-"*50)
    
    history = model.fit(
        X_train, y_train,
        epochs=100,
        batch_size=32,
        validation_data=(X_test, y_test),
        verbose=True,
        use_console_viz=True
    )
    

    print("\n[6] Оценка качества")
    train_accuracy = model.accuracy(X_train, y_train)
    test_accuracy = model.accuracy(X_test, y_test)
    
    print(f"    Точность на обучении: {train_accuracy:.2%}")
    print(f"    Точность на тесте: {test_accuracy:.2%}")
    

if __name__ == "__main__":
    main()