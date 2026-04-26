import { useState } from 'react';
import api from '../../api/axios';
import Badge from '../shared/Badge';

export default function VolunteerSearch() {
  const [cityQuery, setCityQuery] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const searchVolunteers = async (city) => {
    if (!city) return;
    setLoadingVolunteers(true);
    setError('');
    try {
      const res = await api.get(`/volunteers?city=${encodeURIComponent(city)}`);
      setVolunteers(res.data);
      setHasSearched(true);
    } catch (err) {
      setError('Failed to find volunteers.');
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    searchVolunteers(cityQuery);
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use free BigDataCloud reverse geocoding API to get city
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();
          const foundCity = data.city || data.locality || '';
          
          if (foundCity) {
            setCityQuery(foundCity);
            await searchVolunteers(foundCity);
          } else {
            setError('Could not determine your city from coordinates.');
          }
        } catch (err) {
          setError('Failed to fetch location data.');
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        setLoadingLocation(false);
        setError('Unable to retrieve your location. Please allow GPS access.');
      }
    );
  };

  return (
    <section className="panel panel--span-2">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Volunteer Directory</p>
          <h3>Search Volunteers by Location</h3>
        </div>
      </div>

      <form className="volunteer-search-form" onSubmit={handleManualSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Enter city (e.g., Delhi, Mumbai)"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            required
            className="search-input"
          />
          <button type="submit" className="btn btn--primary" disabled={loadingVolunteers || !cityQuery}>
            {loadingVolunteers ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="btn btn--secondary" onClick={handleGPSLocation} disabled={loadingLocation}>
            {loadingLocation ? 'Locating...' : '📍 Use My GPS'}
          </button>
        </div>
        {error && <p className="form-message form-message--error" style={{ marginTop: '0.5rem' }}>{error}</p>}
      </form>

      {hasSearched && (
        <div className="search-results" style={{ marginTop: '1.5rem' }}>
          <h4>{volunteers.length} volunteer(s) found in "{cityQuery}"</h4>
          <div className="stack-list" style={{ marginTop: '1rem' }}>
            {volunteers.map(vol => (
              <article key={vol.id} className="mini-card">
                <div className="mini-card__head" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <strong>{vol.name}</strong>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Badge variant={vol.availability ? 'success' : 'default'}>
                      {vol.availability ? 'Available' : 'Busy'}
                    </Badge>
                    <Badge variant="info">{vol.experience}</Badge>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  <p>Reputation: {vol.reputationScore}</p>
                  <p className="muted-text">{vol.skills?.slice(0, 3).join(', ')}{vol.skills?.length > 3 ? '...' : ''}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
