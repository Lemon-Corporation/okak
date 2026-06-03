import numpy as np
from typing import Iterator, Tuple, Optional


def minibatch_generator(
    X: np.ndarray, 
    y: np.ndarray, 
    batch_size: int, 
    shuffle: bool = True
) -> Iterator[Tuple[np.ndarray, np.ndarray]]:
    n_samples = X.shape[0]
    
    if shuffle:
        indices = np.random.permutation(n_samples)
    else:
        indices = np.arange(n_samples)
    
    for start_idx in range(0, n_samples, batch_size):
        excerpt = indices[start_idx:start_idx + batch_size]
        yield X[excerpt], y[excerpt]


def train_test_split(
    X: np.ndarray, 
    y: np.ndarray, 
    test_size: float = 0.2, 
    random_state: Optional[int] = None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    if random_state is not None:
        np.random.seed(random_state)
    
    n_samples = X.shape[0]
    indices = np.random.permutation(n_samples)
    split_idx = int(n_samples * (1.0 - test_size))
    
    train_idx = indices[:split_idx]
    test_idx = indices[split_idx:]
    
    return X[train_idx], X[test_idx], y[train_idx], y[test_idx]


def normalize_data(
    X: np.ndarray, 
    mode: str = 'standard'
) -> Tuple[np.ndarray, dict]:
    if mode == 'minmax':
        min_vals = np.min(X, axis=0)
        max_vals = np.max(X, axis=0)
        X_norm = (X - min_vals) / (max_vals - min_vals + 1e-8)
        params = {'min': min_vals, 'max': max_vals}
    elif mode == 'standard':
        mean = np.mean(X, axis=0)
        std = np.std(X, axis=0)
        X_norm = (X - mean) / (std + 1e-8)
        params = {'mean': mean, 'std': std}
    else:
        raise ValueError(f"Неизвестный режим нормализации: {mode}")
    
    return X_norm, params


def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    n_samples = labels.shape[0]
    one_hot = np.zeros((n_samples, num_classes))
    one_hot[np.arange(n_samples), labels.astype(int)] = 1.0
    return one_hot