import { useState } from 'react';
import api from '../api/axios';

const NEED_TYPES = [
  { id: 'water', emoji: '💧', label: 'Water' },
  { id: 'food', emoji: '🍱', label: 'Food' },
  { id: 'medical', emoji: '🏥', label: 'Medical' },
  { id: 'shelter', emoji: '🏠', label: 'Shelter' },
  { id: 'clothing', emoji: '👕', label: 'Clothing' },
  { id: 'rescue', emoji: '🆘', label: 'Rescue' },
];

const URGENCY = [
  { id: 'can_wait', label: 'Can Wait (24-48h)', icon: '🕐', color: 'var(--success)' },
  { id: 'need_soon', label: 'Need Soon (12-24h)', icon: '⏳', color: 'var(--warning)' },
  { id: 'emergency', label: 'Emergency Now', icon: '⚠️', color: 'var(--danger)' },
];

export default function ReportNeedPage() {
  const [needs, setNeeds] = useState([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [urgency, setUrgency] = useState('');
  const [details, setDetails] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  function toggleNeed(id) {
    setNeeds((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);
  }

  function getGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: '' });
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!needs.length || !urgency) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/reports', {
        needs, peopleCount, urgency, location, contactPhone, details,
      });
      setSubmitted(data);
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="report-page">
        <div className="report-success">
          <div className="report-success__icon">✓</div>
          <h2>Report Confirmed</h2>
          <p>Your critical need has been logged and routed to the nearest available response unit.</p>
          <div className="report-success__id">
            <span className="muted-label">REPORT ID</span>
            <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.3rem' }}>
              #VR-{submitted.id?.slice(-4).toUpperCase() || '0000'}
            </strong>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Expected response in 15–30 minutes. Share this page with others who need help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <h1>Disaster Relief — Report a Need</h1>
        <p>Submit your location and what you need. No account required.</p>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        {/* Need types */}
        <div className="field">
          <label>WHAT DO YOU NEED?</label>
          <div className="report-chips">
            {NEED_TYPES.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`report-chip ${needs.includes(n.id) ? 'report-chip--active' : ''}`}
                onClick={() => toggleNeed(n.id)}
              >
                {n.emoji} {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* People count */}
        <div className="field">
          <label>NUMBER OF PEOPLE</label>
          <div className="report-stepper">
            <button type="button" onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}>−</button>
            <span>{peopleCount}</span>
            <button type="button" onClick={() => setPeopleCount(peopleCount + 1)}>+</button>
          </div>
        </div>

        {/* Location */}
        <div className="field">
          <label>CURRENT LOCATION</label>
          <button type="button" className="btn btn--primary" onClick={getGPS} disabled={gpsLoading}>
            {gpsLoading ? 'Getting location...' : '📍 Get GPS'}
          </button>
          {location.lat && (
            <p style={{ fontSize: '0.82rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
              Lat: {location.lat.toFixed(3)}, Lng: {location.lng.toFixed(3)}
            </p>
          )}
        </div>

        {/* Urgency */}
        <div className="field">
          <label>URGENCY LEVEL</label>
          <div className="report-urgency-group">
            {URGENCY.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`report-urgency-btn ${urgency === u.id ? 'report-urgency-btn--active' : ''}`}
                style={urgency === u.id ? { borderColor: u.color, background: u.color + '18' } : {}}
                onClick={() => setUrgency(u.id)}
              >
                {u.icon} {u.label}
                {urgency === u.id && <span className="pulse-dot" style={{ background: u.color }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="field">
          <label>ADDITIONAL DETAILS (optional)</label>
          <textarea
            rows={3}
            maxLength={300}
            placeholder="Describe your situation..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="field">
          <label>CONTACT PHONE (optional)</label>
          <input
            type="tel"
            placeholder="So coordinator can call you"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`btn btn--full ${urgency === 'emergency' ? 'btn--danger' : 'btn--primary'}`}
          disabled={submitting || !needs.length || !urgency}
        >
          {submitting ? 'Submitting...' : 'Submit Emergency Report →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          By submitting, you agree to share location data with response teams.
        </p>
      </form>
    </div>
  );
}
