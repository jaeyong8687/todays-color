import { useState } from 'react';
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
  const [showMenu, setShowMenu] = useState(false);

  // Scope storage to this user's Kakao ID
  if (user) setAccountId(user.id);

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠어요?')) {
      logout();
    }
    setShowMenu(false);
  };

  return (
    <ProfileProvider>
      <div className="app">
        <div className="app-header">
          <ProfileSelector />
          <div className="user-menu-wrapper">
            <button className="user-btn" onClick={() => setShowMenu(!showMenu)}>
              <span className="logout-avatar">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="" className="logout-img" />
                  : '👤'}
              </span>
              <span className="logout-name">{user?.nickname}</span>
            </button>
            {showMenu && (
              <>
                <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
                <div className="user-dropdown">
                  <div className="dropdown-user">
                    <span className="logout-avatar" style={{ width: 32, height: 32, fontSize: 18 }}>
                      {user?.profileImage
                        ? <img src={user.profileImage} alt="" className="logout-img" />
                        : '👤'}
                    </span>
                    <span style={{ fontWeight: 600 }}>{user?.nickname}</span>
                  </div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
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
