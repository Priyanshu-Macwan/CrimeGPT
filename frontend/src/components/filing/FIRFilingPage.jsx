import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkle, Check, Copy, ArrowCounterClockwise, Microphone, UploadSimple } from '@phosphor-icons/react';
import WorkspaceShell from '../WorkspaceShell';
import { request } from '../../api';
import { useRemoteData } from '../../useRemoteData';

export default function FIRFilingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: caseData, loading: casesLoading, error: casesError } = useRemoteData('/cases', 'cases');
  const { data: draftsData, refresh: refreshDrafts } = useRemoteData('/drafts', 'drafts');
  const cases = caseData || [];
  const drafts = draftsData || [];
  const [caseId, setCaseId] = useState(searchParams.get('case') || '');
  const [complaint, setComplaint] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const selectedCase = cases.find(item => item.id === caseId) || null;
  const queryDraft = searchParams.get('draft');

  useEffect(() => {
    if (!cases.length) return;
    const requested = searchParams.get('case');
    if (requested && cases.some(item => item.id === requested)) setCaseId(requested);
    else if (!caseId || !cases.some(item => item.id === caseId)) setCaseId(cases[0].id);
  }, [cases, caseId, searchParams]);

  useEffect(() => {
    if (!queryDraft || !drafts.length) return;
    const saved = drafts.find(item => item.id === queryDraft);
    if (!saved) return;
    setCaseId(saved.caseId);
    setComplaint(saved.statement);
    setGeneratedDraft({ ...saved, extracted_information: saved.extractedInformation || {}, fir_draft: saved.firDraft || '' });
  }, [drafts, queryDraft]);

  const draftText = generatedDraft?.fir_draft || '';
  const summary = generatedDraft?.extracted_information?.incident_description || complaint || selectedCase?.description || '';
  const legalSections = useMemo(() => generatedDraft?.legalSections || '', [generatedDraft]);

  async function generate() {
    const scenario = complaint.trim() || selectedCase?.description || '';
    if (!selectedCase) { setError('Create a case before generating its FIR draft.'); return; }
    if (scenario.trim().length < 20 || scenario.trim().split(/\s+/).length < 4) { setError('Enter an incident account of at least four words and 20 characters.'); return; }
    setLoading(true);
    setError('');
    setGeneratedDraft(null);
    try {
      const generated = await request('/fir/draft', { method: 'POST', body: { scenario } });
      const { draft } = await request('/drafts', {
        method: 'POST',
        body: {
          caseId: selectedCase.id,
          statement: scenario,
          legalSections: '',
          firDraft: generated.fir_draft,
          extractedInformation: generated.extracted_information,
          generationModel: generated.model,
        },
      });
      setGeneratedDraft({ ...draft, extracted_information: generated.extracted_information, fir_draft: generated.fir_draft, model: generated.model });
      setSearchParams({ case: selectedCase.id, draft: draft.id });
    } catch (generationError) {
      setError(generationError.message);
    } finally {
      setLoading(false);
    }
  }

  async function transcribe() {
    if (!audioFile) return;
    const form = new FormData();
    form.append('file', audioFile);
    setTranscribing(true);
    setError('');
    try {
      const result = await request('/fir/transcribe', { method: 'POST', body: form });
      setComplaint(current => current ? `${current}\n${result.transcript}` : result.transcript);
      setGeneratedDraft(null);
      setAudioFile(null);
    } catch (transcriptionError) {
      setError(transcriptionError.message);
    } finally {
      setTranscribing(false);
    }
  }

  async function copyDraft() {
    if (!draftText) return;
    try { await navigator.clipboard.writeText(draftText); setCopied(true); }
    catch { setError('Clipboard access was blocked by the browser.'); }
  }

  async function approveDraft() {
    if (!generatedDraft?.id) return;
    setLoading(true);
    setError('');
    try {
      const { draft } = await request(`/drafts/${encodeURIComponent(generatedDraft.id)}/approve`, { method: 'POST' });
      setGeneratedDraft(current => ({ ...current, ...draft }));
      await refreshDrafts();
    } catch (approvalError) { setError(approvalError.message); }
    finally { setLoading(false); }
  }

  function clearDraft() {
    setGeneratedDraft(null);
    setComplaint('');
    setCopied(false);
    setError('');
    setSearchParams(caseId ? { case: caseId } : {});
  }

  return (
    <WorkspaceShell title="AI FIR WORKSPACE">
      <div className="split-filing">
        <section className="filing-form">
          <div className="eyebrow">AI document procedural</div><h1 style={{ fontSize: 22 }}>Complaint statement</h1>
          <p className="muted">Create a draft from an officer-provided account. Review every extracted detail before use.</p>
          {casesError && <p className="form-error">Could not load cases: {casesError}</p>}
          <div className="form-field" style={{ margin: '20px 0' }}><label>Related case file</label>
            <select className="select" value={caseId} disabled={casesLoading || !cases.length} onChange={event => { setCaseId(event.target.value); setGeneratedDraft(null); setError(''); setSearchParams({ case: event.target.value }); }}>
              {!cases.length && <option value="">{casesLoading ? 'Loading cases…' : 'Create a case first'}</option>}
              {cases.map(item => <option value={item.id} key={item.id}>{item.id} · {item.title}</option>)}
            </select>
          </div>
          <div className="form-field"><label htmlFor="complaint-statement">Raw victim / witness statement</label><textarea id="complaint-statement" className="textarea" rows="13" value={complaint} onChange={event => { setComplaint(event.target.value); setGeneratedDraft(null); }} placeholder="Enter the statement in the complainant’s own words…" /></div>
          <div className="audio-transcription">
            <label className="small" htmlFor="audio-statement"><Microphone /> Transcribe a recording (WAV, MP3, M4A or WebM)</label>
            <input id="audio-statement" type="file" accept="audio/wav,audio/mpeg,audio/mp4,audio/webm,.wav,.mp3,.m4a,.webm" onChange={event => setAudioFile(event.target.files?.[0] || null)} />
            <button className="btn" type="button" disabled={!audioFile || transcribing} onClick={transcribe}><UploadSimple /> {transcribing ? 'Transcribing…' : 'Transcribe audio'}</button>
          </div>
          <div className="notice" style={{ margin: '16px 0' }}>AI output is an unfiled draft. Confirm each statement and follow your review process before use.</div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn primary" style={{ width: '100%' }} disabled={!selectedCase || loading} onClick={generate}><Sparkle />{loading ? 'Preparing draft…' : 'Generate AI draft'}</button>
          <div className="small muted" style={{ marginTop: 12 }}>Draft generation uses the locally configured Ollama service; transcription uses the local speech model.</div>
        </section>

        <section className="filing-preview">
          <div className="page-heading"><div><span className="btn primary">AI GENERATED OUTPUT</span><p>REF: {selectedCase?.id || '—'}<br />MODEL: {generatedDraft?.model || generatedDraft?.generationModel || '—'}</p></div><span className={`stamp ${generatedDraft?.status === 'approved' ? '' : 'neutral'}`}>[ {generatedDraft?.status === 'approved' ? 'APPROVED' : generatedDraft ? 'PENDING REVIEW' : 'NO DRAFT'} ]</span></div>
          <hr />
          <h2 style={{ fontSize: 17, marginTop: 24 }}>Statement summary</h2><div className="notice">{summary || 'Select a case and enter a statement to prepare a draft.'}</div>
          <h2 style={{ fontSize: 17, marginTop: 24 }}>First Information Report (draft)</h2><pre className="document">{draftText || 'The AI generated document will appear here after the local FIR service returns a draft.'}</pre>
          <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}><button className="btn" disabled={!draftText} onClick={copyDraft}><Copy /> {copied ? 'Copied' : 'Copy draft'}</button><button className="btn" disabled={!draftText} onClick={() => window.print()}>Print / PDF</button></div>
          <h2 style={{ fontSize: 17, marginTop: 24 }}>Recommended legal sections</h2>
          <div className="panel"><div className="panel-content">{legalSections ? <pre className="document">{legalSections}</pre> : <p className="muted">The imported FIR service does not assign legal sections. Have an authorized reviewer determine applicable law.</p>}</div></div>
          <div className="actions" style={{ justifyContent: 'space-between', marginTop: 18 }}>
            <button className="btn danger" onClick={clearDraft}><ArrowCounterClockwise /> Clear statement</button>
            <button className="btn primary" disabled={!generatedDraft?.id || generatedDraft.status === 'approved' || loading} onClick={approveDraft}><Check /> {loading ? 'Saving…' : generatedDraft?.status === 'approved' ? 'Approved' : 'Approve & save draft'}</button>
          </div>
          {!casesLoading && !cases.length && <div className="empty">No case is available. <Link to="/new-case">Register a case</Link> before preparing a draft.</div>}
        </section>
      </div>
    </WorkspaceShell>
  );
}
