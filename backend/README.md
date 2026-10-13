# CrimeGPT backend

The backend is split into two local services:

- The Node API on `127.0.0.1:5000` handles officer sessions, case records, evidence uploads, FIR drafts, approvals, and audit activity. Case metadata is stored in `backend/data/records.json`; uploaded files are stored in `backend/data/evidence/`.
- The FastAPI FIR service on `127.0.0.1:8001` handles draft generation and optional speech transcription. Draft generation requires Ollama running locally with the configured model. Audio transcription downloads the configured Faster Whisper model on first use.

## Local setup (PowerShell)

Open one terminal in `backend` and set credentials for this session before starting the API:

```powershell
$env:CRIMEGPT_ADMIN_ID = 'admin'
$env:CRIMEGPT_ADMIN_PASSWORD = 'replace-with-a-long-local-password'
$env:CRIMEGPT_OFFICER_ID = 'officer'
$env:CRIMEGPT_OFFICER_PASSWORD = 'replace-with-another-long-password'
npm start
```

Install the optional FIR service dependencies in a Python virtual environment, then start it from `backend`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
npm run fir:start
```

Run the Vite frontend from `frontend` in a separate terminal. Its development server proxies `/api` requests to the Node API. The application login uses the officer ID and password configured above. Do not put secrets in frontend code or commit local credentials.

The FIR service requires a local Ollama installation and a downloaded model. If that service or model is not available, login, case, evidence, and audit APIs can still be used; FIR generation and transcription return a service error. This project uses a local JSON store for development and is not configured for multi-instance or production deployment.
