import numpy as np
from typing import List, Optional, Dict, Tuple
from lab_nn_framework.core.layers import Layer
from lab_nn_framework.core.losses import Loss
from lab_nn_framework.core.optimizers import Optimizer
from lab_nn_framework.utils.data_utils import minibatch_generator


class SequentialModel:
    
    def __init__(self, layers: List[Layer]):
        self.layers = layers
        self.loss_function: Optional[Loss] = None
        self.optimizer: Optional[Optimizer] = None
        self.is_compiled = False
        self.history: Dict[str, List[float]] = {
            'loss': [],
            'val_loss': []
        }
    
    def compile(self, loss: Loss, optimizer: Optimizer):
        self.loss_function = loss
        self.optimizer = optimizer
        self.is_compiled = True
    
    def forward(self, X: np.ndarray) -> np.ndarray:
        current_output = X
        for layer in self.layers:
            current_output = layer.forward(current_output)
        return current_output
    
    def backward(self, loss_gradient: np.ndarray):
        grad = loss_gradient
        for layer in reversed(self.layers):
            grad = layer.backward(grad)
    
    def train_step(self, X_batch: np.ndarray, y_batch: np.ndarray) -> float:
        if not self.is_compiled:
            raise RuntimeError("Модель не скомпилирована. Вызовите model.compile().")
        
        predictions = self.forward(X_batch)
        loss_value = self.loss_function.forward(predictions, y_batch)
        
        loss_gradient = self.loss_function.backward()
        
        self.backward(loss_gradient)
        
        self.optimizer.apply_gradients(self.layers)
        
        return loss_value
    
    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        epochs: int,
        batch_size: int = 32,
        shuffle: bool = True,
        validation_data: Optional[Tuple[np.ndarray, np.ndarray]] = None,
        verbose: bool = True,
        use_console_viz: bool = False
    ) -> Dict[str, List[float]]:
        if not self.is_compiled:
            raise RuntimeError("Модель не скомпилирована. Вызовите model.compile().")
        
        n_samples = X.shape[0]
        self.history = {'loss': [], 'val_loss': []}
        
        do_validation = validation_data is not None
        if do_validation:
            X_val, y_val = validation_data
        

        
        for epoch in range(epochs):
            # Перемешивание данных
            if shuffle:
                indices = np.random.permutation(n_samples)
                X = X[indices]
                y = y[indices]
            
            total_loss = 0.0
            num_batches = 0
            
            for X_batch, y_batch in minibatch_generator(X, y, batch_size, shuffle=False):
                batch_loss = self.train_step(X_batch, y_batch)
                total_loss += batch_loss
                num_batches += 1
            
            avg_loss = total_loss / num_batches
            self.history['loss'].append(avg_loss)
            
            if do_validation:
                val_predictions = self.forward(X_val)
                val_loss = self.loss_function.forward(val_predictions, y_val)
                self.history['val_loss'].append(val_loss)
                
                if verbose:
                    print(f"Epoch {epoch+1:3d}/{epochs} - "
                          f"loss: {avg_loss:.6f} - "
                          f"val_loss: {val_loss:.6f}")
            else:
                if verbose:
                    print(f"Epoch {epoch+1:3d}/{epochs} - "
                          f"loss: {avg_loss:.6f}")
            
        return self.history
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.forward(X)
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> float:
        predictions = self.forward(X)
        return self.loss_function.forward(predictions, y)
    
    def predict_classes(self, X: np.ndarray) -> np.ndarray:
        predictions = self.forward(X)
        return np.argmax(predictions, axis=1)
    
    def accuracy(self, X: np.ndarray, y: np.ndarray) -> float:
        predictions = self.predict_classes(X)
        
        if len(y.shape) > 1:
            y = np.argmax(y, axis=1)
        
        return np.mean(predictions == y)
    
    def summary(self):
        
        total_params = 0
        for i, layer in enumerate(self.layers):
            layer_name = layer.__class__.__name__
            params = sum(w.size for w in layer.trainable_weights)
            total_params += params
            
            if hasattr(layer, 'weights'):
                print(f"Layer {i}: {layer_name} "
                      f"({layer.weights.shape[0]} -> {layer.weights.shape[1]}) "
                      f"- {params} params")
            else:
                print(f"Layer {i}: {layer_name} - {params} params")
        
        print("="*50)
        print(f"Total trainable parameters: {total_params}")
        print("="*50 + "\n")
    
    def _get_model_name(self) -> str:
        layer_names = [layer.__class__.__name__ for layer in self.layers]
        return " -> ".join(layer_names)
    
    def __repr__(self) -> str:
        return f"SequentialModel([{', '.join(str(l) for l in self.layers)}])"