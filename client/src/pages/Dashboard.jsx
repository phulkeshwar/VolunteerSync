import { useEffect, useState } from 'react';
import api from '../api/axios';
import CoordinatorDashboard from '../components/Dashboard/CoordinatorDashboard';
import Loader from '../components/shared/Loader';
import VolunteerProfile from '../components/Volunteer/VolunteerProfile';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

const EMPTY_OVERVIEW = {
  totalVolunteers: 0,
  availableVolunteers: 0,
  totalTasks: 0,
  openTasks: 0,
  completedToday: 0,
  criticalPending: 0,
  completionRate: '0%',
  statusBreakdown: [],
};

export default function Dashboard() {
  const { user, getApiError } = useAuth();
  const { activity, lastEvent } = useSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        if (user.role === 'coordinator') {
          const [overviewResponse, tasksResponse] = await Promise.all([
            api.get('/analytics/overview'),
            api.get('/tasks'),
          ]);

          if (!ignore) {
            setOverview(overviewResponse.data);
            setTasks(tasksResponse.data);
          }
        } else {
          const tasksResponse = await api.get(`/tasks?assignedTo=${user.id}`);

          if (!ignore) {
            setTasks(tasksResponse.data);
          }
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getApiError(requestError, 'Failed to load the dashboard.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [getApiError, lastEvent?.timestamp, user]);

  if (loading) {
    return <Loader label="Loading dashboard" />;
  }

  return (
    <div className="page">
      {error ? <p className="form-message form-message--error">{error}</p> : null}

      {user.role === 'coordinator' ? (
        <CoordinatorDashboard overview={overview} tasks={tasks} activity={activity} />
      ) : (
        <VolunteerProfile activeTasks={tasks} />
      )}

      <footer className="dashboard-footer" style={{ marginTop: 'auto', padding: '2rem 0', textAlign: 'center', color: '#6B7280', fontSize: '0.85rem', borderTop: '1px solid #374151', paddingTop: '1.5rem', marginTop: '3rem' }}>
        <p>© 2026 VolunteerSync. All rights reserved.</p>
        <p style={{ marginTop: '0.25rem' }}>AI-Powered Coordination • Real-World Impact</p>
      </footer>
    </div>
  );
}
