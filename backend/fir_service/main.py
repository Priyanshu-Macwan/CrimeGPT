from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse

from . import config, temporary_template
from .errors import ServiceError
from .ollama_service import OllamaService
from .schemas import AudioDraftResponse, DraftRequest, DraftResponse, TranscriptResponse
from .transcription_service import TranscriptionService

app = FastAPI(title="CrimeGPT Local FIR Service")
ollama = OllamaService()
speech = TranscriptionService()


@app.exception_handler(ServiceError)
async def service_error_handler(_request, error: ServiceError):
    return JSONResponse(status_code=error.status, content={"error": error.message})


async def generate(scenario: str) -> DraftResponse:
    values = await ollama.extract(scenario, temporary_template.extraction_schema())
    info = temporary_template.map_extraction(values, scenario)
    return DraftResponse(extracted_information=info, fir_draft=temporary_template.format_draft(info), model=config.OLLAMA_MODEL)


@app.post("/api/fir/draft", response_model=DraftResponse)
async def draft(request: DraftRequest):
    return await generate(request.scenario)


async def read_audio(file: UploadFile) -> bytes:
    chunks = []
    size = 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > config.MAX_AUDIO_BYTES:
            raise ServiceError(413, "Audio file exceeds 25 MB")
        chunks.append(chunk)
    return b"".join(chunks)


@app.post("/api/fir/transcribe", response_model=TranscriptResponse)
async def transcribe(file: UploadFile = File(...)):
    audio = await read_audio(file)
    transcript = await speech.transcribe(audio, file.filename or "")
    return TranscriptResponse(transcript=transcript)


@app.post("/api/fir/draft-from-audio")
async def draft_from_audio(file: UploadFile = File(...), confirmed_transcript: str | None = Form(None)):
    transcript = await speech.transcribe(await read_audio(file), file.filename or "")
    if confirmed_transcript is None:
        return JSONResponse(status_code=202, content={"transcript": transcript, "confirmation_required": True})
    validated = DraftRequest(scenario=confirmed_transcript)
    result = await generate(validated.scenario)
    return AudioDraftResponse(transcript=transcript, **result.model_dump())
