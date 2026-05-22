import os
import uuid
import wave
import tempfile
from piper.voice import PiperVoice

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'ru_RU-irina-medium.onnx')
CONFIG_PATH = MODEL_PATH + '.json'

_voice = None

def get_voice() -> PiperVoice:
    global _voice
    if _voice is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(f"TTS model not found at {MODEL_PATH}")
        _voice = PiperVoice.load(MODEL_PATH, config_path=CONFIG_PATH)
    return _voice

async def synthesize_speech(text: str) -> str:
    """Synthesizes speech to a temporary WAV file and returns the path."""
    voice = get_voice()
    fd, temp_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    
    with wave.open(temp_path, 'wb') as wav_file:
        voice.synthesize_wav(text, wav_file)
        
    return temp_path
