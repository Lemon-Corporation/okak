import sys

with open('examples/iris_classification.py', 'r') as f:
    content = f.read()

old_block = """    predictions = model.predict(test_samples)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = np.argmax(test_labels, axis=1)
    
    for i in range(len(test_samples)):
        pred_name = iris_names[predicted_classes[i]]
        true_name = iris_names[true_classes[i]]
        confidence = np.max(predictions[i]) * 100  # Перевод в проценты"""

new_block = """    # Получаем логиты и преобразуем в вероятности
    logits = model.predict(test_samples)
    exps = np.exp(logits - np.max(logits, axis=1, keepdims=True))
    probabilities = exps / np.sum(exps, axis=1, keepdims=True)
    
    predicted_classes = np.argmax(probabilities, axis=1)
    true_classes = np.argmax(test_labels, axis=1)
    
    for i in range(len(test_samples)):
        pred_name = iris_names[predicted_classes[i]]
        true_name = iris_names[true_classes[i]]
        confidence = np.max(probabilities[i]) * 100"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('examples/iris_classification.py', 'w') as f:
        f.write(content)

