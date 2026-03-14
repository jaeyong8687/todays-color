import type { ColorRecord } from '../types';
import { EMOTION_COLORS } from './emotions';

export interface Insight {
  emoji: string;
  title: string;
  body: string;
  type: 'positive' | 'neutral' | 'concern';
}

function getWeekday(dateStr: string): number {
  return new Date(dateStr).getDay();
}

function recentRecords(records: ColorRecord[], days: number): ColorRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return records.filter((r) => r.date >= cutoffStr);
}

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

export function generateInsights(records: ColorRecord[]): Insight[] {
  if (records.length < 3) return [];

  const insights: Insight[] = [];
  const recent7 = recentRecords(records, 7);
  const recent30 = recentRecords(records, 30);

  // 1. Dominant emotion trend
  const emotionCounts: Record<string, number> = {};
  for (const r of records) {
    emotionCounts[r.emotion.primary] = (emotionCounts[r.emotion.primary] || 0) + 1;
  }
  const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [top, count] = sorted[0];
    const pct = Math.round((count / records.length) * 100);
    insights.push({
      emoji: '🎯',
      title: `당신의 주된 감정은 "${top}"`,
      body: `전체 기록의 ${pct}%를 차지합니다. ${top === '열정' || top === '행복' || top === '설렘' ? '에너지가 넘치는 시기네요!' : top === '평온' || top === '안정' ? '안정적인 시간을 보내고 있어요.' : '내면의 감정을 잘 들어보세요.'}`,
      type: top === '우울' || top === '피곤함' ? 'concern' : 'positive',
    });
  }

  // 2. Recent week vs overall comparison
  if (recent7.length >= 3 && records.length >= 10) {
    const recentEmotions = recent7.map((r) => r.emotion.primary);
    const darkMoods = ['우울', '피곤함', '고요'];
    const brightMoods = ['행복', '열정', '설렘', '따뜻함', '사랑'];

    const recentDark = recentEmotions.filter((e) => darkMoods.includes(e)).length;
    const recentBright = recentEmotions.filter((e) => brightMoods.includes(e)).length;

    if (recentBright > recentDark && recentBright >= 3) {
      insights.push({
        emoji: '☀️',
        title: '이번 주 밝은 감정이 많아요',
        body: `최근 7일 중 ${recentBright}일이 밝은 감정이에요. 좋은 흐름을 유지하고 있어요!`,
        type: 'positive',
      });
    } else if (recentDark >= 3) {
      insights.push({
        emoji: '🌧️',
        title: '최근 지친 감정이 이어지고 있어요',
        body: `최근 7일 중 ${recentDark}일이 우울하거나 피곤한 기분이었어요. 충분히 쉬고 있나요?`,
        type: 'concern',
      });
    }
  }

  // 3. Weekday pattern
  if (records.length >= 14) {
    const weekdayEmotions: Record<number, string[]> = {};
    for (const r of records) {
      const wd = getWeekday(r.date);
      if (!weekdayEmotions[wd]) weekdayEmotions[wd] = [];
      weekdayEmotions[wd].push(r.emotion.primary);
    }

    const darkMoods = ['우울', '피곤함', '고요'];
    let worstDay = -1, worstRatio = 0;
    for (const [wd, emotions] of Object.entries(weekdayEmotions)) {
      if (emotions.length < 2) continue;
      const darkCount = emotions.filter((e) => darkMoods.includes(e)).length;
      const ratio = darkCount / emotions.length;
      if (ratio > worstRatio) {
        worstRatio = ratio;
        worstDay = Number(wd);
      }
    }

    if (worstDay >= 0 && worstRatio >= 0.5) {
      insights.push({
        emoji: '📅',
        title: `${WEEKDAY_NAMES[worstDay]}에 우울한 경향이 있어요`,
        body: `${WEEKDAY_NAMES[worstDay]} 기록의 ${Math.round(worstRatio * 100)}%가 어두운 감정이에요. 그 날에 특별히 쉬는 시간을 가져보세요.`,
        type: 'concern',
      });
    }
  }

  // 4. Color brightness trend
  if (recent30.length >= 7) {
    const avgLightness = recent30.reduce((sum, r) => sum + r.color.lightness, 0) / recent30.length;
    if (avgLightness > 60) {
      insights.push({
        emoji: '🌈',
        title: '밝은 색을 많이 선택하고 있어요',
        body: `최근 평균 밝기가 ${Math.round(avgLightness)}%로 높아요. 긍정적이고 활기찬 시기를 보내고 있는 것 같아요.`,
        type: 'positive',
      });
    } else if (avgLightness < 35) {
      insights.push({
        emoji: '🌑',
        title: '어두운 색이 많은 시기예요',
        body: `최근 평균 밝기가 ${Math.round(avgLightness)}%로 낮아요. 마음이 무겁다면 가까운 사람과 이야기를 나눠보세요.`,
        type: 'concern',
      });
    }
  }

  // 5. Streak detection
  if (records.length >= 5) {
    const lastFive = records.slice(-5);
    const lastFiveEmotions = lastFive.map((r) => r.emotion.primary);
    const allSame = lastFiveEmotions.every((e) => e === lastFiveEmotions[0]);
    if (allSame) {
      insights.push({
        emoji: '🔁',
        title: `"${lastFiveEmotions[0]}" 감정이 계속되고 있어요`,
        body: `최근 5일 연속 같은 감정이에요. 다른 활동이나 환경 변화를 시도해보는 건 어떨까요?`,
        type: 'neutral',
      });
    }
  }

  // 6. Consistency praise
  if (records.length >= 7) {
    const lastWeek = recentRecords(records, 7);
    if (lastWeek.length >= 6) {
      insights.push({
        emoji: '🏅',
        title: '꾸준히 기록하고 있어요!',
        body: `지난 7일 중 ${lastWeek.length}일을 기록했어요. 자신의 감정을 돌아보는 좋은 습관이에요!`,
        type: 'positive',
      });
    }
  }

  return insights;
}

// Format records into a text summary for AI analysis
export function formatRecordsForAI(records: ColorRecord[]): string {
  const lines = records.map((r) => {
    return `${r.date}: ${r.color.name} (${r.color.hex}) - 감정: ${r.emotion.emoji} ${r.emotion.primary}/${r.emotion.secondary} - 메모: ${r.memo || '없음'}`;
  });

  const emotionCounts: Record<string, number> = {};
  for (const r of records) {
    emotionCounts[r.emotion.primary] = (emotionCounts[r.emotion.primary] || 0) + 1;
  }

  return `[오늘의 색 기록 데이터]
총 ${records.length}개의 기록

감정 분포: ${Object.entries(emotionCounts).map(([k, v]) => `${k}(${v})`).join(', ')}

일별 기록:
${lines.join('\n')}`;
}
