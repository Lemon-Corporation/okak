import numpy as np
from lab_nn_framework.core.initializers import Initializer, HeInitializer, ZerosInitializer


class Layer:

    def __init__(self):
        self.input = None         
        self.output = None        
        self._trainable_weights = [] 
        self._gradients = []        

    def forward(self, input_data: np.ndarray) -> np.ndarray:
        raise NotImplementedError("Подклассы должны реализовать forward")

    def backward(self, output_gradient: np.ndarray) -> np.ndarray:
        raise NotImplementedError("Подклассы должны реализовать backward")

    @property
    def trainable_weights(self) -> list:
        return self._trainable_weights

    @property
    def gradients(self) -> list:
        return self._gradients


class Dense(Layer):

    def __init__(self, 
                 input_size: int, 
                 output_size: int,
                 weight_initializer: Initializer = HeInitializer(),
                 bias_initializer: Initializer = ZerosInitializer()):
        super().__init__()
        

        self.weights = weight_initializer((input_size, output_size))
        self.biases = bias_initializer((1, output_size))
        

        self._trainable_weights = [self.weights, self.biases]
        self._gradients = [np.zeros_like(self.weights), np.zeros_like(self.biases)]

    def forward(self, input_data: np.ndarray) -> np.ndarray:

        self.input = input_data
        self.output = np.dot(input_data, self.weights) + self.biases
        return self.output

    def backward(self, output_gradient: np.ndarray) -> np.ndarray:


        self._gradients[0] = np.dot(self.input.T, output_gradient)
        

        self._gradients[1] = np.sum(output_gradient, axis=0, keepdims=True)
        

        return np.dot(output_gradient, self.weights.T)

    def __repr__(self) -> str:
        return f"Dense(input_size={self.weights.shape[0]}, output_size={self.weights.shape[1]})"