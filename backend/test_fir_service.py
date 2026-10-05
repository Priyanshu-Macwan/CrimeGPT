"""Adversarial FIR tests derived from the public API and non-fabrication rules."""

import asyncio
import random
import string

import httpx
import pytest
from fastapi.testclient import TestClient

from fir_service import main, temporary_template
from fir_service.errors import ServiceError
from fir_service.ollama_service import OllamaService
from fir_service.transcription_service import TranscriptionService


SCENARIO = "Yesterday at 9 PM near the railway station two people took my Samsung S24 phone."
client = TestClient(main.app)


def test_text_draft_preserves_account_and_blanks_unsupported_values(monkeypatch):
    async def extraction(_scenario, _schema):
        return {"incident_time": "9 PM", "incident_location": "railway station", "suspect_description": "John Doe", "property_involved": "Samsung S24", "complainant_description": "two people took my Samsung S24 phone"}

    monkeypatch.setattr(main.ollama, "extract", extraction)
    response = client.post("/api/fir/draft", json={"scenario": SCENARIO})
    assert response.status_code == 200  # AC: valid text produces a draft
    data = response.json()
    assert data["model"] == "qwen3:8b"  # AC: report the configured local model used for generation
    assert data["extracted_information"]["incident_time"] == "9 PM"
    assert data["extracted_information"]["suspect_description"] == ""
    assert data["extracted_information"]["complainant_description"] == ""  # AC: event details cannot become identity
    assert data["extracted_information"]["incident_description"] == SCENARIO
    assert "John Doe" not in data["fir_draft"]
    assert "Not specified" in data["fir_draft"]
    assert "not an officially registered fir" in data["fir_draft"].lower()
    assert "IPC" not in data["fir_draft"] and "BNS" not in data["fir_draft"]


def test_explicit_complainant_identity_is_preserved(monkeypatch):
    scenario = "My name is Ravi Kumar. Yesterday evening near the railway station somebody took my phone."

    async def extraction(_scenario, _schema):
        return {"complainant_description": "Ravi Kumar"}

    monkeypatch.setattr(main.ollama, "extract", extraction)
    response = client.post("/api/fir/draft", json={"scenario": scenario})
    assert response.status_code == 200
    assert response.json()["extracted_information"]["complainant_description"] == "Ravi Kumar"  # AC: explicit identity survives


@pytest.mark.parametrize("scenario", ["", "   ", "Hi", "one two three", None, 123])
def test_short_or_invalid_description_rejected(scenario):
    response = client.post("/api/fir/draft", json={"scenario": scenario})
    assert response.status_code == 422  # AC: reject empty, extremely short, wrong type


def test_extracted_span_property_across_random_accounts():
    randomizer = random.Random(47)
    alphabet = string.ascii_letters + string.digits + " "
    for _ in range(200):
        source = "incident " + "".join(randomizer.choices(alphabet, k=120))
        supported = source[9:24]
        unsupported = "SENTINEL-UNSAID"
        mapped = temporary_template.map_extraction({"incident_date": supported, "witness_details": unsupported}, source)
        assert mapped["incident_date"] == supported.strip()  # AC: supported source spans survive after trim
        assert mapped["witness_details"] == ""  # AC: unsupported facts cannot enter draft
        for field, value in mapped.items():
            assert field == "incident_description" or not value or " ".join(value.split()).casefold() in " ".join(source.split()).casefold()


@pytest.mark.parametrize("name,data,status", [
    ("item.txt", b"RIFF1234WAVE", 415),
    ("clip.wav", b"", 400),
    ("clip.wav", b"not really a wav", 415),
    ("clip.webm", b"RIFF1234WAVE", 415),
])
def test_audio_file_validation(name, data, status):
    response = client.post("/api/fir/transcribe", files={"file": (name, data)})
    assert response.status_code == status  # AC: reject unsupported/empty/mismatched audio


def test_audio_confirmation_precedes_generation(monkeypatch):
    calls = []

    async def speech(_audio, _filename):
        return "At the railway station somebody took my phone yesterday evening."

    async def extraction(scenario, _schema):
        calls.append(scenario)
        return {}

    monkeypatch.setattr(main.speech, "transcribe", speech)
    monkeypatch.setattr(main.ollama, "extract", extraction)
    file = {"file": ("clip.wav", b"RIFF1234WAVE")}
    first = client.post("/api/fir/draft-from-audio", files=file)
    assert first.status_code == 202  # AC: first response exposes original transcript for review
    assert first.json()["confirmation_required"] is True
    assert calls == []  # AC: LLM not called before confirmation
    confirmed = "At the railway station somebody took my Samsung phone yesterday evening."
    second = client.post("/api/fir/draft-from-audio", files=file, data={"confirmed_transcript": confirmed})
    assert second.status_code == 200
    assert second.json()["transcript"] != confirmed  # AC: original stays separate from edited account
    assert second.json()["extracted_information"]["incident_description"] == confirmed
    assert calls == [confirmed]


def test_ollama_errors_are_clean(monkeypatch):
    original_client = httpx.AsyncClient

    for status, content, expected in [
        (404, {"error": "model missing"}, 503),
        (200, {"message": {"content": "{"}}, 502),
        (200, {"message": {"content": ""}}, 502),
    ]:
        def fake_client(**kwargs):
            return original_client(transport=httpx.MockTransport(lambda request: httpx.Response(status, json=content)), **kwargs)

        monkeypatch.setattr(httpx, "AsyncClient", fake_client)
        with pytest.raises(ServiceError) as failure:
            asyncio.run(OllamaService().extract(SCENARIO, temporary_template.extraction_schema()))
        assert failure.value.status == expected  # AC: model/JSON/empty errors become API errors


def test_ollama_connect_and_timeout_errors(monkeypatch):
    original_client = httpx.AsyncClient
    for exception, expected in [(httpx.ConnectError("offline"), 503), (httpx.ReadTimeout("late"), 504)]:
        def fake_client(**kwargs):
            def fail(request):
                raise exception
            return original_client(transport=httpx.MockTransport(fail), **kwargs)

        monkeypatch.setattr(httpx, "AsyncClient", fake_client)
        with pytest.raises(ServiceError) as failure:
            asyncio.run(OllamaService().extract(SCENARIO, temporary_template.extraction_schema()))
        assert failure.value.status == expected  # AC: offline/timeout are distinguishable


def test_ollama_retries_one_empty_generation(monkeypatch):
    original_client = httpx.AsyncClient
    count = 0

    def response(_request):
        nonlocal count
        count += 1
        content = "" if count == 1 else '{"incident_date":"Yesterday"}'
        return httpx.Response(200, json={"message": {"content": content}})

    def fake_client(**kwargs):
        return original_client(transport=httpx.MockTransport(response), **kwargs)

    monkeypatch.setattr(httpx, "AsyncClient", fake_client)
    result = asyncio.run(OllamaService().extract(SCENARIO, temporary_template.extraction_schema()))
    assert count == 2  # AC: transient empty generation gets one local retry
    assert result["incident_date"] == "Yesterday"


def test_transcription_failure_returns_clean_error(monkeypatch):
    service = TranscriptionService()

    def fails(_audio, _suffix):
        raise ServiceError(503, "Local speech-to-text model is unavailable")

    monkeypatch.setattr(service, "_transcribe", fails)
    with pytest.raises(ServiceError) as failure:
        asyncio.run(service.transcribe(b"RIFF1234WAVE", "clip.wav"))
    assert failure.value.status == 503  # AC: missing speech model is a clean service error
