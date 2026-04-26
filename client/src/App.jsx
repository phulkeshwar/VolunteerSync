import { Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/shared/Sidebar';
import TopBar from './components/shared/TopBar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AnalyticsPage from './pages/AnalyticsPage';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import TasksPage from './pages/TasksPage';
import ResourcesPage from './pages/ResourcesPage';
import CrisisPage from './pages/CrisisPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ReportNeedPage from './pages/ReportNeedPage';
import BeneficiaryPage from './pages/BeneficiaryPage';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__body">
        <TopBar />
        <main className="app-shell__main">
          <div className="container">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/report" element={<ReportNeedPage />} />

              {/* Volunteer */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Route>

              {/* Coordinator */}
              <Route element={<ProtectedRoute roles={['coordinator']} />}>
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/crisis" element={<CrisisPage />} />
                <Route path="/beneficiaries" element={<BeneficiaryPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
