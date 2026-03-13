import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const KAKAO_JS_KEY = '1ae868903d36799bf7977fefcd4aeca9';
const KAKAO_REST_KEY = '287c36ef9b7ed66252194b6ec735c6f0';
const KAKAO_CLIENT_SECRET = '0IOIWQZoP3tMlN1WtAdICjiYDJ234Ebr';
const AUTH_STORAGE_KEY = 'todays-color-kakao-user';
const REDIRECT_URI = window.location.origin;

export interface KakaoUser {
  id: string;
  nickname: string;
  profileImage?: string;
}

interface AuthContextType {
  user: KakaoUser | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

function initKakao() {
  const kakao = window.Kakao;
  if (kakao && !kakao.isInitialized()) {
    kakao.init(KAKAO_JS_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KakaoUser | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount: init SDK + handle OAuth callback
  useEffect(() => {
    initKakao();

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);

      // Exchange code for token
      fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: KAKAO_REST_KEY,
          client_secret: KAKAO_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            // Fetch user info with the token
            return fetch('https://kapi.kakao.com/v2/user/me', {
              headers: { Authorization: `Bearer ${data.access_token}` },
            }).then((res) => res.json());
          }
          throw new Error(data.error_description || 'Token exchange failed');
        })
        .then((profile) => {
          const kakaoUser: KakaoUser = {
            id: String(profile.id),
            nickname: profile.kakao_account?.profile?.nickname
              || profile.properties?.nickname
              || '사용자',
            profileImage: profile.kakao_account?.profile?.thumbnail_image_url
              || profile.properties?.thumbnail_image,
          };
          setUser(kakaoUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(kakaoUser));
          setLoading(false);
        })
        .catch((err) => {
          console.error('[Kakao] Auth error:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Direct redirect to Kakao OAuth (no SDK dependency)
  const login = useCallback(() => {
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    window.location.href = url;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
