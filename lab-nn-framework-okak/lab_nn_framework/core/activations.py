import numpy as np
from lab_nn_framework.core.layers import Layer


class ReLU(Layer):
    def forward(self, input_data: np.ndarray) -> np.ndarray:
        self.input = input_data
        self.output = np.maximum(0, input_data)
        return self.output

    def backward(self, output_gradient: np.ndarray) -> np.ndarray:
        """
        Производная ReLU: f'(x) = 1 если x > 0, иначе 0
        """
        return output_gradient * (self.input > 0)

    def __repr__(self) -> str:
        return "ReLU()"


class Sigmoid(Layer):
    
    def forward(self, input_data: np.ndarray) -> np.ndarray:
        self.input = input_data
        self.output = np.where(
            input_data >= 0,
            1.0 / (1.0 + np.exp(-np.clip(input_data, -500, 500))),
            np.exp(np.clip(input_data, -500, 500)) / (1.0 + np.exp(np.clip(input_data, -500, 500)))
        )
        return self.output

    def backward(self, output_gradient: np.ndarray) -> np.ndarray:
        return output_gradient * self.output * (1.0 - self.output)

    def __repr__(self) -> str:
        return "Sigmoid()"


class Tanh(Layer):

    
    def forward(self, input_data: np.ndarray) -> np.ndarray:
        self.input = input_data
        self.output = np.tanh(input_data)
        return self.output

    def backward(self, output_gradient: np.ndarray) -> np.ndarray:
        return output_gradient * (1.0 - self.output ** 2)

    def __repr__(self) -> str:
        return "Tanh()"


class Softmax(Layer):
    def forward(self, input_data: np.ndarray) -> np.ndarray:
        self.input = input_data
        shifted = input_data - np.max(input_data, axis=1, keepdims=True)
        exps = np.exp(shifted)
        self.output = exps / np.sum(exps, axis=1, keepdims=True)
        return self.output

    def backward(self, output_gradient: np.ndarray) -> np.ndarray:
        batch_size = self.output.shape[0]
        n_classes = self.output.shape[1]
        grad_input = np.zeros_like(output_gradient)
        
        for i in range(batch_size):
            s = self.output[i].reshape(-1, 1)
            jacobian = np.diagflat(s) - np.dot(s, s.T)
            grad_input[i] = np.dot(jacobian, output_gradient[i])
            
        return grad_input

    def __repr__(self) -> str:
        return f"Softmax()"