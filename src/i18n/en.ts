import type { Translations } from './types';

export const en: Translations = {
  appName: "Today's Color",
  logout: 'Log out',
  logoutConfirm: 'Are you sure you want to log out?',

  navHome: "Today's Color",
  navCalendar: 'Calendar',
  navAnalysis: 'Analysis',

  loginSubtitle: 'Record your day\nwith one color every day',
  loginButton: '💬 Log in with Kakao',
  loginFooter: 'Start easily with your Kakao account',

  homeTitle: "Today's Color 🎨",
  homePrompt: 'Express your mood with a color',
  todayColor: "Today's color",
  savedToast: "✨ Today's color has been saved!",

  confirmColor: 'Choose this color',
  moodQuestion: 'How are you feeling today?',
  memoPlaceholder: 'Want to say more? Go ahead ✏️',
  saveColor: "Save today's color",
  rePickColor: '← Pick another color',

  calendarTitle: 'My Color Calendar 📅',
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  yearMonth: (y, m) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${y}`,
  dayRecords: (n) => `${n} days recorded`,
  dateFormat: (y, m, d) => `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(m) - 1]} ${parseInt(d)}, ${y}`,
  editRecord: '✏️ Edit',
  noRecord: 'No color recorded for this day.',
  addColor: '🎨 Add a color for this day',
  calendarHint: 'Tap a date to see the record',
  noFuture: "Future dates can't be selected",
  close: '✕ Close',
  deleteBtn: 'Delete',

  addProfile: '+ Add',
  profileNamePlaceholder: 'Name (e.g. Daughter)',
  createBtn: 'Create',
  deleteProfile: (name) => `Delete "${name}" profile`,

  analysisTitle: 'Emotion Analysis 🧠',
  insights: '💡 Insights',
  topEmotion: '🏆 Most felt emotion',
  emotionDist: '📊 Emotion distribution',
  emotionChart: '📈 Emotion chart',
  recordCount: 'Records',
  totalOfRecords: (total, count) => `${count} out of ${total} records`,
  emptyState: "No records yet.\nPick today's color to\nstart your emotion analysis!",

  aiTitle: '🤖 AI Deep Analysis',
  aiLocked: (remaining) => `Record ${remaining} more days to unlock AI analysis!`,
  aiProgress: (current) => `${current}/7 days`,
  aiDescription: (count) => `AI will analyze your ${count} days of records to create a deep emotional report.`,
  aiStart: '✨ Start AI Analysis',
  aiTokenNeeded: 'Requires a GitHub token (free)',
  aiTokenInstructions: [
    'Visit github.com/settings/tokens',
    'Click "Generate new token (classic)"',
    'Enter a name, no permissions needed',
    'Copy the generated token',
  ],
  aiTokenPlaceholder: 'ghp_xxxxxxxxxxxx',
  aiSaveAndStart: 'Save & start analysis',
  aiCancel: 'Cancel',
  aiLoading: 'AI is analyzing your emotion patterns...',
  aiRetryToken: 'Re-enter token',
  aiRetry: '🔄 Analyze again',
  aiNoResult: 'No analysis result received.',
  aiUnknownError: 'Unknown error',
  aiApiError: (code) => `API error (${code})`,

  aiSystemPrompt: `You are an expert in color psychology and emotional analysis. Analyze the user's daily color and emotion records.

Analyze:
1. Overall emotional flow and patterns
2. Psychological state revealed through color choices
3. Emotional change trends over time
4. Patterns that need attention (consecutive negative emotions, etc.)
5. Positive points and words of encouragement

Respond in a warm, empathetic tone in English, 3-5 paragraphs. Use emojis appropriately.`,

  colorFamilies: {
    '빨강': 'Red', '주황': 'Orange', '노랑': 'Yellow', '연두': 'Lime',
    '초록': 'Green', '청록': 'Teal', '파랑': 'Blue', '남색': 'Indigo',
    '보라': 'Purple', '자주': 'Magenta', '분홍': 'Pink',
  },
  brightnessLevels: { veryDark: 'Very dark', dark: 'Dark', normal: '', bright: 'Bright', veryBright: 'Very bright' },
  saturationLevels: { grayish: 'Grayish', muted: 'Muted', normal: '', vivid: 'Vivid' },

  emotions: {
    '빨강': { primary: 'Passion', secondary: 'Energy', emoji: '🔥', descriptions: ['A day full of intense energy', 'A moment burning with passion', 'A time of courage and determination'] },
    '주황': { primary: 'Warmth', secondary: 'Vitality', emoji: '🌅', descriptions: ['A day wrapped in warmth', 'Feeling lively and social', 'A moment of creative inspiration'] },
    '노랑': { primary: 'Happiness', secondary: 'Optimism', emoji: '☀️', descriptions: ['A day of bright, positive energy', 'Time shining with hope and joy', 'Full of confidence and cheer'] },
    '연두': { primary: 'Freshness', secondary: 'Hope', emoji: '🌱', descriptions: ['An exciting day of new beginnings', 'Fresh ideas sprouting up', 'A sense of growth and progress'] },
    '초록': { primary: 'Stability', secondary: 'Harmony', emoji: '🌿', descriptions: ['A calm and peaceful day', 'Feeling at one with nature', 'A moment of balanced harmony'] },
    '청록': { primary: 'Clarity', secondary: 'Freedom', emoji: '🌊', descriptions: ['A day of clear, open mind', 'Feeling free and refreshed', 'A moment of clean clarity'] },
    '파랑': { primary: 'Serenity', secondary: 'Trust', emoji: '💙', descriptions: ['A quiet, peaceful day', 'Time spent in deep reflection', 'A calm and trustworthy moment'] },
    '남색': { primary: 'Focus', secondary: 'Wisdom', emoji: '🔮', descriptions: ['A day of deep concentration', 'Listening to inner wisdom', 'A serious, reflective moment'] },
    '보라': { primary: 'Inspiration', secondary: 'Mystery', emoji: '✨', descriptions: ['A day full of creative inspiration', 'Immersed in mysterious beauty', 'Heightened artistic sensitivity'] },
    '자주': { primary: 'Dignity', secondary: 'Pride', emoji: '👑', descriptions: ['A day of pride and grace', 'An elegant and confident time', 'Confirming inner strength'] },
    '분홍': { primary: 'Love', secondary: 'Tenderness', emoji: '💗', descriptions: ['A day overflowing with love', 'Wrapped in soft emotions', 'A moment of warm connection'] },
  },
  lightEmotions: {
    '가벼움': { primary: 'Lightness', secondary: 'Cheerful', emoji: '🎈', descriptions: ['A light and cheerful day'] },
    '피곤함': { primary: 'Tiredness', secondary: 'Fatigue', emoji: '😮‍💨', descriptions: ['Feeling a bit tired and in need of rest'] },
    '무덤덤': { primary: 'Neutral', secondary: 'Ordinary', emoji: '😐', descriptions: ['An ordinary day without strong emotions'] },
    '고요': { primary: 'Stillness', secondary: 'Calm', emoji: '🌙', descriptions: ['A quietly settling mind'] },
    '우울': { primary: 'Melancholy', secondary: 'Loneliness', emoji: '🌧️', descriptions: ['Feeling a bit blue and lonely'] },
    '설렘': { primary: 'Excitement', secondary: 'Anticipation', emoji: '💫', descriptions: ['An exciting day full of anticipation'] },
  },

  weekdayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  insightMessages: {
    dominantEmotion: (emotion, pct) => `It accounts for ${pct}% of all your records.`,
    dominantPositive: "You're in an energetic phase!",
    dominantCalm: "You're going through a stable period.",
    dominantDefault: 'Take time to listen to your inner emotions.',
    brightWeek: (count) => `${count} of the last 7 days had bright emotions. Keep up the good vibes!`,
    darkWeek: (count) => `${count} of the last 7 days felt low or tired. Are you getting enough rest?`,
    weekdayPattern: (day, pct) => `${pct}% of your ${day} records are dark emotions. Try scheduling some rest on those days.`,
    brightColors: (avg) => `Your recent average brightness is ${avg}%. You seem to be in a positive, energetic phase.`,
    darkColors: (avg) => `Your recent average brightness is ${avg}%. If things feel heavy, try talking to someone close.`,
    emotionStreak: (emotion) => `The same emotion for 5 days straight. Maybe try a new activity or change of scenery?`,
    consistency: (count) => `You recorded ${count} of the last 7 days. Great habit of reflecting on your emotions!`,
  },

  defaultProfileName: 'Me',
  defaultUserName: 'User',
};
