import type { ColorInfo, EmotionResult } from '../types';

interface EmotionMapping {
  primary: string;
  secondary: string;
  emoji: string;
  descriptions: string[];
}

const EMOTION_MAP: Record<string, EmotionMapping> = {
  '빨강': {
    primary: '열정',
    secondary: '에너지',
    emoji: '🔥',
    descriptions: [
      '강렬한 에너지가 느껴지는 하루',
      '뜨거운 열정으로 가득한 순간',
      '용기와 결단력이 넘치는 때',
    ],
  },
  '주황': {
    primary: '따뜻함',
    secondary: '활력',
    emoji: '🌅',
    descriptions: [
      '따뜻한 온기가 감도는 하루',
      '활기차고 사교적인 기분',
      '창의적 영감이 떠오르는 순간',
    ],
  },
  '노랑': {
    primary: '행복',
    secondary: '낙관',
    emoji: '☀️',
    descriptions: [
      '밝고 긍정적인 에너지의 하루',
      '희망과 기쁨으로 빛나는 시간',
      '자신감과 명랑함이 가득한 순간',
    ],
  },
  '연두': {
    primary: '새로움',
    secondary: '희망',
    emoji: '🌱',
    descriptions: [
      '새로운 시작의 설렘이 있는 하루',
      '신선한 아이디어가 샘솟는 순간',
      '성장하고 있다는 느낌의 시간',
    ],
  },
  '초록': {
    primary: '안정',
    secondary: '조화',
    emoji: '🌿',
    descriptions: [
      '마음이 편안하고 안정된 하루',
      '자연과 하나 된 듯한 평화로움',
      '균형 잡힌 조화를 느끼는 순간',
    ],
  },
  '청록': {
    primary: '맑음',
    secondary: '자유',
    emoji: '🌊',
    descriptions: [
      '맑고 투명한 마음의 하루',
      '자유롭고 시원한 기분',
      '깨끗하게 정리된 느낌의 순간',
    ],
  },
  '파랑': {
    primary: '평온',
    secondary: '신뢰',
    emoji: '💙',
    descriptions: [
      '고요하고 평화로운 하루',
      '깊은 사색에 잠기는 시간',
      '차분하고 신뢰감 있는 순간',
    ],
  },
  '남색': {
    primary: '집중',
    secondary: '지혜',
    emoji: '🔮',
    descriptions: [
      '깊은 집중력을 발휘한 하루',
      '내면의 지혜에 귀 기울이는 시간',
      '진지하고 성찰적인 순간',
    ],
  },
  '보라': {
    primary: '영감',
    secondary: '신비',
    emoji: '✨',
    descriptions: [
      '창의적 영감이 가득한 하루',
      '신비로운 감성에 젖는 시간',
      '예술적 감수성이 높아지는 순간',
    ],
  },
  '자주': {
    primary: '고귀',
    secondary: '자부심',
    emoji: '👑',
    descriptions: [
      '자부심과 품격을 느끼는 하루',
      '우아하고 당당한 시간',
      '내면의 힘을 확인하는 순간',
    ],
  },
  '분홍': {
    primary: '사랑',
    secondary: '다정함',
    emoji: '💗',
    descriptions: [
      '사랑과 다정함이 넘치는 하루',
      '부드러운 감성에 감싸이는 시간',
      '따뜻한 관계가 소중한 순간',
    ],
  },
};

// Brightness/saturation modifier emotions
const LIGHT_EMOTIONS: EmotionMapping[] = [
  { primary: '가벼움', secondary: '경쾌', emoji: '🎈', descriptions: ['가볍고 경쾌한 기분의 하루'] },
  { primary: '피곤함', secondary: '지침', emoji: '😮‍💨', descriptions: ['조금 지치고 쉬고 싶은 하루'] },
  { primary: '무덤덤', secondary: '평범', emoji: '😐', descriptions: ['특별한 감정 없이 평범한 하루'] },
];

// Dark/low-sat modifier emotions
const DARK_EMOTIONS: EmotionMapping[] = [
  { primary: '고요', secondary: '침잠', emoji: '🌙', descriptions: ['고요하게 가라앉는 마음의 하루'] },
  { primary: '우울', secondary: '쓸쓸함', emoji: '🌧️', descriptions: ['조금 우울하고 쓸쓸한 하루'] },
];

function calculateIntensity(saturation: number, lightness: number): number {
  const satFactor = saturation / 100;
  const lightFactor = 1 - Math.abs(lightness - 50) / 50;
  return Math.round(satFactor * lightFactor * 100);
}

function makeResult(mapping: EmotionMapping, intensity: number): EmotionResult {
  return {
    primary: mapping.primary,
    secondary: mapping.secondary,
    intensity,
    description: mapping.descriptions[0],
    emoji: mapping.emoji,
  };
}

// Returns 3 emotion suggestions based on the color
export function getSuggestedEmotions(color: ColorInfo): EmotionResult[] {
  const intensity = calculateIntensity(color.saturation, color.lightness);
  const primary = EMOTION_MAP[color.emotionGroup] || EMOTION_MAP['빨강'];

  // Always include the primary emotion for this color family
  const result: EmotionResult[] = [makeResult(primary, intensity)];

  // Pick a second option — brightness-based
  if (color.lightness > 65) {
    result.push(makeResult(LIGHT_EMOTIONS[0], intensity)); // 가벼움
  } else if (color.lightness < 30) {
    result.push(makeResult(DARK_EMOTIONS[0], intensity)); // 고요
  } else if (color.saturation < 30) {
    result.push(makeResult(LIGHT_EMOTIONS[2], intensity)); // 무덤덤
  } else {
    // Pick a neighboring color family emotion
    const families = Object.keys(EMOTION_MAP);
    const idx = families.indexOf(color.emotionGroup);
    const neighbor = EMOTION_MAP[families[(idx + 1) % families.length]];
    result.push(makeResult(neighbor, intensity));
  }

  // Third option — always offer a contrast/general mood
  if (intensity < 40) {
    result.push(makeResult(LIGHT_EMOTIONS[1], intensity)); // 피곤함
  } else if (color.lightness > 60 && color.saturation > 60) {
    result.push(makeResult(
      { primary: '설렘', secondary: '기대', emoji: '💫', descriptions: ['설레고 기대되는 하루'] },
      intensity
    ));
  } else {
    result.push(makeResult(DARK_EMOTIONS[1], intensity)); // 우울
  }

  return result;
}

export function analyzeEmotion(color: ColorInfo): EmotionResult {
  const mapping = EMOTION_MAP[color.emotionGroup] || EMOTION_MAP['빨강'];
  const intensity = calculateIntensity(color.saturation, color.lightness);
  return makeResult(mapping, intensity);
}

export function getEmotionSummary(emotions: EmotionResult[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of emotions) {
    counts[e.primary] = (counts[e.primary] || 0) + 1;
  }
  return counts;
}

export const ALL_EMOTIONS = Object.values(EMOTION_MAP).map((m) => ({
  name: m.primary,
  emoji: m.emoji,
}));

export const EMOTION_COLORS: Record<string, string> = {
  '열정': '#FF4444',
  '따뜻함': '#FF8C42',
  '행복': '#FFD700',
  '새로움': '#98FB98',
  '안정': '#4CAF50',
  '맑음': '#00CED1',
  '평온': '#4488FF',
  '집중': '#1A237E',
  '영감': '#9C27B0',
  '고귀': '#880E4F',
  '사랑': '#FF69B4',
  '가벼움': '#B0E0E6',
  '피곤함': '#A0A0A0',
  '무덤덤': '#808080',
  '고요': '#2C3E50',
  '우울': '#5D6D7E',
  '설렘': '#FF6FD8',
};
