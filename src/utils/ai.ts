// Shared AI API call helper
const API_URL = 'https://models.inference.ai.azure.com/chat/completions';

export function getApiKey(): string {
  return localStorage.getItem('todays-color-ai-key') || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('todays-color-ai-key', key);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 500,
): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error('NO_KEY');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `API error (${res.status})`);
  }

  const result = await res.json();
  return result.choices?.[0]?.message?.content || '';
}
