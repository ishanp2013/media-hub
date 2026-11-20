/**
 * Server-side story moderation used by the /api/moderate-story dev-server endpoint.
 * Runs only on the server (imported by vite.config.ts) — the API key never reaches the browser.
 *
 * The built-in word filter always runs. When an AI key is configured, the AI check runs too
 * and both results are combined, so a story is flagged if either one finds a problem.
 */
import { filterText } from './wordFilter';

export interface ModerateInput {
  title: string;
  text: string;
  transcript: string;
  hasVideo: boolean;
}

export interface ModerateOutput {
  status: 'pass' | 'flagged';
  textStatus: 'pass' | 'flagged';
  videoStatus: 'pass' | 'flagged';
  cleanedText: string;
  cleanedTitle: string;
  issues: string[];
  notes: string[];
  provider: 'ai' | 'local';
}

const CLEAN_SYSTEM_PROMPT =
  'You are a school story safety editor for GIIS Abu Dhabi. Rewrite the given text by replacing ONLY unsuitable, abusive, bullying, profane, or inappropriate words/phrases with "[removed]". Cover word variations and disguised spellings (e.g. stupid/stupidly, f*ck, sh1t). Keep the speaker\'s authentic voice, tone, and meaning otherwise intact. Return ONLY the cleaned text, nothing else. If nothing is unsuitable, return the text unchanged.';

const VIDEO_NO_TRANSCRIPT_NOTE =
  'No transcript provided — video passed the metadata safety screen; Admin manual review is recommended.';

function describeFilter(where: string, removed: string[], topics: string[]): string[] {
  const issues: string[] = [];
  if (removed.length) {
    issues.push(`Removed ${removed.length} unsuitable word${removed.length > 1 ? 's/phrases' : '/phrase'} from the ${where}`);
  }
  if (topics.length) {
    issues.push(`The ${where} mentions a sensitive topic (${topics.join(', ')}) — Admin review recommended`);
  }
  return issues;
}

function localResult(input: ModerateInput): ModerateOutput {
  const notes: string[] = [];
  const text = filterText(input.text);
  const title = filterText(input.title);
  const transcript = filterText(input.transcript);

  const issues = [
    ...describeFilter('title', title.removed, title.topics),
    ...describeFilter('story', text.removed, text.topics),
    ...describeFilter('video transcript', transcript.removed, transcript.topics),
  ];

  let videoStatus: 'pass' | 'flagged' = 'pass';
  if (input.hasVideo) {
    if (input.transcript.trim()) {
      if (transcript.removed.length || transcript.topics.length) videoStatus = 'flagged';
      notes.push('Video checked via its transcript.');
    } else {
      notes.push(VIDEO_NO_TRANSCRIPT_NOTE);
    }
  }

  const textFlagged = text.removed.length + text.topics.length + title.removed.length + title.topics.length > 0;
  const textStatus: 'pass' | 'flagged' = textFlagged ? 'flagged' : 'pass';
  return {
    status: textStatus === 'flagged' || videoStatus === 'flagged' ? 'flagged' : 'pass',
    textStatus,
    videoStatus,
    cleanedText: text.cleaned,
    cleanedTitle: title.cleaned,
    issues,
    notes,
    provider: 'local',
  };
}

async function openAiModeration(baseUrl: string, key: string, input: string) {
  const res = await fetch(`${baseUrl}/moderations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'omni-moderation-latest', input: input || ' ' }),
  });
  if (!res.ok) throw new Error(`AI moderation failed (${res.status})`);
  const json = await res.json();
  return json?.results?.[0] as { flagged?: boolean; categories?: Record<string, boolean> } | undefined;
}

async function aiResult(input: ModerateInput, key: string, baseUrl: string): Promise<ModerateOutput> {
  // Built-in filter runs first; the AI then works on its output and can catch anything it missed.
  const local = localResult(input);
  const issues = [...local.issues];
  const notes = [...local.notes];

  // 1. Safety classification of title + story
  const r = await openAiModeration(baseUrl, key, [input.title, input.text].filter(Boolean).join('\n\n'));
  const aiFlagged = !!r?.flagged;
  if (aiFlagged && r?.categories) {
    const cats = Object.entries(r.categories).filter(([, v]) => v === true).map(([c]) => c);
    if (cats.length) issues.push(`AI flagged: ${cats.join(', ')}`);
  }

  // 2. Clean the story with a chat model
  let cleaned = local.cleanedText;
  if (cleaned.trim()) {
    const chatRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: CLEAN_SYSTEM_PROMPT },
          { role: 'user', content: cleaned },
        ],
      }),
    });
    if (!chatRes.ok) throw new Error(`AI text check failed (${chatRes.status})`);
    const chatJson = await chatRes.json();
    const aiCleaned = (chatJson?.choices?.[0]?.message?.content ?? '').trim();
    if (aiCleaned) {
      if (aiCleaned !== cleaned && /\[removed\]/.test(aiCleaned)) {
        issues.push('AI replaced additional unsuitable wording with "[removed]"');
      }
      cleaned = aiCleaned;
    }
  }
  if (aiFlagged && cleaned === input.text) {
    issues.push('AI flagged the story — Admin review required');
  }

  // 3. Video transcript
  let videoStatus = local.videoStatus;
  if (input.hasVideo && input.transcript.trim()) {
    const t = await openAiModeration(baseUrl, key, input.transcript);
    if (t?.flagged) {
      videoStatus = 'flagged';
      issues.push('AI flagged the video transcript as unsuitable');
    }
  }

  const textStatus: 'pass' | 'flagged' =
    local.textStatus === 'flagged' || aiFlagged || /\[removed\]/.test(cleaned) ? 'flagged' : 'pass';

  return {
    status: textStatus === 'flagged' || videoStatus === 'flagged' ? 'flagged' : 'pass',
    textStatus,
    videoStatus,
    cleanedText: cleaned,
    cleanedTitle: local.cleanedTitle,
    issues,
    notes,
    provider: 'ai',
  };
}

export async function moderateStory(input: ModerateInput, env: Record<string, string>): Promise<ModerateOutput> {
  const key = env.AI_API_KEY || env.OPENAI_API_KEY;
  if (key) {
    try {
      return await aiResult(input, key, env.AI_API_BASE_URL || 'https://api.openai.com/v1');
    } catch {
      // AI unavailable — fall back to the built-in filter so submission never blocks
      const local = localResult(input);
      return { ...local, notes: [...local.notes, 'AI service unreachable — used built-in word filter.'] };
    }
  }
  return localResult(input);
}
