// Kakao JS SDK type declarations
interface KakaoAuth {
  authorize(options: { redirectUri: string; scope?: string }): void;
  login(options: {
    success: (auth: { access_token: string }) => void;
    fail: (err: unknown) => void;
  }): void;
  logout(callback?: () => void): void;
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
}

interface KakaoAPI {
  request(options: {
    url: string;
    success: (res: KakaoUserResponse) => void;
    fail: (err: unknown) => void;
  }): void;
}

interface KakaoUserResponse {
  id: number;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
    };
  };
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Auth: KakaoAuth;
  API: KakaoAPI;
}

interface Window {
  Kakao: KakaoSDK;
}
