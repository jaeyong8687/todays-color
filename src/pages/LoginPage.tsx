import { useAuth } from '../hooks/useKakaoAuth';
import { useI18n } from '../i18n';
import LangSwitch from '../components/LangSwitch';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();

  const handleClick = () => {
    login();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <LangSwitch />
        </div>
        <div className="login-icon">🎨</div>
        <h1 className="login-title">{t.appName}</h1>
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
