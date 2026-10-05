import React from 'react';
import { MapPin, ArrowRight } from '@phosphor-icons/react';

export default function NewCase() {
  return (
    <div className="new-case-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Register New Case</h1>
          <p className="page-subtext">Complete initial documentation for FIR generation</p>
        </div>
        <div className="draft-timestamp">
          Draft: 09:41 AM
        </div>
      </div>

      <div className="stepper">
        <div className="step active">01 Case Details</div>
        <div className="step">02 Victim Info</div>
        <div className="step">03 Suspect Info</div>
        <div className="step">04 Statement</div>
        <div className="step">05 Review</div>
      </div>

      <div className="form-card">
        <h2 className="form-section-title">SEC 1. CASE DETAILS</h2>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Case Title</label>
            <input type="text" className="ledger-input" placeholder="Enter case title..." />
          </div>
        </div>

        <div className="form-row col-2">
          <div className="form-group">
            <label>Crime Type</label>
            <select className="ledger-input" defaultValue="">
              <option value="" disabled>Select crime type</option>
              <option value="theft">Theft / Burglary</option>
              <option value="assault">Assault</option>
              <option value="fraud">Fraud / Forgery</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Incident</label>
            <input type="date" className="ledger-input" />
          </div>
        </div>

        <div className="form-row col-2">
          <div className="form-group">
            <label>Time of Incident</label>
            <input type="time" className="ledger-input" />
          </div>
          <div className="form-group">
            <label>Location of Incident</label>
            <div className="input-with-icon">
              <input type="text" className="ledger-input" placeholder="Enter location..." />
              <MapPin weight="fill" className="input-icon" />
            </div>
          </div>
        </div>

        <div className="form-row col-2">
          <div className="form-group">
            <label>Police Station</label>
            <input type="text" className="ledger-input readonly" value="Precinct 7B" readOnly />
          </div>
          <div className="form-group">
            <label>Registering Officer</label>
            <input type="text" className="ledger-input readonly" value="Officer Priyanshu, Badge #4892" readOnly />
          </div>
        </div>

        <div className="priority-classification">
          <label className="priority-label">Case Priority Classification</label>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" name="priority" value="routine" defaultChecked />
              <span>Routine</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="priority" value="urgent" />
              <span>Urgent</span>
            </label>
            <label className="radio-option critical">
              <input type="radio" name="priority" value="critical" />
              <span>Critical (Immediate)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="sticky-action-bar">
        <button className="btn-draft">Save as Draft</button>
        <button className="btn-primary">
          Next: Victim Information <ArrowRight weight="bold" />
        </button>
      </div>
    </div>
  );
}
