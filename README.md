# CrimeGPT

CrimeGPT is a local case recording and FIR draft workspace. The backend stores cases, evidence files, draft status, and an audit log on disk. Draft approval records an internal review; it does **not** file an official FIR.

## Run locally

Requires Node.js 20 or later, Python 3.11 or later, and [Ollama](https://ollama.com/). Install the local models first:

```powershell
ollama pull qwen3:8b
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The speech model `small` downloads on first transcription. AI generation and transcription run on this computer. In a first terminal, start the Python FIR service:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn fir_service.main:app --host 127.0.0.1 --port 8001
```

In a second PowerShell terminal, start the case API:

```powershell
$env:CRIMEGPT_ADMIN_ID = "chief"
$env:CRIMEGPT_ADMIN_PASSWORD = "<choose-a-long-password>"
$env:CRIMEGPT_OFFICER_ID = "officer"
$env:CRIMEGPT_OFFICER_PASSWORD = "<choose-another-long-password>"
cd backend
npm start
```

In a third terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the third terminal. The development server proxies `/api` to port 5000. The Node API authenticates FIR requests and forwards them to the Python service on port 8001. Admin credentials are required to start the Node backend; the officer account is optional. Do not commit credentials or the files in `backend/data`.

`OLLAMA_MODEL` defaults to `qwen3:8b`, `OLLAMA_BASE_URL` to `http://127.0.0.1:11434`, and the speech settings to `WHISPER_MODEL=small`, `WHISPER_DEVICE=cpu`, `WHISPER_COMPUTE_TYPE=int8`. Set `WHISPER_LANGUAGE` to a language code when explicit language selection is needed. The Ollama URL must be local.

## Behavior

- Sessions use an HTTP only, same site cookie. The admin API checks the administrator role.
- Case registration, evidence upload, and FIR draft approval write to `backend/data/records.json`; evidence bytes are stored in `backend/data/evidence`. Each evidence record includes a SHA-256 fingerprint and uploader.
- Each evidence file is limited to 10 MB. A failed attachment upload leaves the case registered and shows the failure on the case page so the file can be retried from Evidence.
- New Case offers Gujarat district and town suggestions while allowing a specific street or landmark. Choosing `Other` requires a written crime type, which is saved and shown in case views. Incident and suspect descriptions accept microphone recordings or audio uploads; the original transcript remains visible for correction.
- The FIR workspace accepts text, microphone recordings, and audio uploads (`wav`, `mp3`, `m4a`, `webm`, up to 25 MB). The original transcription is shown separately; the officer can edit and confirm it before generating a draft. Generation uses only source-supported extracted phrases and preserves the full account. The draft is for review and makes no automated legal recommendations.
- `POST /api/fir/draft` accepts JSON `{ "scenario": "..." }`. `POST /api/fir/transcribe` accepts a multipart `file`. `POST /api/fir/draft-from-audio` first returns HTTP 202 with the original `transcript`; after review, resubmit the file with a `confirmed_transcript` form field for the draft. The frontend uses `/transcribe` followed by `/draft` to avoid resending audio.
- The prototype's extraction fields and document format live in `backend/fir_service/temporary_template.py`; replace that module when the reference Indian FIR PDF is available. The text, audio, and Ollama pipeline do not depend on its field names.
- Reports derive from stored cases. Use the browser print dialog to print or save a PDF.

For a network deployment, serve the frontend and API behind HTTPS, set `NODE_ENV=production` for secure cookies, and protect and back up `backend/data`. This repository does not include a production identity provider, database, or official FIR filing integration.

## Checks

```powershell
cd backend
npm test
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q test_fir_service.py
cd ../frontend
npm test
npm run lint
npm run build
```
