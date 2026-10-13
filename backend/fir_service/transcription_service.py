import asyncio
import os
import tempfile

from . import config
from .errors import ServiceError


SIGNATURES = {
    ".wav": lambda b: b.startswith(b"RIFF") and b[8:12] == b"WAVE",
    ".mp3": lambda b: b.startswith(b"ID3") or (len(b) > 1 and b[0] == 255 and b[1] & 224 == 224),
    ".m4a": lambda b: b[4:8] == b"ftyp",
    ".webm": lambda b: b.startswith(b"\x1a\x45\xdf\xa3"),
}


class TranscriptionService:
    def __init__(self):
        self._model = None
        self._lock = asyncio.Lock()

    def _load_model(self):
        try:
            from faster_whisper import WhisperModel
        except ImportError as error:
            raise ServiceError(503, "Local speech-to-text dependency is not installed") from error
        try:
            return WhisperModel(config.WHISPER_MODEL, device=config.WHISPER_DEVICE, compute_type=config.WHISPER_COMPUTE_TYPE)
        except Exception as error:
            raise ServiceError(503, "Local speech-to-text model is unavailable") from error

    def _transcribe(self, audio: bytes, suffix: str) -> str:
        name = None
        try:
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as file:
                name = file.name
                file.write(audio)
            if self._model is None:
                self._model = self._load_model()
            segments, _ = self._model.transcribe(name, language=config.WHISPER_LANGUAGE, beam_size=5)
            transcript = " ".join(segment.text.strip() for segment in segments).strip()
            if not transcript:
                raise ServiceError(422, "No speech could be transcribed")
            return transcript
        except ServiceError:
            raise
        except Exception as error:
            raise ServiceError(422, "Audio could not be transcribed") from error
        finally:
            if name is not None:
                os.unlink(name)

    async def transcribe(self, audio: bytes, filename: str) -> str:
        suffix = os.path.splitext(filename.lower())[1]
        if suffix not in SIGNATURES:
            raise ServiceError(415, "Supported audio formats: wav, mp3, m4a, webm")
        if not audio:
            raise ServiceError(400, "Audio file is empty")
        if len(audio) > config.MAX_AUDIO_BYTES:
            raise ServiceError(413, "Audio file exceeds 25 MB")
        if not SIGNATURES[suffix](audio):
            raise ServiceError(415, "Audio content does not match its file format")
        async with self._lock:
            return await asyncio.to_thread(self._transcribe, audio, suffix)
