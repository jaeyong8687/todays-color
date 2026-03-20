export type Lang = 'ko' | 'en';

export interface Translations {
  // App
  appName: string;
  logout: string;
  logoutConfirm: string;

  // Nav
  navHome: string;
  navCalendar: string;
  navAnalysis: string;

  // Login
  loginSubtitle: string;
  loginButton: string;
  loginFooter: string;

  // Home
  homeTitle: string;
  homePrompt: string;
  todayColor: string;
  savedToast: string;

  // Color Picker
  confirmColor: string;
  moodQuestion: string;
  memoPlaceholder: string;
  saveColor: string;
  rePickColor: string;

  // Calendar
  calendarTitle: string;
  weekdays: string[];
  yearMonth: (y: number, m: number) => string;
  dayRecords: (n: number) => string;
  dateFormat: (y: string, m: string, d: string) => string;
  editRecord: string;
  noRecord: string;
  addColor: string;
  calendarHint: string;
  noFuture: string;
  close: string;
  deleteBtn: string;

  // Profile
  addProfile: string;
  profileNamePlaceholder: string;
  createBtn: string;
  deleteProfile: (name: string) => string;

  // Analysis
  analysisTitle: string;
  insights: string;
  topEmotion: string;
  emotionDist: string;
  emotionChart: string;
  recordCount: string;
  totalOfRecords: (total: number, count: number) => string;
  emptyState: string;
  colorDotChart: string;
  colorRadialMap: string;
  colorMapFrequency: string;
  tabEmotion: string;
  tabColor: string;
  tabAI: string;

  // AI Analysis
  aiTitle: string;
  aiLocked: (remaining: number) => string;
  aiProgress: (current: number) => string;
  aiDescription: (count: number) => string;
  aiStart: string;
  aiTokenNeeded: string;
  aiTokenInstructions: string[];
  aiTokenPlaceholder: string;
  aiSaveAndStart: string;
  aiCancel: string;
  aiLoading: string;
  aiRetryToken: string;
  aiRetry: string;
  aiNoResult: string;
  aiUnknownError: string;
  aiApiError: (code: number) => string;

  // AI Prompt
  aiSystemPrompt: string;

  // Color names
  colorFamilies: Record<string, string>;
  brightnessLevels: Record<string, string>;
  saturationLevels: Record<string, string>;

  // Emotions
  emotions: Record<string, { primary: string; secondary: string; emoji: string; descriptions: string[] }>;
  lightEmotions: Record<string, { primary: string; secondary: string; emoji: string; descriptions: string[] }>;

  // Insights
  weekdayNames: string[];
  insightMessages: {
    dominantEmotion: (emotion: string, pct: number) => string;
    dominantPositive: string;
    dominantCalm: string;
    dominantDefault: string;
    brightWeek: (count: number) => string;
    darkWeek: (count: number) => string;
    weekdayPattern: (day: string, pct: number) => string;
    brightColors: (avg: number) => string;
    darkColors: (avg: number) => string;
    emotionStreak: (emotion: string) => string;
    consistency: (count: number) => string;
  };

  // Date formatting
  formatFullDate: (date: Date) => string;

  // Default profile
  defaultProfileName: string;
  defaultUserName: string;
}
