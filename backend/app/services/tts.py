import os
import uuid
import wave
import tempfile
from piper.voice import PiperVoice
from piper.config import SynthesisConfig

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
    
    # Сглаживаем параметры синтеза, чтобы голос звучал менее как у "робота"
    # length_scale: >1 делает речь чуть медленнее и плавнее (слова не слипаются)
    # noise_scale: регулирует интонационное разнообразие (больше = более живой, но может "срываться")
    # noise_w_scale: регулирует межфонемный шум
    syn_config = SynthesisConfig(
        length_scale=1.1,
        noise_scale=0.75,
        noise_w_scale=0.8,
        normalize_audio=True
    )
    
    with wave.open(temp_path, 'wb') as wav_file:
        voice.synthesize_wav(
            text, 
            wav_file,
            syn_config=syn_config
        )
        
    return temp_path
