import React, { useEffect, useRef, useState } from 'react';
import { request } from '../../api';

export default function VoiceTextarea({ id, value, onChange, onTranscript, onBusyChange, rows, placeholder, required = false, voiceLabel }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [originalTranscript, setOriginalTranscript] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    onBusyChange(false);
  }, [onBusyChange]);

  async function transcribeAudio(file, alreadyBusy = false) {
    if (!file) return;
    setError('');
    if (!alreadyBusy) { setBusy(true); onBusyChange(true); }
    try {
      const data = new FormData();
      data.append('file', file, file.name);
      const result = await request('/fir/transcribe', { method: 'POST', body: data });
      setOriginalTranscript(result.transcript);
      onTranscript(result.transcript);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); onBusyChange(false); }
  }

  async function startRecording() {
    setError('');
    setBusy(true);
    onBusyChange(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Microphone recording is not supported in this browser');
      const mimeType = ['audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('This browser cannot record a supported audio format');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
        const extension = recorder.mimeType.includes('mp4') ? 'm4a' : 'webm';
        void transcribeAudio(new File(chunks, 'description.' + extension, { type: recorder.mimeType }), true);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (failure) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setError(failure.message);
      setBusy(false);
      onBusyChange(false);
    }
  }

  return <>
    <textarea id={id} className="textarea" required={required} rows={rows} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
    <div className="actions voice-actions">
      <button className="btn" type="button" disabled={busy} onClick={startRecording}>Record {voiceLabel}</button>
      {recording && <button className="btn" type="button" onClick={() => recorderRef.current?.stop()}>Stop recording</button>}
      <input id={id + '-audio'} className="audio-file-input" type="file" accept=".wav,.mp3,.m4a,.webm,audio/*" disabled={busy} onChange={event => { void transcribeAudio(event.target.files?.[0]); event.target.value = ''; }} />
      <label className="btn" htmlFor={id + '-audio'}>Upload audio</label>
      {busy && !recording && <span className="small muted" role="status">Transcribing audio…</span>}
    </div>
    {originalTranscript && <div className="notice" style={{ marginTop: 10 }}><b>Original transcription</b><p>{originalTranscript}</p><small>Check and edit the description above before continuing.</small></div>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </>;
}
