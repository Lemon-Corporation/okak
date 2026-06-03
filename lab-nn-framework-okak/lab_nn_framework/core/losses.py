import numpy as np


class Loss:
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        raise NotImplementedError

    def backward(self) -> np.ndarray:
        raise NotImplementedError


class MSE(Loss):
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        self.y_pred = y_pred
        self.y_true = y_true
        return np.mean(np.square(y_pred - y_true))

    def backward(self) -> np.ndarray:
        batch_size = self.y_pred.shape[0]
        return 2.0 * (self.y_pred - self.y_true) / batch_size

    def __repr__(self) -> str:
        return "MSE()"


class CrossEntropyLoss(Loss):
    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        self.y_pred = y_pred
        self.y_true = y_true
        
        # Вычисляем softmax численно стабильно
        shifted = y_pred - np.max(y_pred, axis=1, keepdims=True)
        exps = np.exp(shifted)
        softmax = exps / np.sum(exps, axis=1, keepdims=True)
        
        # Защита от log(0)
        softmax = np.clip(softmax, 1e-15, 1.0 - 1e-15)
        
        # Кросс-энтропия
        loss = -np.sum(y_true * np.log(softmax)) / y_pred.shape[0]
        return loss

    def backward(self) -> np.ndarray:

        shifted = self.y_pred - np.max(self.y_pred, axis=1, keepdims=True)
        exps = np.exp(shifted)
        softmax = exps / np.sum(exps, axis=1, keepdims=True)
        batch_size = self.y_pred.shape[0]
        return (softmax - self.y_true) / batch_size

    def __repr__(self) -> str:
        return "CrossEntropyLoss()"


class SoftmaxCrossEntropyLoss(Loss):
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        self.y_pred = y_pred
        self.y_true = y_true
        
        shifted = y_pred - np.max(y_pred, axis=1, keepdims=True)
        exps = np.exp(shifted)
        self.softmax = exps / np.sum(exps, axis=1, keepdims=True)
        

        softmax_clipped = np.clip(self.softmax, 1e-15, 1.0 - 1e-15)
        

        loss = -np.sum(y_true * np.log(softmax_clipped)) / y_pred.shape[0]
        return loss

    def backward(self) -> np.ndarray:

        batch_size = self.y_pred.shape[0]
        return (self.softmax - self.y_true) / batch_size

    def __repr__(self) -> str:
        return "SoftmaxCrossEntropyLoss()"


class BinaryCrossEntropyLoss(Loss):

    
    def forward(self, y_pred: np.ndarray, y_true: np.ndarray) -> float:
        self.y_pred = np.clip(y_pred, 1e-15, 1.0 - 1e-15)
        self.y_true = y_true
        loss = -np.mean(
            y_true * np.log(self.y_pred) + 
            (1.0 - y_true) * np.log(1.0 - self.y_pred)
        )
        return loss

    def backward(self) -> np.ndarray:
        batch_size = self.y_pred.shape[0]
        return -(self.y_true / self.y_pred - (1.0 - self.y_true) / (1.0 - self.y_pred)) / batch_size

    def __repr__(self) -> str:
        return "BinaryCrossEntropyLoss()"