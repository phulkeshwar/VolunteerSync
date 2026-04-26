import { useEffect, useState } from 'react';
import api from '../api/axios';

const AID_TYPES = ['Water', 'Food', 'Medical', 'Shelter', 'Medicine', 'Other'];

export default function BeneficiaryPage() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ totalPeopleReached: 0, totalHouseholds: 0, aidBreakdown: [] });
  const [form, setForm] = useState({ name: '', householdSize: 1, city: '', aidProvided: [], quantity: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [entriesRes, statsRes] = await Promise.all([
        api.get('/beneficiaries'),
        api.get('/beneficiaries/stats'),
      ]);
      setEntries(entriesRes.data);
      setStats(statsRes.data);
    } catch { /* ignore */ }
  }

  function toggleAid(aid) {
    setForm((f) => ({
      ...f,
      aidProvided: f.aidProvided.includes(aid) ? f.aidProvided.filter((a) => a !== aid) : [...f.aidProvided, aid],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.city || !form.aidProvided.length) return;
    setSaving(true);
    setMsg('');
    try {
      await api.post('/beneficiaries', form);
      setMsg('Aid logged successfully.');
      setForm({ name: '', householdSize: 1, city: '', aidProvided: [], quantity: '' });
      load();
    } catch {
      setMsg('Failed to log aid.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Beneficiary Tracking</p>
          <h1>Aid Accountability Register</h1>
          <p style={{ color: 'var(--text-muted)' }}>Log every person helped. What was provided. By whom. When.</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid">
        <article className="stat-card">
          <span className="muted-label">PEOPLE REACHED</span>
          <strong>{stats.totalPeopleReached.toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <span className="muted-label">HOUSEHOLDS</span>
          <strong>{stats.totalHouseholds}</strong>
        </article>
        {stats.aidBreakdown.slice(0, 2).map((a) => (
          <article key={a._id} className="stat-card">
            <span className="muted-label">{a._id.toUpperCase()}</span>
            <strong>{a.count}</strong>
          </article>
        ))}
      </div>

      <div className="beneficiary-layout">
        {/* Left — Quick Entry Form */}
        <aside className="panel">
          <h3 style={{ marginBottom: '1rem' }}>Log Aid Delivered</h3>
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label>BENEFICIARY NAME</label>
              <input placeholder="Name or 'Anonymous'" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="form-grid">
              <div className="field">
                <label>HOUSEHOLD SIZE</label>
                <input type="number" min={1} value={form.householdSize}
                  onChange={(e) => setForm((f) => ({ ...f, householdSize: +e.target.value }))} />
              </div>
              <div className="field">
                <label>CITY / ZONE</label>
                <input placeholder="Zone or city" value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
              </div>
            </div>

            <div className="field">
              <label>AID PROVIDED</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {AID_TYPES.map((aid) => (
                  <button key={aid} type="button"
                    className={`tag ${form.aidProvided.includes(aid) ? 'badge--success' : 'tag--interactive'}`}
                    onClick={() => toggleAid(aid)}>
                    {form.aidProvided.includes(aid) ? '✓ ' : ''}{aid}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>QUANTITY / NOTES</label>
              <input placeholder="e.g. 5 bags rice" value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </div>

            {msg && <p className={`form-message ${msg.includes('success') ? 'form-message--success' : 'form-message--error'}`}>{msg}</p>}

            <button type="submit" className="btn btn--primary btn--full" disabled={saving}>
              {saving ? 'Logging...' : '➕ Log Beneficiary'}
            </button>
          </form>
        </aside>

        {/* Right — Register Table */}
        <section className="panel panel--grow">
          <h3 style={{ marginBottom: '1rem' }}>Live Beneficiary Register</h3>
          <div className="ben-table-wrap">
            <table className="ben-table">
              <thead>
                <tr>
                  <th>REG ID</th>
                  <th>NAME</th>
                  <th>HH SIZE</th>
                  <th>ZONE</th>
                  <th>AID PROVIDED</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      #{e.id?.slice(-4).toUpperCase()}
                    </td>
                    <td>{e.name || 'Anonymous'}</td>
                    <td>{e.householdSize}</td>
                    <td>{e.city}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {(e.aidProvided || []).map((a) => (
                          <span key={a} className="badge badge--info" style={{ fontSize: '0.65rem' }}>{a}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {!entries.length && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No entries yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
