
import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from lab_nn_framework.core.layers import Dense
from lab_nn_framework.core.activations import ReLU, Sigmoid
from lab_nn_framework.core.losses import BinaryCrossEntropyLoss
from lab_nn_framework.core.optimizers import Adam, GradientClipping
from lab_nn_framework.core.model import SequentialModel
from lab_nn_framework.utils.text_features import TextFeatureExtractor
from lab_nn_framework.utils.data_utils import train_test_split
from lab_nn_framework.datasets.text_datasets import load_fake_news_dataset


def main():
    X, y, real_titles, fake_titles = load_fake_news_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = SequentialModel([
        Dense(8, 16),   
        ReLU(),
        Dense(16, 8),
        ReLU(),
        Dense(8, 1),    
        Sigmoid()       
    ])
    
    model.summary()
    
    model.compile(
        loss=BinaryCrossEntropyLoss(),
        optimizer=GradientClipping(
            Adam(learning_rate=0.01),
            max_norm=1.0
        )
    )

    

    history = model.fit(
        X_train, y_train,
        epochs=300,
        batch_size=4,
        validation_data=(X_test, y_test),
        verbose=True,
        use_console_viz=True
    )
    


    predictions = model.predict(X_test)
    test_accuracy = np.mean((predictions > 0.5) == (y_test > 0.5))


    
    extractor = TextFeatureExtractor()
    
    test_headlines = [
        "ШОК!!! Знаменитости скрывают этот секрет красоты!",
        "В городской библиотеке прошла выставка редких книг",
        "СРОЧНО! Этот продукт убивает! Вы не поверите!!!",
        "Ученые опубликовали результаты исследования климата",
        "ТАЙНА БЕРМУДСКОГО ТРЕУГОЛЬНИКА РАСКРЫТА!!!",
        "Депутаты обсудили законопроект о защите окружающей среды"
    ]
    
    for headline in test_headlines:
        features = extractor.extract_features([headline])
        fake_prob = model.predict(features)[0][0]
        
        if fake_prob > 0.5:
            verdict = "фейк"
            confidence = fake_prob
        else:
            verdict = "правда"
            confidence = 1.0 - fake_prob
        
        print(f"\n    Заголовок: \"{headline}\"")
        print(f"    Вердикт: {verdict}")
        print(f"    Уверенность: {confidence:.2%}")
        
        f = features[0]
        warnings = []
        if f[2] > 0: 
            warnings.append(f" {int(f[2])} воскл. знаков")
        if f[1] > 0.3:  
            warnings.append(f" Много ЗАГЛАВНЫХ букв")
        if f[4] > 0: 
            warnings.append(f" Эмоциональные слова")
        if f[5] > 0:  
            warnings.append(f" Кликбейтные фразы")
        
        if warnings:
            print(f"    Признаки фейка: {', '.join(warnings)}")
    
    

    
    while True:
        user_input = input("\n Заголовок: ").strip()
        
        if user_input.lower() == 'quit':
            break
        
        if not user_input:
            continue
        
        features = extractor.extract_features([user_input])
        fake_prob = model.predict(features)[0][0]
        
        if fake_prob > 0.7:
            verdict = "скорее всего фейк"
        elif fake_prob > 0.5:
            verdict = "подозрительно"
        elif fake_prob > 0.3:
            verdict = "скорее всего правда"
        else:
            verdict = "похоже на правду"
        
        print(f" Результат: {verdict}")
        print(f" Вероятность фейка: {fake_prob:.2%}")


if __name__ == "__main__":
    main()