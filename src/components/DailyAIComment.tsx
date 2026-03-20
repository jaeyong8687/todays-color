import { useState, useEffect, useMemo } from 'react';
import type { ColorRecord } from '../types';
import { callAI, hasApiKey } from '../utils/ai';
import { useI18n } from '../i18n';
import { getColorDisplayName } from '../utils/colors';

interface Props {
  record: ColorRecord;
  recentRecords: ColorRecord[];
}

export default function DailyAIComment({ record, recentRecords }: Props) {
  const { t, lang } = useI18n();
  const [comment, setComment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const recentContextRecords = useMemo(
    () => recentRecords.filter((item) => item.date !== record.date).slice(-5),
    [recentRecords, record.date]
  );

  const cacheKey = useMemo(() => [
    'ai-comment',
    lang,
    record.date,
    record.color.hex,
    record.emotion.primary,
    record.emotion.secondary,
    record.memo ?? '',
    (record.tags ?? []).join(','),
    recentContextRecords.map((item) => `${item.date}-${item.color.hex}-${item.emotion.primary}`).join('|'),
  ].join('::'), [
    lang,
    record.color.hex,
    record.date,
    record.emotion.primary,
    record.emotion.secondary,
    record.memo,
    record.tags,
    recentContextRecords,
  ]);

  useEffect(() => {
    if (!hasApiKey()) return;

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setComment(cached);
      return;
    }

    setComment(null);
    setLoading(true);

    const recentContext = recentContextRecords.map((r) =>
      `${r.date}: ${getColorDisplayName(r.color, t)} - ${r.emotion.emoji} ${r.emotion.primary}`
    ).join('\n');

    const systemPrompt = lang === 'ko'
      ? '당신은 따뜻한 감정 코치입니다. 사용자가 오늘 선택한 색과 감정을 보고 한 줄(1-2문장)로 따뜻한 코멘트를 해주세요. 이모지 1개를 포함하세요. 짧고 따뜻하게.'
      : 'You are a warm emotional coach. Give a brief 1-2 sentence warm comment on the user\'s color and emotion choice today. Include 1 emoji. Keep it short and warm.';

    const userMsg = `Today: ${getColorDisplayName(record.color, t)} (${record.color.hex}) - Emotion: ${record.emotion.emoji} ${record.emotion.primary}
${record.memo ? `Memo: ${record.memo}` : ''}
${recentContext ? `\nRecent days:\n${recentContext}` : ''}`;

    callAI(systemPrompt, userMsg, 100)
      .then((result) => {
        if (!result) return;
        setComment(result);
        sessionStorage.setItem(cacheKey, result);
      })
      .catch(() => {
        // silently fail - daily comment is optional
      })
      .finally(() => setLoading(false));
  }, [
    cacheKey,
    lang,
    recentContextRecords,
    record.color,
    record.date,
    record.emotion.emoji,
    record.emotion.primary,
    record.memo,
    t,
  ]);

  if (!hasApiKey() || (!comment && !loading)) return null;

  return (
    <div className="daily-ai-comment">
      {loading && <span className="daily-ai-loading">💭</span>}
      {comment && <p className="daily-ai-text">{comment}</p>}
    </div>
  );
}
