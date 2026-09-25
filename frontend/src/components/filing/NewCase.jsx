import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Trash } from '@phosphor-icons/react';
import WorkspaceShell from '../WorkspaceShell';
import { readCases, saveCases } from '../../data/cases';

const steps = ['Incident', 'Victim', 'Suspect', 'Evidence', 'Review'];
const blank = {
  title: '', type: 'Theft', date: new Date().toISOString().slice(0, 10), location: '', precinct: '7B',
  description: '', victim: '', contact: '', notes: '', suspect: '', suspectStatus: 'Unknown', suspectDescription: '',
};

export default function NewCase() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(blank);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const canContinue = step === 0
    ? Boolean(form.title.trim() && form.location.trim() && form.description.trim())
    : step === 1 ? Boolean(form.victim.trim()) : true;

  function next() {
    if (!canContinue) {
      setError(step === 0 ? 'Add an incident title, location and description to continue.' : 'Add the complainant name to continue.');
      return;
    }
    setError('');
    setStep(current => Math.min(current + 1, steps.length - 1));
  }

  function createCase(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setStep(0);
      setError('Complete the incident title, location and description before creating the case.');
      return;
    }
    if (!form.victim.trim()) {
      setStep(1);
      setError('Add the victim or complainant name before creating the case.');
      return;
    }
    const currentCases = readCases();
    const year = new Date().getFullYear();
    let sequence = currentCases.length + 1;
    let id = `CG-${year}-${String(sequence).padStart(3, '0')}`;
    while (currentCases.some(item => item.id === id)) {
      sequence += 1;
      id = `CG-${year}-${String(sequence).padStart(3, '0')}`;
    }
    const record = {
      ...form,
      id,
      status: 'Open',
      priority: 'Normal',
      officer: 'Priyanshu Macwan',
      evidence: files.length,
      fir: `FIR-${year}-${1080 + sequence}`,
    };
    saveCases([record, ...currentCases]);
    navigate(`/cases/${id}`);
  }

  function addFiles(event) {
    const added = Array.from(event.target.files || []).map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles(current => [...current, ...added]);
    event.target.value = '';
  }

  return (
    <WorkspaceShell title="NEW CASE">
      <div className="work-body">
        <div className="page-heading">
          <div><div className="eyebrow">Records / Registration</div><h1>Register a new case</h1><p>Create a structured case file. You can update the details later.</p></div>
          <span className="stamp neutral">DRAFT ENTRY</span>
        </div>
        <div className="stepper" role="group" aria-label="Case registration steps">
          {steps.map((label, index) => <button type="button" className={`step ${index === step ? 'current' : index < step ? 'visited' : ''}`} key={label} onClick={() => { setError(''); setStep(index); }} aria-current={index === step ? 'step' : undefined} aria-label={`Go to ${label} step`}>{index + 1}. {label}</button>)}
        </div>
        <form onSubmit={createCase}>
          <section className="panel">
            <div className="panel-title">{steps[step]} details <span className="small muted">STEP {step + 1} OF {steps.length}</span></div>
            <div className="panel-content">
              {step === 0 && <div className="form-grid">
                <Field label="Incident title *"><input className="field" required value={form.title} onChange={event => update('title', event.target.value)} placeholder="e.g. Theft at Central Market" /></Field>
                <Field label="Crime type"><select className="select" value={form.type} onChange={event => update('type', event.target.value)}>{['Theft', 'Robbery', 'Burglary', 'Fraud', 'Assault', 'Lost property', 'Other'].map(type => <option key={type}>{type}</option>)}</select></Field>
                <Field label="Date of incident"><input type="date" className="field" value={form.date} onChange={event => update('date', event.target.value)} /></Field>
                <Field label="Location *"><input className="field" required value={form.location} onChange={event => update('location', event.target.value)} placeholder="Street, area or landmark" /></Field>
                <Field label="Precinct / unit"><input className="field" value={form.precinct} onChange={event => update('precinct', event.target.value)} /></Field>
                <Field label="Incident description *" wide><textarea className="textarea" required rows="5" value={form.description} onChange={event => update('description', event.target.value)} placeholder="Record the reported facts, sequence of events and immediate risks." /></Field>
              </div>}
              {step === 1 && <div className="form-grid">
                <Field label="Victim / complainant name *"><input className="field" required value={form.victim} onChange={event => update('victim', event.target.value)} placeholder="Full name" /></Field>
                <Field label="Contact number"><input className="field" type="tel" value={form.contact} onChange={event => update('contact', event.target.value)} placeholder="Phone number" /></Field>
                <Field label="Statement notes" wide><textarea className="textarea" rows="5" value={form.notes} onChange={event => update('notes', event.target.value)} placeholder="Initial statement notes (optional)" /></Field>
              </div>}
              {step === 2 && <div className="form-grid">
                <Field label="Suspect name"><input className="field" value={form.suspect} onChange={event => update('suspect', event.target.value)} placeholder="Unknown / name if known" /></Field>
                <Field label="Suspect status"><select className="select" value={form.suspectStatus} onChange={event => update('suspectStatus', event.target.value)}>{['Unknown', 'At large', 'In custody', 'Identified'].map(status => <option key={status}>{status}</option>)}</select></Field>
                <Field label="Description / identifying details" wide><textarea className="textarea" rows="4" value={form.suspectDescription} onChange={event => update('suspectDescription', event.target.value)} placeholder="Appearance, clothing, direction of travel…" /></Field>
              </div>}
              {step === 3 && <div>
                <label className="dropzone" style={{ display: 'block' }}>
                  <b>＋ Attach evidence files</b><p className="muted">Choose images, audio, video or documents. Files stay in this browser demo.</p>
                  <input type="file" multiple hidden onChange={addFiles} />
                </label>
                {files.map(file => <div className="evidence-row" key={file.id}><div><b>{file.name}</b><div className="small muted">{(file.size / 1024).toFixed(1)} KB</div></div><button type="button" className="btn danger" onClick={() => setFiles(current => current.filter(item => item.id !== file.id))}><Trash/> Remove</button></div>)}
                <p className="small muted">You can also add evidence later from the case file.</p>
              </div>}
              {step === 4 && <div className="two-col">
                <div><h3>Incident</h3><p><b>{form.title}</b><br />{form.type} · {form.date}<br />{form.location}, Precinct {form.precinct}</p><p>{form.description}</p><h3>Complainant</h3><p>{form.victim} · {form.contact || 'No contact entered'}</p><p>{form.notes}</p><h3>Suspect</h3><p>{form.suspect || 'Unknown'} · {form.suspectStatus}</p><p>{form.suspectDescription}</p></div>
                <div><div className="notice"><b>Officer review required</b><br />This creates a case file only. Any AI generated legal document remains a draft until reviewed and approved.</div><h3 style={{ marginTop: 20 }}>Attached evidence ({files.length})</h3>{files.length ? files.map(file => <div key={file.id}>{file.name}</div>) : <p className="muted">No evidence attached.</p>}</div>
              </div>}
              {error && <p role="alert" className="form-error">{error}</p>}
              <div className="actions" style={{ justifyContent: 'space-between', marginTop: 24 }}>
                <button type="button" className="btn" disabled={step === 0} onClick={() => { setError(''); setStep(current => Math.max(0, current - 1)); }}><ArrowLeft/> Back</button>
                {step < steps.length - 1
                  ? <button type="button" className="btn primary" onClick={next}>Continue <ArrowRight/></button>
                  : <button type="submit" className="btn primary"><CheckCircle/> Create case file</button>}
              </div>
            </div>
          </section>
        </form>
      </div>
    </WorkspaceShell>
  );
}

function Field({ label, wide, children }) {
  return <div className={`form-field ${wide ? 'wide' : ''}`}><label>{label}</label>{children}</div>;
}
