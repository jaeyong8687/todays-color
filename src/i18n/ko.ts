import type { Translations } from './types';

export const ko: Translations = {
  appName: '오늘의 색',
  logout: '로그아웃',
  logoutConfirm: '로그아웃 하시겠어요?',

  navHome: '오늘의 색',
  navCalendar: '캘린더',
  navAnalysis: '감정 분석',

  loginSubtitle: '매일 한 가지 색으로\n나의 하루를 기록해보세요',
  loginButton: '💬 카카오 로그인',
  loginFooter: '간편하게 카카오 계정으로 시작하세요',

  homeTitle: '오늘의 색 🎨',
  homePrompt: '오늘의 기분을 색으로 표현해보세요',
  todayColor: '오늘의 색',
  savedToast: '✨ 오늘의 색이 저장되었어요!',

  confirmColor: '이 색으로 정하기',
  moodQuestion: '오늘 기분이 어때요?',
  memoPlaceholder: '더 이야기하고 싶다면 자유롭게 ✏️',
  saveColor: '오늘의 색 저장하기',
  rePickColor: '← 색 다시 고르기',
  emotionTags: '감정 태그',
  tagPlaceholder: '태그 추가...',
  recentTags: '최근 태그',
  removeTag: (tag) => `${tag} 태그 삭제`,

  calendarTitle: '나의 색 캘린더 📅',
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
  yearMonth: (y, m) => `${y}년 ${m}월`,
  dayRecords: (n) => `${n}일 기록`,
  dateFormat: (y, m, d) => `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`,
  editRecord: '✏️ 수정하기',
  noRecord: '이 날은 색을 기록하지 않았어요.',
  addColor: '🎨 이 날의 색 추가하기',
  calendarHint: '날짜를 눌러 기록을 확인하세요',
  noFuture: '미래 날짜는 선택할 수 없어요',
  close: '✕ 닫기',
  deleteBtn: '삭제',

  addProfile: '+ 추가',
  profileNamePlaceholder: '이름 (예: 딸)',
  createBtn: '만들기',
  deleteProfile: (name) => `"${name}" 프로필 삭제`,

  analysisTitle: '감정 분석 🧠',
  insights: '💡 인사이트',
  topEmotion: '🏆 가장 많이 느낀 감정',
  emotionDist: '📊 감정 분포',
  emotionChart: '📈 감정 차트',
  recordCount: '기록 수',
  totalOfRecords: (total, count) => `총 ${total}개의 기록 중 ${count}번`,
  emptyState: '아직 기록이 없어요.\n오늘의 색을 선택하면\n감정 분석이 시작됩니다!',
  colorDotChart: '🎯 색상 분포 차트',
  colorRadialMap: '🌈 색상 분포 맵',
  colorMapFrequency: '빈도',
  tabEmotion: '감정',
  tabColor: '색상',
  tabAI: 'AI',
  tabMemo: '💬 메모',

  aiTitle: '🤖 AI 심층 분석',
  aiLocked: (remaining) => `${remaining}일 더 기록하면 AI 분석을 받을 수 있어요!`,
  aiProgress: (current) => `${current}/7일`,
  aiDescription: (count) => `${count}일의 기록을 AI가 분석하여 심층적인 감정 리포트를 만들어줍니다.`,
  aiStart: '✨ AI 분석 시작하기',
  aiTokenNeeded: 'GitHub 토큰이 필요합니다 (무료)',
  aiTokenInstructions: [
    'github.com/settings/tokens 방문',
    '"Generate new token (classic)" 클릭',
    '이름 입력, 권한은 아무것도 체크 안 해도 OK',
    '생성된 토큰 복사',
  ],
  aiTokenPlaceholder: 'ghp_xxxxxxxxxxxx',
  aiSaveAndStart: '저장 & 분석 시작',
  aiCancel: '취소',
  aiLoading: 'AI가 감정 패턴을 분석하고 있어요...',
  aiRetryToken: '토큰 다시 입력',
  aiRetry: '🔄 다시 분석하기',
  aiNoResult: '분석 결과를 받지 못했습니다.',
  aiUnknownError: '알 수 없는 오류',
  aiApiError: (code) => `API 오류 (${code})`,

  aiSystemPrompt: `당신은 색채심리학과 감정 분석 전문가입니다. 사용자가 매일 선택한 색과 감정 기록을 분석해주세요.

분석해야 할 것:
1. 전반적인 감정 흐름과 패턴
2. 색상 선택에서 드러나는 심리 상태
3. 시간에 따른 감정 변화 트렌드
4. 주의가 필요한 패턴 (연속된 부정적 감정 등)
5. 긍정적인 점과 격려의 말

따뜻하고 공감적인 톤으로, 한국어로 3-5문단으로 답변해주세요. 이모지를 적절히 사용하세요.`,

  colorFamilies: {
    '빨강': '빨강', '주황': '주황', '노랑': '노랑', '연두': '연두',
    '초록': '초록', '청록': '청록', '파랑': '파랑', '남색': '남색',
    '보라': '보라', '자주': '자주', '분홍': '분홍',
  },
  brightnessLevels: { veryDark: '아주 어두운', dark: '어두운', normal: '', bright: '밝은', veryBright: '아주 밝은' },
  saturationLevels: { grayish: '회색빛', muted: '흐린', normal: '', vivid: '선명한' },

  emotions: {
    '빨강': { primary: '열정', secondary: '에너지', emoji: '🔥', descriptions: ['강렬한 에너지가 느껴지는 하루', '뜨거운 열정으로 가득한 순간', '용기와 결단력이 넘치는 때'] },
    '주황': { primary: '따뜻함', secondary: '활력', emoji: '🌅', descriptions: ['따뜻한 온기가 감도는 하루', '활기차고 사교적인 기분', '창의적 영감이 떠오르는 순간'] },
    '노랑': { primary: '행복', secondary: '낙관', emoji: '☀️', descriptions: ['밝고 긍정적인 에너지의 하루', '희망과 기쁨으로 빛나는 시간', '자신감과 명랑함이 가득한 순간'] },
    '연두': { primary: '새로움', secondary: '희망', emoji: '🌱', descriptions: ['새로운 시작의 설렘이 있는 하루', '신선한 아이디어가 샘솟는 순간', '성장하고 있다는 느낌의 시간'] },
    '초록': { primary: '안정', secondary: '조화', emoji: '🌿', descriptions: ['마음이 편안하고 안정된 하루', '자연과 하나 된 듯한 평화로움', '균형 잡힌 조화를 느끼는 순간'] },
    '청록': { primary: '맑음', secondary: '자유', emoji: '🌊', descriptions: ['맑고 투명한 마음의 하루', '자유롭고 시원한 기분', '깨끗하게 정리된 느낌의 순간'] },
    '파랑': { primary: '평온', secondary: '신뢰', emoji: '💙', descriptions: ['고요하고 평화로운 하루', '깊은 사색에 잠기는 시간', '차분하고 신뢰감 있는 순간'] },
    '남색': { primary: '집중', secondary: '지혜', emoji: '🔮', descriptions: ['깊은 집중력을 발휘한 하루', '내면의 지혜에 귀 기울이는 시간', '진지하고 성찰적인 순간'] },
    '보라': { primary: '영감', secondary: '신비', emoji: '✨', descriptions: ['창의적 영감이 가득한 하루', '신비로운 감성에 젖는 시간', '예술적 감수성이 높아지는 순간'] },
    '자주': { primary: '고귀', secondary: '자부심', emoji: '👑', descriptions: ['자부심과 품격을 느끼는 하루', '우아하고 당당한 시간', '내면의 힘을 확인하는 순간'] },
    '분홍': { primary: '사랑', secondary: '다정함', emoji: '💗', descriptions: ['사랑과 다정함이 넘치는 하루', '부드러운 감성에 감싸이는 시간', '따뜻한 관계가 소중한 순간'] },
  },
  lightEmotions: {
    '가벼움': { primary: '가벼움', secondary: '경쾌', emoji: '🎈', descriptions: ['가볍고 경쾌한 기분의 하루'] },
    '피곤함': { primary: '피곤함', secondary: '지침', emoji: '😮‍💨', descriptions: ['조금 지치고 쉬고 싶은 하루'] },
    '무덤덤': { primary: '무덤덤', secondary: '평범', emoji: '😐', descriptions: ['특별한 감정 없이 평범한 하루'] },
    '고요': { primary: '고요', secondary: '침잠', emoji: '🌙', descriptions: ['고요하게 가라앉는 마음의 하루'] },
    '우울': { primary: '우울', secondary: '쓸쓸함', emoji: '🌧️', descriptions: ['조금 우울하고 쓸쓸한 하루'] },
    '설렘': { primary: '설렘', secondary: '기대', emoji: '💫', descriptions: ['설레고 기대되는 하루'] },
  },

  weekdayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  insightMessages: {
    dominantEmotion: (_emotion, pct) => `전체 기록의 ${pct}%를 차지합니다.`,
    dominantPositive: '에너지가 넘치는 시기네요!',
    dominantCalm: '안정적인 시간을 보내고 있어요.',
    dominantDefault: '내면의 감정을 잘 들어보세요.',
    brightWeek: (count) => `최근 7일 중 ${count}일이 밝은 감정이에요. 좋은 흐름을 유지하고 있어요!`,
    darkWeek: (count) => `최근 7일 중 ${count}일이 우울하거나 피곤한 기분이었어요. 충분히 쉬고 있나요?`,
    weekdayPattern: (day, pct) => `${day} 기록의 ${pct}%가 어두운 감정이에요. 그 날에 특별히 쉬는 시간을 가져보세요.`,
    brightColors: (avg) => `최근 평균 밝기가 ${avg}%로 높아요. 긍정적이고 활기찬 시기를 보내고 있는 것 같아요.`,
    darkColors: (avg) => `최근 평균 밝기가 ${avg}%로 낮아요. 마음이 무겁다면 가까운 사람과 이야기를 나눠보세요.`,
    emotionStreak: (_emotion) => `최근 5일 연속 같은 감정이에요. 다른 활동이나 환경 변화를 시도해보는 건 어떨까요?`,
    consistency: (count) => `지난 7일 중 ${count}일을 기록했어요. 자신의 감정을 돌아보는 좋은 습관이에요!`,
  },

  formatFullDate: (date: Date) => {
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}`;
  },

  defaultProfileName: '나',
  defaultUserName: '사용자',
};
