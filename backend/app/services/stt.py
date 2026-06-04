import io
import tempfile
import whisper
import os
import asyncio
from functools import partial

# Lazy load to avoid loading the model into memory until needed
_model = None

def get_whisper_model():
    global _model
    if _model is None:
        # "tiny" is very fast. For better Russian accuracy, you can use "base" or "small"
        _model = whisper.load_model("base")
    return _model

def _transcribe_sync(model, path):
    return model.transcribe(path, language="ru")

async def transcribe_audio_whisper(audio_bytes: bytes) -> str:
    """
    Saves audio bytes to a temp file, runs Whisper, and returns the transcript.
    Runs Whisper in a separate thread to avoid blocking the event loop.
    """
    # Create a temporary file
    fd, temp_path = tempfile.mkstemp(suffix=".webm")
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(audio_bytes)
        
        model = get_whisper_model()
        
        # Run synchronous transcription in a thread pool
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            None, 
            partial(_transcribe_sync, model, temp_path)
        )
        
        return result.get("text", "").strip()
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass
