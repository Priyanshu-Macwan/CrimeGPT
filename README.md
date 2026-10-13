# CrimeGPT

CrimeGPT is a React/Vite frontend with a local Node API. The API stores cases, evidence metadata and files, FIR drafts, approvals, and audit activity in `backend/data/`. The optional Python FIR service provides local Ollama draft generation and Faster Whisper transcription.

## Run the app locally

Use Node.js 18 or newer. Python 3.10 or newer is only needed for the optional FIR service.

Use separate PowerShell terminals. The API requires an administrator credential before it starts. Set credentials in the API terminal (do not commit real passwords):

```powershell
cd C:\path\to\CrimeGPT-Jaymin\backend
$env:CRIMEGPT_ADMIN_ID = 'admin'
$env:CRIMEGPT_ADMIN_PASSWORD = 'use-a-long-local-password'
$env:CRIMEGPT_OFFICER_ID = 'officer'
$env:CRIMEGPT_OFFICER_PASSWORD = 'use-another-long-password'
npm start
```

Start the frontend in a second terminal:

```powershell
cd C:\path\to\CrimeGPT-Jaymin\frontend
npm install
npm run dev
```

The Vite development server proxies `/api` to the local Node API at `127.0.0.1:5000`. Sign in with one of the IDs and passwords configured in the backend terminal.

## Optional FIR generation and audio transcription

The Node API and the case/evidence workflows work without the Python service. To enable FIR generation, install Python dependencies and start the separate service from `backend`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
npm run fir:start
```

FIR generation also requires a local Ollama server and the configured model (default `qwen3:8b`). Audio transcription loads the configured Faster Whisper model the first time it is used and may download model data. Further backend details are in [backend/README.md](backend/README.md).

The development backend uses local JSON and file storage, and keeps login sessions in memory. It is intended for local development, not a production or multi-server deployment.
