import type { ModerationResult } from '@/types';

/**
 * Calls the server-side /api/moderate-story endpoint.
 * The AI API key lives only in .env on the server — never in frontend code.
 */
export async function moderateStory(input: {
  title?: string;
  text: string;
  transcript?: string;
  hasVideo: boolean;
}): Promise<ModerationResult> {
  const response = await fetch('/api/moderate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: input.title ?? '',
      text: input.text ?? '',
      transcript: input.transcript ?? '',
      hasVideo: !!input.hasVideo,
    }),
  });
  if (!response.ok) {
    throw new Error(`Moderation check failed (${response.status})`);
  }
  const data = await response.json();
  if (
    typeof data?.status !== 'string' ||
    typeof data?.cleanedText !== 'string' ||
    !Array.isArray(data?.issues)
  ) {
    throw new Error('Unexpected moderation response');
  }
  return data as ModerationResult;
}
