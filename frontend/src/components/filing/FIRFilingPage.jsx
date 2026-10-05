import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WorkspaceShell from '../WorkspaceShell';
import { request } from '../../api';
import { useApi } from '../../useApi';
import { caseTypeLabel } from '../../caseType';

function documentText(c, statement, legalSections) {
  if (!c) return '';
  return [
    'FIRST INFORMATION REPORT — DRAFT',
    'Case: ' + c.id,
    'Unit: ' + c.precinct,
    'Incident date: ' + c.date,
    'Complainant: ' + c.victim,
    'Place: ' + c.location,
    'Nature: ' + caseTypeLabel(c),
    '',
    'STATEMENT',
    statement || '[Enter the complainant statement]',
    '',
    'LEGAL SECTIONS — OFFICER ENTERED',
    legalSections || '[Not entered]',
    '',
    'This is a working draft. Approval records review; it does not file an official FIR.',
  ].join('\n');
}

export default function FIRFilingPage() {
  const [params] = useSearchParams();
  const { data: casesData, error: casesError } = useApi('/cases');
  const { data: draftData, reload } = useApi('/drafts');
  const cases = casesData?.cases || [];
  const [caseId, setCaseId] = useState(params.get('caseId') || '');
  const [statement, setStatement] = useState('');
  const [legalSections, setLegalSections] = useState('');
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [transcriptPending, setTranscriptPending] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') { recorderRef.current.onstop = null; recorderRef.current.stop(); }
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);
  const selectedId = caseId || cases[0]?.id || '';
  const c = cases.find(item => item.id === selectedId);
  const drafts = (draftData?.drafts || []).filter(item => item.caseId === selectedId);
  const text = generated?.scenario === statement.trim()
    ? generated.fir_draft + (legalSections.trim() ? '\n\nVERIFIED LEGAL SECTIONS — OFFICER ENTERED\n' + legalSections.trim() : '')
    : documentText(c, statement, legalSections);
  function changeCase(id) { setCaseId(id); setStatement(''); setLegalSections(''); setSaved(null); setError(''); setOriginalTranscript(''); setTranscriptPending(false); setGenerated(null); }
  function editStatement(value) { setStatement(value); setSaved(null); setGenerated(null); }
  function editSections(value) { setLegalSections(value); setSaved(null); }
  async function generate() {
    setError(''); setBusy(true);
    try {
      const result = await request('/fir/draft', { method: 'POST', body: JSON.stringify({ scenario: statement }) });
      setGenerated({ ...result, scenario: statement.trim() });
      setTranscriptPending(false);
      setSaved(null);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function transcribeAudio(file) {
    if (!file) return;
    setError(''); setBusy(true);
    try {
      const data = new FormData();
      data.append('file', file, file.name);
      const result = await request('/fir/transcribe', { method: 'POST', body: data });
      setOriginalTranscript(result.transcript);
      setStatement(result.transcript);
      setTranscriptPending(true);
      setGenerated(null);
      setSaved(null);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function startRecording() {
    setError('');
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
        void transcribeAudio(new File(chunks, 'incident.' + extension, { type: recorder.mimeType }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (failure) { streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; setError(failure.message); }
  }
  function stopRecording() { if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); }
  async function save() {
    setError(''); setBusy(true);
    try {
      const currentGeneration = generated?.scenario === statement.trim() ? generated : null;
      const result = await request('/drafts', { method: 'POST', body: JSON.stringify({ caseId: selectedId, statement, legalSections, firDraft: currentGeneration?.fir_draft || '', extractedInformation: currentGeneration?.extracted_information || null, generationModel: currentGeneration?.model || '' }) });
      setSaved(result.draft);
      await reload();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  async function approve() {
    if (!saved) return;
    setError(''); setBusy(true);
    try {
      const result = await request('/drafts/' + saved.id + '/approve', { method: 'POST' });
      setSaved(result.draft);
      await reload();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <WorkspaceShell title="FIR DRAFT WORKSPACE"><div className="split-filing">
    <section className="filing-form"><div className="eyebrow">OFFICER DOCUMENT WORKSPACE</div><h1>FIR draft</h1>
      <p className="muted">Describe the incident in text or record your voice. Review the transcript and draft before saving. This workspace does not file an official FIR or suggest legal sections.</p>
      {casesError && <p role="alert" className="form-error">{casesError}</p>}
      <div className="form-field"><label htmlFor="draft-case">Related case</label><select id="draft-case" className="select" value={selectedId} onChange={e => changeCase(e.target.value)}>{!cases.length && <option value="">No cases</option>}{cases.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title}</option>)}</select></div>
      <div className="form-field" style={{ marginTop: 16 }}><label htmlFor="draft-statement">Incident description / confirmed transcript</label><textarea id="draft-statement" className="textarea" rows="12" value={statement} onChange={e => editStatement(e.target.value)} placeholder="Record the incident in the complainant’s words."/></div>
      <div className="actions" style={{ marginTop: 12 }}>
        <button className="btn" type="button" disabled={busy || recording} onClick={startRecording}>Record incident</button>
        {recording && <button className="btn" type="button" onClick={stopRecording}>Stop recording</button>}
        <input id="draft-audio" className="audio-file-input" type="file" accept=".wav,.mp3,.m4a,.webm,audio/*" disabled={busy || recording} onChange={e => { void transcribeAudio(e.target.files?.[0]); e.target.value = ''; }} /><label className="btn" htmlFor="draft-audio">Upload audio</label>
      </div>
      {originalTranscript && <div className="notice" style={{ marginTop: 12 }}><b>Original transcription</b><p>{originalTranscript}</p><small>Check and correct the editable text above before generating a draft.</small></div>}
      <div className="actions" style={{ marginTop: 12 }}><button className="btn primary" type="button" disabled={busy || recording || statement.trim().length < 20} onClick={generate}>{busy ? 'Working…' : transcriptPending ? 'Confirm transcript and generate' : 'Generate FIR draft'}</button></div>
      {generated?.scenario === statement.trim() && <p className="notice" style={{ marginTop: 12 }}>Generated locally with {generated.model}. Review every detail before saving.</p>}
      <div className="form-field" style={{ marginTop: 16 }}><label htmlFor="draft-sections">Verified legal sections (optional)</label><textarea id="draft-sections" className="textarea" rows="3" value={legalSections} onChange={e => editSections(e.target.value)} placeholder="Officer-entered sections and reason"/></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="actions" style={{ marginTop: 16 }}><button className="btn primary" disabled={!c || !statement.trim() || busy || transcriptPending} onClick={save}>{busy ? 'Saving…' : 'Save draft for review'}</button><button className="btn" disabled={!saved || saved.status !== 'pending_review' || busy} onClick={approve}>Approve saved draft</button></div>
      {saved && <p className="notice">Draft {saved.id} · {saved.status.replace('_', ' ')}{saved.approvedBy ? ' by ' + saved.approvedBy : ''}</p>}
    </section>
    <section className="filing-preview"><div className="eyebrow">DOCUMENT PREVIEW</div><h2>Draft text</h2><pre className="document">{text || 'Select a case to begin.'}</pre>
      <div className="actions"><button className="btn" disabled={!c} onClick={() => navigator.clipboard.writeText(text)}>Copy</button><button className="btn" disabled={!c} onClick={() => window.print()}>Print / Save PDF</button></div>
      <h2 style={{ marginTop: 30 }}>Saved drafts for this case</h2>
      {drafts.map(item => <div className="evidence-row" key={item.id}><div><b>{item.status.replace('_', ' ')}</b><div className="small muted">{item.createdAt} · {item.createdBy}</div></div><button className="btn" onClick={() => { setStatement(item.statement); setLegalSections(item.legalSections); setGenerated(item.firDraft ? { scenario: item.statement.trim(), fir_draft: item.firDraft, extracted_information: item.extractedInformation, model: item.generationModel } : null); setOriginalTranscript(''); setTranscriptPending(false); setSaved(item); }}>Review</button></div>)}
      {!drafts.length && <p className="muted">No saved drafts.</p>}
    </section>
  </div></WorkspaceShell>;
}
