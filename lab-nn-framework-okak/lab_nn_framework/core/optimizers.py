import numpy as np
from typing import Dict


class Optimizer:
    
    def apply_gradients(self, layers: list):
        raise NotImplementedError


class SGD(Optimizer):
    
    def __init__(self, learning_rate: float = 0.01):
        self.lr = learning_rate
    
    def apply_gradients(self, layers: list):
        for layer in layers:
            for weight, grad in zip(layer.trainable_weights, layer.gradients):
                weight -= self.lr * grad
    
    def __repr__(self) -> str:
        return f"SGD(lr={self.lr})"


class MomentumSGD(Optimizer):
    
    def __init__(self, learning_rate: float = 0.01, momentum: float = 0.9):
        self.lr = learning_rate
        self.momentum = momentum
        self.velocities: Dict[int, np.ndarray] = {}
    
    def apply_gradients(self, layers: list):
        for layer in layers:
            for weight, grad in zip(layer.trainable_weights, layer.gradients):
                weight_id = id(weight)
                
                if weight_id not in self.velocities:
                    self.velocities[weight_id] = np.zeros_like(weight)
                
                self.velocities[weight_id] = (
                    self.momentum * self.velocities[weight_id] + 
                    self.lr * grad
                )
                
                weight -= self.velocities[weight_id]
    
    def __repr__(self) -> str:
        return f"MomentumSGD(lr={self.lr}, momentum={self.momentum})"


class Adam(Optimizer):
    def __init__(
        self, 
        learning_rate: float = 0.001, 
        beta1: float = 0.9, 
        beta2: float = 0.999, 
        epsilon: float = 1e-8
    ):
        self.lr = learning_rate
        self.beta1 = beta1
        self.beta2 = beta2
        self.epsilon = epsilon
        
        self.m: Dict[int, np.ndarray] = {}
        self.v: Dict[int, np.ndarray] = {}
        
        self.t = 0
    
    def apply_gradients(self, layers: list):
        self.t += 1
        
        for layer in layers:
            for weight, grad in zip(layer.trainable_weights, layer.gradients):
                weight_id = id(weight)
                
                if weight_id not in self.m:
                    self.m[weight_id] = np.zeros_like(weight)
                    self.v[weight_id] = np.zeros_like(weight)
                

                self.m[weight_id] = (
                    self.beta1 * self.m[weight_id] + 
                    (1 - self.beta1) * grad
                )
                

                self.v[weight_id] = (
                    self.beta2 * self.v[weight_id] + 
                    (1 - self.beta2) * (grad ** 2)
                )
                
                m_hat = self.m[weight_id] / (1 - self.beta1 ** self.t)
                v_hat = self.v[weight_id] / (1 - self.beta2 ** self.t)
                
                weight -= self.lr * m_hat / (np.sqrt(v_hat) + self.epsilon)
    
    def __repr__(self) -> str:
        return f"Adam(lr={self.lr}, beta1={self.beta1}, beta2={self.beta2})"


class GradientClipping(Optimizer):
    
    def __init__(self, base_optimizer: Optimizer, max_norm: float = 1.0):
        self.base_optimizer = base_optimizer
        self.max_norm = max_norm
    
    def apply_gradients(self, layers: list):
        total_norm = 0.0
        for layer in layers:
            for grad in layer.gradients:
                total_norm += np.sum(grad ** 2)
        total_norm = np.sqrt(total_norm)
        
        scale = min(1.0, self.max_norm / (total_norm + 1e-8))
        
        if scale < 1.0:
            for layer in layers:
                for grad in layer.gradients:
                    grad *= scale
        
        self.base_optimizer.apply_gradients(layers)
    
    def __repr__(self) -> str:
        return f"GradientClipping({self.base_optimizer}, max_norm={self.max_norm})"