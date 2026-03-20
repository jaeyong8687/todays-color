import { useAuth } from '../hooks/useKakaoAuth';
import { useI18n } from '../i18n';

export default function LoginPage() {
  const { login } = useAuth();
  const { t, lang, setLang } = useI18n();

  const handleClick = () => {
    login();
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="login-orb orb-1" />
        <div className="login-orb orb-2" />
        <div className="login-orb orb-3" />
      </div>
      <button
        className="login-lang-btn"
        onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
        aria-label="Switch language"
      >
        {lang === 'ko' ? '🇰🇷' : '🇺🇸'}
      </button>
      <div className="login-card">
        <div className="login-icon"></div>
        <h1 className="login-title app-logo" style={{ fontSize: 36, WebkitTextFillColor: 'transparent' }}>{t.appName}</h1>
        <p className="login-subtitle">
          {t.loginSubtitle.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        <button
          className="kakao-login-btn"
          onClick={handleClick}
          type="button"
        >
          {t.loginButton}
        </button>

        <p className="login-footer">
          {t.loginFooter}
        </p>
      </div>
    </div>
  );
}
