import type { ColorRecord } from '../types';
import type { Translations } from '../i18n/types';
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

function getEmotionDisplay(key: string, t: Translations): string {
  const emotionData = t.emotions[key] || t.lightEmotions[key];
  return emotionData ? emotionData.primary : key;
}

export function generateInsights(records: ColorRecord[], t: Translations): Insight[] {
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
    const topDisplay = getEmotionDisplay(top, t);
    const positiveEmotions = ['열정', '행복', '설렘'];
    const calmEmotions = ['평온', '안정'];
    const subBody = positiveEmotions.includes(top) ? t.insightMessages.dominantPositive
      : calmEmotions.includes(top) ? t.insightMessages.dominantCalm
      : t.insightMessages.dominantDefault;
    insights.push({
      emoji: '🎯',
      title: `${topDisplay}`,
      body: `${t.insightMessages.dominantEmotion(topDisplay, pct)} ${subBody}`,
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
        title: '☀️',
        body: t.insightMessages.brightWeek(recentBright),
        type: 'positive',
      });
    } else if (recentDark >= 3) {
      insights.push({
        emoji: '🌧️',
        title: '🌧️',
        body: t.insightMessages.darkWeek(recentDark),
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
        title: `📅 ${t.weekdayNames[worstDay]}`,
        body: t.insightMessages.weekdayPattern(t.weekdayNames[worstDay], Math.round(worstRatio * 100)),
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
        title: '🌈',
        body: t.insightMessages.brightColors(Math.round(avgLightness)),
        type: 'positive',
      });
    } else if (avgLightness < 35) {
      insights.push({
        emoji: '🌑',
        title: '🌑',
        body: t.insightMessages.darkColors(Math.round(avgLightness)),
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
      const emotionDisplay = getEmotionDisplay(lastFiveEmotions[0], t);
      insights.push({
        emoji: '🔁',
        title: `🔁 ${emotionDisplay}`,
        body: t.insightMessages.emotionStreak(emotionDisplay),
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
        title: '🏅',
        body: t.insightMessages.consistency(lastWeek.length),
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
