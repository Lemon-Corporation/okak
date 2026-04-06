#  OKAK — голосовой AI-агент для заметок и задач

Персональный голосовой помощник, который живёт на рабочем столе, слушает вас и сам организует информацию. Без переключения между приложениями и ручного ввода.

---

##  Зачем этот проект?

Пользователь теряет информацию не потому что нет инструментов — а потому что нет времени их открывать. OKAK решает это: **мысль пришла → сказал → сохранилось**.

---

##  Что умеет OKAK

- Голосовой ввод на русском (Whisper + VAD)
- Классификация намерений: создать заметку / найти / напомнить / ответить
- Сохранение в векторную базу знаний (Qdrant)
- Голосовой поиск по личной базе (RAG-pipeline)
- Мультиагентная система: файлы, календарь, браузер
- Overlay UI поверх любого окна
- 7 собственных обученных ML-компонентов

---

## Команда

| Участник | Роль | ML-компонент |
|----------|------|--------------|
| Александр Ганяк | CEO, архитектура | Intent Classifier |
| Михаил Пиччук | ML-инженер | ASR + VAD |
| Кириллова Елена | Project Manager | Topic Classifier |
| Михайловская Мария | Lead Frontend | Note Clustering |
| Жгенти Дарья | Frontend | Priority Scorer |
| Константин Никольский | Backend | Re-Ranker |
| Андрей Смирнов | Backend | Duplicate Detector |

---

## Настройка окружения для разработки

### Требования
- Python 3.10+
- Node.js 18+
- Docker (для Qdrant)
- FFmpeg (для аудио)
- NVIDIA GPU + CUDA (опционально)

### 1. Клонирование репозитория
```bash
git clone https://github.com/Lemon-Corporation/okak.git
cd okak
```

### 2. Backend (Python)
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
### 3. Frontend (Electron)
```bash
cd frontend
npm install
```

### 4. Запуск Qdrant
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 5. Запуск приложения
```bash
python app.py
```
```bash
cd frontend && npm start
```

### 6. Установка зависимостей для ML-компонентов
```bash
pip install torch transformers sentence-transformers
pip install openai-whisper silero-vad
pip install scikit-learn xgboost umap-learn hdbscan
pip install qdrant-client langchain
```

### 7. Проверка установки
```bash
python -c "import torch; print(torch.__version__)"
python -c "import whisper; print('Whisper OK')"
python -c "import qdrant_client; print('Qdrant OK')"
```

---

### Структура проекта
```text
okak/
├── backend/
│   ├── models/          # ML-модели (Intent, ASR, Topic, etc.)
│   ├── agents/          # Calendar, Files, Browse agents
│   ├── knowledge/       # Qdrant + RAG pipeline
│   └── api/             # FastAPI endpoints
├── frontend/
│   └── src/             # Electron + overlay UI
├── requirements/
│   ├── intent.txt
│   ├── asr.txt
│   ├── topic.txt
│   └── ...
├── docker-compose.yml
└── README.md
```

---

### Лицензия
MIT
