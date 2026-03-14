// AI calls go through our serverless proxy (/api/ai)
// The API key is stored server-side as an environment variable — users never see it.

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 500,
): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
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

// Keep these for backward compat but they're no longer needed
export function hasApiKey(): boolean {
  return true; // AI is always available now
}

export function getApiKey(): string {
  return '';
}

export function setApiKey(_key: string): void {
  // no-op
}
