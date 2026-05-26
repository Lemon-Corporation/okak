import os
import uuid
import wave
import tempfile
import numpy as np
import re
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

def apply_audio_processing(samples: np.ndarray, sample_rate: int) -> np.ndarray:
    """Mathematically smooth and enhance audio samples."""
    # 1. Basic Dynamic Range Compression
    # Makes the voice feel "closer" and more consistent
    threshold = 0.5
    ratio = 4.0
    
    compressed = np.where(
        np.abs(samples) > threshold,
        threshold + (np.abs(samples) - threshold) / ratio,
        samples
    )
    # Restore sign
    compressed = np.sign(samples) * np.abs(compressed)
    
    # 2. Simple Low-pass Filter (Smoothing)
    # Removes high-frequency digital harshness, making it "warmer"
    window_size = 3
    kernel = np.ones(window_size) / window_size
    smoothed = np.convolve(compressed, kernel, mode='same')
    
    # 3. Normalization to peak
    max_val = np.max(np.abs(smoothed))
    if max_val > 0:
        smoothed = smoothed / max_val * 0.9
        
    return smoothed

def preprocess_text(text: str) -> str:
    """Prepare text for more natural synthesis."""
    # Add small pauses after punctuation
    text = text.replace(',', ', ')
    text = text.replace(';', '; ... ')
    text = text.replace(':', ': ... ')
    # Replace long dashes with pauses
    text = text.replace(' — ', ' ... ')
    # Clean up multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

async def synthesize_speech(text: str) -> str:
    """Synthesizes speech with advanced mathematical smoothing and prosody."""
    voice = get_voice()
    fd, temp_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    
    processed_text = preprocess_text(text)
    
    # Split into sentences to vary prosody (intonation)
    sentences = re.split(r'(?<=[.!?])\s+', processed_text)
    all_samples = []
    
    sample_rate = voice.config.sample_rate
    
    for sentence in sentences:
        if not sentence.strip():
            continue
            
        # Vary parameters slightly for each sentence to sound more "human"
        variation = (len(sentence) % 10) / 100.0 # 0.00 to 0.09
        
        syn_config = SynthesisConfig(
            length_scale=1.05 + variation, # Dynamic speed
            noise_scale=0.6 + (variation * 2), # Dynamic intonation variety
            noise_w_scale=0.8,
            normalize_audio=False 
        )
        
        # Collect raw samples for post-processing
        sentence_samples = []
        for sample in voice.synthesize_stream(sentence, syn_config=syn_config):
            s = np.frombuffer(sample, dtype=np.int16).astype(np.float32) / 32768.0
            sentence_samples.append(s)
            
        if sentence_samples:
            combined = np.concatenate(sentence_samples)
            # Add a small silence at the end of each sentence (300ms)
            silence = np.zeros(int(sample_rate * 0.3))
            all_samples.append(combined)
            all_samples.append(silence)
            
    if not all_samples:
        return temp_path
        
    final_audio = np.concatenate(all_samples)
    
    # Apply mathematical smoothing and enhancement
    enhanced_audio = apply_audio_processing(final_audio, sample_rate)
    
    # Convert back to int16 for WAV
    int_samples = (enhanced_audio * 32767).astype(np.int16)
    
    with wave.open(temp_path, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(int_samples.tobytes())
        
    return temp_path
