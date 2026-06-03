import numpy as np


class Initializer:
    
    def __call__(self, shape: tuple) -> np.ndarray:
        raise NotImplementedError("Подклассы должны реализовать метод __call__")


class RandomNormalInitializer(Initializer):
    
    def __init__(self, mean: float = 0.0, stddev: float = 0.05):
        self.mean = mean
        self.stddev = stddev

    def __call__(self, shape: tuple) -> np.ndarray:
        return np.random.normal(self.mean, self.stddev, shape)


class HeInitializer(Initializer):
    
    def __call__(self, shape: tuple) -> np.ndarray:
        fan_in = shape[0]  
        std = np.sqrt(2.0 / fan_in)
        return np.random.normal(0.0, std, shape)


class XavierInitializer(Initializer):

    
    def __call__(self, shape: tuple) -> np.ndarray:
        fan_in, fan_out = shape[0], shape[1]
        limit = np.sqrt(6.0 / (fan_in + fan_out))
        return np.random.uniform(-limit, limit, shape)


class ZerosInitializer(Initializer):
    
    def __call__(self, shape: tuple) -> np.ndarray:
        return np.zeros(shape)


class OnesInitializer(Initializer):
    
    def __call__(self, shape: tuple) -> np.ndarray:
        return np.ones(shape)