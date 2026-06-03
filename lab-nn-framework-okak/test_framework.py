#!/usr/bin/env python3
"""
Скрипт для проверки работоспособности всех компонентов фреймворка.
Запуск: python test_framework.py
"""

import numpy as np
import sys
import os

def test_imports():
    try:
        from lab_nn_framework.core.initializers import (
            HeInitializer, XavierInitializer, ZerosInitializer
        )
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.core.layers import Dense, Layer
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.core.activations import ReLU, Sigmoid, Tanh, Softmax
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.core.losses import MSE, CrossEntropyLoss, SoftmaxCrossEntropyLoss, BinaryCrossEntropyLoss
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.core.optimizers import SGD, MomentumSGD, Adam, GradientClipping
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.core.model import SequentialModel
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.utils.data_utils import (
            minibatch_generator, train_test_split, normalize_data, one_hot_encode
        )
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.utils.text_features import TextFeatureExtractor
    except Exception as e:
        return False
    
    try:
        from lab_nn_framework.datasets.text_datasets import load_fake_news_dataset
    except Exception as e:
        return False
    
    return True


def test_layers():
    
    from lab_nn_framework.core.layers import Dense
    from lab_nn_framework.core.activations import ReLU, Sigmoid, Tanh, Softmax
    
    try:
        layer = Dense(4, 3)
        X = np.random.randn(2, 4)
        output = layer.forward(X)
        assert output.shape == (2, 3), f"Ожидалась форма (2, 3), получили {output.shape}"
        print(f"Вход: {X.shape}, Выход: {output.shape}")
        
        grad = np.random.randn(2, 3)
        grad_input = layer.backward(grad)
        assert grad_input.shape == (2, 4), f"Ожидалась форма (2, 4), получили {grad_input.shape}"
        assert len(layer.gradients) == 2
        assert layer.gradients[0].shape == (4, 3) 
        assert layer.gradients[1].shape == (1, 3) 
        print(f"Градиенты: веса {layer.gradients[0].shape}, смещения {layer.gradients[1].shape}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    for name, activation in [("ReLU", ReLU()), ("Sigmoid", Sigmoid()), 
                              ("Tanh", Tanh()), ("Softmax", Softmax())]:
        try:
            X = np.random.randn(3, 5)
            output = activation.forward(X)
            assert output.shape == X.shape, f"Не совпадают формы: {output.shape} != {X.shape}"
            
            grad = np.ones_like(output)
            grad_input = activation.backward(grad)
            assert grad_input.shape == X.shape
            
            print(f"{name}: вход {X.shape} -- выход {output.shape}")
        except Exception as e:
            print(f"{name}: {e}")
            return False
    
    return True


def test_losses():
    from lab_nn_framework.core.losses import MSE, CrossEntropyLoss, SoftmaxCrossEntropyLoss, BinaryCrossEntropyLoss
    
    batch_size = 4
    try:
        loss_fn = MSE()
        y_pred = np.random.randn(batch_size, 3)
        y_true = np.random.randn(batch_size, 3)
        
        loss_value = loss_fn.forward(y_pred, y_true)
        assert isinstance(loss_value, float) or isinstance(loss_value, np.floating)
        
        grad = loss_fn.backward()
        assert grad.shape == y_pred.shape
        print(f"loss={loss_value:.6f}, градиент формы {grad.shape}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        loss_fn = SoftmaxCrossEntropyLoss()
        y_pred = np.random.randn(batch_size, 5)
        y_true = np.zeros((batch_size, 5))
        y_true[np.arange(batch_size), np.random.randint(0, 5, batch_size)] = 1.0
        
        loss_value = loss_fn.forward(y_pred, y_true)
        assert isinstance(loss_value, float) or isinstance(loss_value, np.floating)
        
        grad = loss_fn.backward()
        assert grad.shape == y_pred.shape
        print(f"loss={loss_value:.6f}, градиент формы {grad.shape}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        loss_fn = BinaryCrossEntropyLoss()
        y_pred = np.random.random((batch_size, 1))
        y_true = np.random.randint(0, 2, (batch_size, 1)).astype(float)
        
        loss_value = loss_fn.forward(y_pred, y_true)
        grad = loss_fn.backward()
        assert grad.shape == y_pred.shape
        print(f"loss={loss_value:.6f}, градиент формы {grad.shape}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    return True


def test_optimizers():
    from lab_nn_framework.core.layers import Dense
    from lab_nn_framework.core.optimizers import SGD, MomentumSGD, Adam, GradientClipping
    
    for name, opt in [("SGD", SGD(0.01)), 
                       ("MomentumSGD", MomentumSGD(0.01, 0.9)),
                       ("Adam", Adam(0.01)),
                       ("GradientClipping+SGD", GradientClipping(SGD(0.01), 1.0))]:
        try:
            layer = Dense(4, 3)
            
            X = np.random.randn(2, 4)
            layer.forward(X)
            layer.backward(np.random.randn(2, 3))
            
            # Сохраняем веса до обновления
            weights_before = layer.weights.copy()
            
            # Применяем оптимизатор
            opt.apply_gradients([layer])
            
            # Проверяем, что веса изменились
            assert not np.array_equal(weights_before, layer.weights)
            
            print(f"{name}: веса обновлены")
        except Exception as e:
            print(f"{name}: {e}")
            return False
    
    return True


def test_model():
    from lab_nn_framework.core.layers import Dense
    from lab_nn_framework.core.activations import ReLU, Sigmoid
    from lab_nn_framework.core.losses import MSE
    from lab_nn_framework.core.optimizers import SGD
    from lab_nn_framework.core.model import SequentialModel
    
    try:
        model = SequentialModel([
            Dense(4, 8),
            ReLU(),
            Dense(8, 1),
            Sigmoid()
        ])
        
        model.compile(loss=MSE(), optimizer=SGD(0.01))
        print("Модель создана и скомпилирована")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        X = np.random.randn(10, 4)
        predictions = model.forward(X)
        assert predictions.shape == (10, 1)
        print(f"Вход: {X.shape}, Выход: {predictions.shape}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        X_batch = np.random.randn(4, 4)
        y_batch = np.random.randn(4, 1)
        loss = model.train_step(X_batch, y_batch)
        print(f"loss = {loss:.6f}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        X = np.random.randn(100, 4)
        y = np.sum(X, axis=1, keepdims=True) * 0.5 + 0.1
        
        history = model.fit(X, y, epochs=5, batch_size=16, verbose=False)
        assert len(history['loss']) == 5
        assert history['loss'][0] > history['loss'][-1]
        
        print(f"Эпох: {len(history['loss'])}, "
              f"loss: {history['loss'][0]:.4f} -> {history['loss'][-1]:.4f}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    return True


def test_data_utils():
    from lab_nn_framework.utils.data_utils import (
        minibatch_generator, train_test_split, normalize_data, one_hot_encode
    )
    try:
        X = np.random.randn(100, 5)
        y = np.random.randn(100, 2)
        
        batches = list(minibatch_generator(X, y, batch_size=32))
        assert len(batches) == 4 
        assert batches[0][0].shape[0] == 32
        assert batches[-1][0].shape[0] == 4  
        
        total_samples = sum(b[0].shape[0] for b in batches)
        assert total_samples == 100
        print(f"Батчей: {len(batches)}, всего образцов: {total_samples}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    try:
        X = np.random.randn(200, 10)
        y = np.random.randn(200, 3)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3)
        assert len(X_train) == 140
        assert len(X_test) == 60
        assert len(y_train) == 140
        assert len(y_test) == 60
        print(f"train: {X_train.shape}, test: {X_test.shape}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        X = np.random.randn(50, 5) * 10 + 5
        X_norm, params = normalize_data(X, mode='standard')
        
        assert abs(np.mean(X_norm)) < 0.1
        assert abs(np.std(X_norm) - 1.0) < 0.2
        print(f"mean={np.mean(X_norm):.6f}, std={np.std(X_norm):.6f}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    try:
        labels = np.array([0, 2, 1, 0, 3])
        one_hot = one_hot_encode(labels, num_classes=4)
        assert one_hot.shape == (5, 4)
        assert np.array_equal(one_hot[0], [1, 0, 0, 0])
        assert np.array_equal(one_hot[4], [0, 0, 0, 1])
        print(f"{labels} -> \n{one_hot}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    return True


def test_text_features():
    from lab_nn_framework.utils.text_features import TextFeatureExtractor
    
    try:
        extractor = TextFeatureExtractor()
        
        texts = [
            "Обычный заголовок новости",
            "ШОК!!! СЕНСАЦИЯ! Вы не поверите!!!"
        ]
        
        features = extractor.extract_features(texts)
        assert features.shape == (2, 8)
        
        assert features[0][1] < features[1][1]  
        assert features[0][2] < features[1][2]  
        
        print(f"Извлечено признаков: {features.shape}")
        print(f"Признаки текста 1: {features[0]}")
        print(f"Признаки текста 2: {features[1]}")
    except Exception as e:
        print(f"Ошибка: {e}")
        return False
    
    return True


def test_iris_example():
    try:
        sys.path.insert(0, os.path.dirname(__file__))
        from examples.iris_classification import load_iris_data
        
        X, y = load_iris_data()
        assert X.shape == (150, 4)
        assert len(y) == 150
        assert len(np.unique(y)) == 3
        
        print(f"Данные загружены: {X.shape}, классов: {len(np.unique(y))}")
        
        from lab_nn_framework.core.layers import Dense
        from lab_nn_framework.core.activations import ReLU
        from lab_nn_framework.core.losses import SoftmaxCrossEntropyLoss
        from lab_nn_framework.core.optimizers import Adam
        from lab_nn_framework.core.model import SequentialModel
        from lab_nn_framework.utils.data_utils import train_test_split, normalize_data, one_hot_encode
        
        y_onehot = one_hot_encode(y, 3)
        X_norm, _ = normalize_data(X, 'standard')
        X_train, X_test, y_train, y_test = train_test_split(X_norm, y_onehot, test_size=0.2)
        
        model = SequentialModel([
            Dense(4, 8),
            ReLU(),
            Dense(8, 3)
        ])
        
        model.compile(loss=SoftmaxCrossEntropyLoss(), optimizer=Adam(0.01))
        
        history = model.fit(X_train, y_train, epochs=10, batch_size=16, verbose=False)
        
        assert len(history['loss']) == 10
        print(f"Модель обучена: loss {history['loss'][0]:.4f} -> {history['loss'][-1]:.4f}")
        
    except Exception as e:
        print(f"Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


def main():
    tests = [
        ("Импорты", test_imports),
        ("Слои", test_layers),
        ("Функции потерь", test_losses),
        ("Оптимизаторы", test_optimizers),
        ("Модель", test_model),
        ("Утилиты данных", test_data_utils),
        ("Текстовые признаки", test_text_features),
        ("Пример Iris", test_iris_example)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"ошибка в тесте {name}: {e}")
            results.append((name, False))

    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)