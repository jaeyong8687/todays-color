import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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

interface KakaoConfig {
  jsKey: string;
  restKey: string;
}

const AuthContext = createContext<AuthContextType>(null!);

let cachedConfig: KakaoConfig | null = null;

async function getKakaoConfig(): Promise<KakaoConfig> {
  if (cachedConfig) return cachedConfig;

  // Dev mode fallback — keys not truly secret (JS/REST are public), only client_secret is
  const isDev = window.location.port === '3100';
  if (isDev) {
    cachedConfig = {
      jsKey: '1ae868903d36799bf7977fefcd4aeca9',
      restKey: '2692bb6bfd60d791f357cbe2a321cab2',
    };
    return cachedConfig;
  }

  const res = await fetch('/api/kakao-config');
  if (!res.ok) throw new Error('Failed to fetch Kakao config');
  cachedConfig = await res.json();
  return cachedConfig!;
}

function initKakao(jsKey: string) {
  const kakao = window.Kakao;
  if (kakao && !kakao.isInitialized()) {
    kakao.init(jsKey);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KakaoUser | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    getKakaoConfig()
      .then((config) => {
        initKakao(config.jsKey);

        if (!code) {
          setLoading(false);
          return;
        }

        window.history.replaceState({}, '', window.location.pathname);

        // Token exchange goes through server-side proxy (client_secret stays on server)
        const isDev = window.location.port === '3100';
        const tokenPromise = isDev
          ? fetch('https://kauth.kakao.com/oauth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: config.restKey,
                client_secret: 'vUkJafcb45sQ1ebH0s48Eexrsl7D1kbv',
                redirect_uri: REDIRECT_URI,
                code,
              }),
            }).then((r) => r.json())
          : fetch('/api/kakao-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
            }).then((r) => r.json());

        return tokenPromise.then((data) => {
          if (!data.access_token) {
            throw new Error(data.error_description || 'Token exchange failed');
          }
          return fetch('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${data.access_token}` },
          }).then((r) => r.json());
        }).then((profile) => {
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
        });
      })
      .catch((err) => {
        console.error('[Kakao] Auth error:', err);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async () => {
    const config = await getKakaoConfig();
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${config.restKey}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
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
