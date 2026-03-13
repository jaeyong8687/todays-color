import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useKakaoAuth';
import { ProfileProvider } from './hooks/useProfile';
import NavBar from './components/NavBar';
import ProfileSelector from './components/ProfileSelector';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import AnalysisPage from './pages/AnalysisPage';
import LoginPage from './pages/LoginPage';
import { setAccountId } from './utils/storage';
import './styles/global.css';

function AuthenticatedApp() {
  const { user, logout } = useAuth();

  // Scope storage to this user's Kakao ID
  if (user) setAccountId(user.id);

  return (
    <ProfileProvider>
      <div className="app">
        <div className="app-header">
          <ProfileSelector />
          <button className="logout-btn" onClick={logout} title="로그아웃">
            <span className="logout-avatar">
              {user?.profileImage
                ? <img src={user.profileImage} alt="" className="logout-img" />
                : '👤'}
            </span>
            <span className="logout-name">{user?.nickname}</span>
          </button>
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
        <NavBar />
      </div>
    </ProfileProvider>
  );
}

function AppGate() {
  const { user, loading } = useAuth();

  if (loading) return <div className="app loading-screen">🎨</div>;
  if (!user) return <LoginPage />;
  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </HashRouter>
  );
}
