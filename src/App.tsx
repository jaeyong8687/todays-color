import { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useKakaoAuth';
import { ProfileProvider } from './hooks/useProfile';
import { I18nProvider, useI18n } from './i18n';
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
  const { t, lang, setLang } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Scope storage to this user's Kakao ID
  if (user) setAccountId(user.id);

  const handleLogout = () => {
    if (confirm(t.logoutConfirm)) {
      logout();
    }
    setShowMenu(false);
  };

  const toggleLang = () => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  };

  return (
    <ProfileProvider>
      <div className="app">
        <div className="app-header">
          <span className="app-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>오늘의 색</span>
          <div className="header-right">
            <ProfileSelector />
            <div className="user-menu-wrapper">
            <button className="user-btn" onClick={() => setShowMenu(!showMenu)} aria-label="User menu">
              <span className="logout-avatar">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="" className="logout-img" />
                  : '👤'}
              </span>
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
                  <button className="dropdown-item lang-toggle" onClick={toggleLang}>
                    <span>{lang === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English'}</span>
                    <span className="lang-toggle-hint">{lang === 'ko' ? '→ EN' : '→ KO'}</span>
                  </button>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    {t.logout}
                  </button>
                </div>
              </>
            )}
          </div>
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
      <I18nProvider>
        <AuthProvider>
          <AppGate />
        </AuthProvider>
      </I18nProvider>
    </HashRouter>
  );
}
