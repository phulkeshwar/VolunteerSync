import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SkillTagInput from '../Volunteer/SkillTagInput';

const INITIAL_FORM = {
  role: 'volunteer',
  name: '',
  email: '',
  password: '',
  organization: '',
  skills: [],
  location: { city: '' },
  availability: true,
  experience: 'Beginner',
  bio: '',
};

export default function Register() {
  const { register, getApiError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ loading: false, error: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: '' });

    try {
      const payload = {
        ...form,
        location: {
          city: form.location.city,
        },
      };

      const user = await register(payload);
      navigate(user.role === 'coordinator' ? '/dashboard' : '/tasks');
      setStatus({ loading: false, error: '' });
    } catch (error) {
      setStatus({ loading: false, error: getApiError(error, 'Unable to create your account.') });
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card--wide">
        <p className="eyebrow">Create account</p>
        <h1>Join the volunteer network</h1>
        <p>Pick your role, add your field context, and start coordinating work in real time.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Role</label>
            <div className="segmented-control">
              {['volunteer', 'coordinator'].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={form.role === role ? 'segmented-control__item active' : 'segmented-control__item'}
                  onClick={() => setForm((current) => ({ ...current, role }))}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                minLength="6"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>

            {form.role === 'coordinator' ? (
              <div className="field">
                <label>Organization</label>
                <input
                  value={form.organization}
                  onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))}
                />
              </div>
            ) : (
              <div className="field">
                <label>Experience</label>
                <select
                  value={form.experience}
                  onChange={(event) => setForm((current) => ({ ...current, experience: event.target.value }))}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
            )}
          </div>

          {form.role === 'volunteer' ? (
            <>
              <SkillTagInput
                value={form.skills}
                onChange={(skills) => setForm((current) => ({ ...current, skills }))}
              />

              <div className="form-grid">
                <div className="field">
                  <label>City</label>
                  <select
                    value={form.location.city}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        location: { ...current.location, city: event.target.value },
                      }))
                    }
                    required
                  >
                    <option value="" disabled>Select your city</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Surat">Surat</option>
                    <option value="Pune">Pune</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Indore">Indore</option>
                    <option value="Thane">Thane</option>
                    <option value="Bhopal">Bhopal</option>
                  </select>
                </div>

                <label className="checkbox checkbox--inline">
                  <input
                    type="checkbox"
                    checked={form.availability}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, availability: event.target.checked }))
                    }
                  />
                  <span>Available now</span>
                </label>
              </div>
            </>
          ) : null}

          <div className="field">
            <label>Bio</label>
            <textarea
              rows="3"
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </div>

          {status.error ? <p className="form-message form-message--error">{status.error}</p> : null}

          <button type="submit" className="btn btn--primary btn--full" disabled={status.loading}>
            {status.loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Login instead</Link>
        </p>
      </section>
    </div>
  );
}
