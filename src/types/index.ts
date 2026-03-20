export interface ColorInfo {
  hex: string;
  hsl: string;
  hue: number;
  saturation: number;
  lightness: number;
  name: string;
  emotionGroup: string;
}

export interface ColorRecord {
  date: string;
  color: ColorInfo;
  memo: string;
  emotion: EmotionResult;
  tags?: string[];
}

export interface EmotionResult {
  primary: string;
  secondary: string;
  intensity: number; // 0-100
  description: string;
  emoji: string;
}

export interface Profile {
  id: string;
  name: string;
  emoji: string;
}

export interface User {
  id: string;
  nickname: string;
}

export interface MonthlyStats {
  month: string;
  emotions: Record<string, number>;
  dominantEmotion: string;
  totalRecords: number;
}
