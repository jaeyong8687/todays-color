import { useAuth } from '../hooks/useKakaoAuth';

export default function LoginPage() {
  const { login } = useAuth();

  const handleClick = () => {
    login();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🎨</div>
        <h1 className="login-title">오늘의 색</h1>
        <p className="login-subtitle">
          매일 한 가지 색으로<br />나의 하루를 기록해보세요
        </p>

        <button
          className="kakao-login-btn"
          onClick={handleClick}
          type="button"
        >
          💬 카카오 로그인
        </button>

        <p className="login-footer">
          간편하게 카카오 계정으로 시작하세요
        </p>
      </div>
    </div>
  );
}
