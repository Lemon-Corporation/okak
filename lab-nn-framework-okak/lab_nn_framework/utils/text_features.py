import numpy as np
from typing import List, Set


class TextFeatureExtractor:
    
    def __init__(self):
        self.emotional_words: Set[str] = {
            'шок', 'сенсация', 'кошмар', 'ужас', 'невероятно',
            'потрясающе', 'шокирует', 'взрыв', 'катастрофа',
            'экстренно', 'срочно', 'трагедия', 'паника'
        }
        
        self.clickbait_phrases: Set[str] = {
            'вы не поверите', 'секрет', 'тайна', 'разоблачение',
            'правда о', 'что скрывают', 'удивительный', 'неожиданный',
            'шокирующая правда', 'врачи молчат', 'ученые скрывают',
            'это взорвало интернет', 'вы будете в шоке'
        }
        
        self.feature_names = [
            'text_length',
            'caps_ratio',
            'exclamation_count',
            'question_count',
            'emotional_words',
            'clickbait_phrases',
            'number_count',
            'avg_word_length'
        ]
    
    def extract_features(self, texts: List[str]) -> np.ndarray:
        features = []
        
        for text in texts:
            feat = [
                len(text),
                
                sum(1 for c in text if c.isupper()) / max(len(text), 1),
                
                text.count('!'),
                
                text.count('?'),
                
                sum(1 for word in self.emotional_words if word in text.lower()),
                
                sum(1 for phrase in self.clickbait_phrases if phrase in text.lower()),
                
                sum(1 for c in text if c.isdigit()),
                
                np.mean([len(w) for w in text.split()]) if text.split() else 0.0
            ]
            features.append(feat)
        
        return np.array(features, dtype=np.float32)
    
    def get_feature_names(self) -> List[str]:
        return self.feature_names
    
    def add_custom_words(self, emotional: List[str] = None, clickbait: List[str] = None):
        if emotional:
            self.emotional_words.update(emotional)
        if clickbait:
            self.clickbait_phrases.update(clickbait)