import { useSyncExternalStore } from 'react';
import type {
  AppNotification,
  SchoolEvent,
  Submission,
  User,
} from '@/types';

const STORAGE_KEY = 'gsg_state_v2';
const CHANNEL_NAME = 'gsg_sync_channel';

export interface AppState {
  users: User[];
  events: SchoolEvent[];
  submissions: Submission[];
  notifications: AppNotification[];
  currentUserId: string | null;
}

export const EVENTS: SchoolEvent[] = [
  {
    id: 'evt-sports',
    name: 'GIIS Annual Sports Day 2026',
    description: 'Track & field, team relays, and the parent–student tug-of-war at the GIIS sports ground.',
    date: '2026-02-14',
    listFrom: '2026-02-14',
    listUntil: '2026-12-31',
  },
  {
    id: 'evt-science',
    name: 'Science & Innovation Fair',
    description: 'Student exhibits, robotics demos, and live experiments across CBSE & Cambridge streams.',
    date: '2026-03-21',
    listFrom: '2026-03-21',
    listUntil: '2026-12-31',
  },
  {
    id: 'evt-cultural',
    name: 'UAE National Day Cultural Fest',
    description: "Celebrating the UAE's heritage with performances, art showcase, and global food stalls.",
    date: '2026-12-02',
    listFrom: '2026-11-01',
    listUntil: '2026-12-31',
  },
  {
    id: 'evt-voices',
    name: 'Voices of GSG Story Week',
    description: 'Students, parents and teachers share their school stories through text and video.',
    date: '2026-11-19',
    listFrom: '2026-11-12',
    listUntil: '2026-12-10',
  },
];

export const USERS: User[] = [
  {
    id: 'u-parent',
    email: 'parent@voicesofgsg.demo',
    password: 'Parent@2026',
    name: 'Aisha Rahman',
    role: 'parent',
    childName: 'Zara',
    childGrade: 'Grade 6',
  },
  {
    id: 'u-admin',
    email: 'admin@voicesofgsg.demo',
    password: 'Admin@2026',
    name: 'Mr. Vikram Nair',
    role: 'admin',
  },
  {
    id: 'u-marketing',
    email: 'marketing@voicesofgsg.demo',
    password: 'Marketing@2026',
    name: 'Maya Iyer',
    role: 'marketing',
  },
];

const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export function seedSubmissions(): Submission[] {
  return [
    {
      id: 'sub-pending',
      parentId: 'u-parent',
      parentName: 'Aisha Rahman',
      childName: 'Zara',
      childGrade: 'Grade 6',
      eventId: 'evt-science',
      eventName: 'Science & Innovation Fair',
      rating: 5,
      textFeedback:
        'Zara loved presenting her robotics model — the live demo drew a huge crowd. Huge thanks to Ms. Padma for mentoring the team!',
      media: [
        {
          id: 'm-seed-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&q=80',
          name: 'science-fair-booth.jpg',
          size: 2_400_000,
          isObjectUrl: false,
        },
      ],
      status: 'pending',
      createdAt: daysAgo(1),
      history: [{ status: 'pending', label: 'Submitted', date: daysAgo(1) }],
      storyTitle: 'Robotics dreams at the Science Fair',
      submitterRole: 'parent',
      moderation: {
        status: 'pass',
        textStatus: 'pass',
        videoStatus: 'pass',
        cleanedText:
          'Zara loved presenting her robotics model — the live demo drew a huge crowd. Huge thanks to Ms. Padma for mentoring the team!',
        issues: [],
        notes: ['AI check passed with no changes needed.'],
        provider: 'ai',
      },
    },
    {
      id: 'sub-approved',
      parentId: 'u-parent',
      parentName: 'Aisha Rahman',
      childName: 'Zara',
      childGrade: 'Grade 6',
      eventId: 'evt-voices',
      eventName: 'Voices of GSG Story Week',
      rating: 4,
      textFeedback:
        'I was nervous on stage, but my friends cheered so loudly that I forgot to be scared. That day I understood what confidence really means.',
      media: [],
      status: 'approved',
      createdAt: daysAgo(3),
      reviewedAt: daysAgo(2),
      history: [
        { status: 'pending', label: 'Submitted', date: daysAgo(3) },
        { status: 'approved', label: 'Approved for Marketing', date: daysAgo(2) },
      ],
      storyTitle: 'The day I spoke on stage',
      submitterRole: 'parent',
      moderation: {
        status: 'pass',
        textStatus: 'pass',
        videoStatus: 'pass',
        cleanedText:
          'I was nervous on stage, but my friends cheered so loudly that I forgot to be scared. That day I understood what confidence really means.',
        issues: [],
        notes: ['AI check passed with no changes needed.'],
        provider: 'ai',
      },
    },
    {
      id: 'sub-published',
      parentId: 'u-parent',
      parentName: 'Aisha Rahman',
      childName: 'Zara',
      childGrade: 'Grade 6',
      eventId: 'evt-voices',
      eventName: 'Voices of GSG Story Week',
      rating: 5,
      textFeedback:
        'Twelve years of school fairs and the science fair still gives me goosebumps. Our students never stop surprising me.',
      media: [
        {
          id: 'm-seed-3',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1511578317322-e4629627caBA?w=900&q=80',
          name: 'cultural-fest-stage.jpg',
          size: 2_800_000,
          isObjectUrl: false,
        },
      ],
      status: 'published',
      createdAt: daysAgo(10),
      reviewedAt: daysAgo(9),
      publishedAt: daysAgo(8),
      socialLink: 'https://www.instagram.com/p/CxYzGIISAbuDhabi2026/',
      history: [
        { status: 'pending', label: 'Submitted', date: daysAgo(10) },
        { status: 'approved', label: 'Approved for Marketing', date: daysAgo(9) },
        { status: 'published', label: 'Published', date: daysAgo(8), note: 'Live on GIIS Abu Dhabi Instagram' },
      ],
      storyTitle: 'Twelve years of goosebumps',
      submitterRole: 'parent',
      moderation: {
        status: 'pass',
        textStatus: 'pass',
        videoStatus: 'pass',
        cleanedText:
          'Twelve years of school fairs and the science fair still gives me goosebumps. Our students never stop surprising me.',
        issues: [],
        notes: ['AI check passed with no changes needed.'],
        provider: 'ai',
      },
    },
  ];
}

function seedNotifications(): AppNotification[] {
  return [
    {
      id: 'n-seed-1',
      userId: 'u-parent',
      type: 'published',
      title: 'Your media is live!',
      message: 'Your story has been published on the GIIS Abu Dhabi social media.',
      date: daysAgo(8),
      read: false,
      submissionId: 'sub-published',
    },
  ];
}

export function getInitialState(): AppState {
  return {
    users: USERS,
    events: EVENTS,
    submissions: seedSubmissions(),
    notifications: seedNotifications(),
    currentUserId: null,
  };
}

/* ---------- external store ---------- */

let state: AppState = loadState();
const listeners = new Set<() => void>();
let broadcast: BroadcastChannel | null = null;

if (typeof BroadcastChannel !== 'undefined') {
  broadcast = new BroadcastChannel(CHANNEL_NAME);
  broadcast.onmessage = () => {
    state = loadState();
    emit();
  };
}

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    state = loadState();
    emit();
  }
});

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialState();
      saveRaw(init, false);
      return init;
    }
    const parsed = JSON.parse(raw) as AppState;
    // Accounts always come from code so stale cached credentials never linger.
    parsed.users = USERS;
    if (parsed.currentUserId && !USERS.some((u) => u.id === parsed.currentUserId)) parsed.currentUserId = null;
    if (!parsed.events?.length) parsed.events = EVENTS;
    return parsed;
  } catch {
    return getInitialState();
  }
}

function saveRaw(next: AppState, propagate: boolean) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  if (propagate) broadcast?.postMessage({ t: Date.now() });
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (prev: AppState) => AppState) {
  state = updater(state);
  saveRaw(state, true);
  emit();
}

export function getState() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

/* ---------- actions ---------- */

export const actions = {
  login(username: string, password: string): User | null {
    const user = state.users.find(
      (u) => u.email.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) return null;
    setState((s) => ({ ...s, currentUserId: user.id }));
    return user;
  },
  loginAs(userId: string) {
    setState((s) => ({ ...s, currentUserId: userId }));
  },
  logout() {
    setState((s) => ({ ...s, currentUserId: null }));
  },
  addSubmission(sub: Submission) {
    setState((s) => ({ ...s, submissions: [sub, ...s.submissions] }));
  },
  approveSubmission(submissionId: string) {
    setState((s) => ({
      ...s,
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: 'approved',
              reviewedAt: now(),
              rejectionReason: undefined,
              history: [...sub.history, { status: 'approved', label: 'Approved for Marketing', date: now() }],
            }
          : sub
      ),
    }));
  },
  rejectSubmission(submissionId: string, reason: string) {
    setState((s) => {
      const sub = s.submissions.find((x) => x.id === submissionId);
      if (!sub) return s;
      return {
        ...s,
        submissions: s.submissions.map((x) =>
          x.id === submissionId
            ? {
                ...x,
                status: 'rejected',
                reviewedAt: now(),
                rejectionReason: reason,
                history: [...x.history, { status: 'rejected', label: 'Rejected', date: now(), note: reason }],
              }
            : x
        ),
        notifications: [
          {
            id: 'n-' + Math.random().toString(36).slice(2),
            userId: sub.parentId,
            type: 'rejected' as const,
            title: 'Submission needs revision',
            message: reason,
            date: now(),
            read: false,
            submissionId,
          },
          ...s.notifications,
        ],
      };
    });
  },
  publishSubmission(submissionId: string, socialLink: string) {
    setState((s) => {
      const sub = s.submissions.find((x) => x.id === submissionId);
      if (!sub) return s;
      return {
        ...s,
        submissions: s.submissions.map((x) =>
          x.id === submissionId
            ? {
                ...x,
                status: 'published',
                publishedAt: now(),
                socialLink,
                history: [...x.history, { status: 'published', label: 'Published', date: now(), note: socialLink }],
              }
            : x
        ),
        notifications: [
          {
            id: 'n-' + Math.random().toString(36).slice(2),
            userId: sub.parentId,
            type: 'published' as const,
            title: 'Your media is live!',
            message: 'Your submission has been published on the GIIS Abu Dhabi social media.',
            date: now(),
            read: false,
            submissionId,
          },
          ...s.notifications,
        ],
      };
    });
  },
  addEvent(event: Omit<SchoolEvent, 'id'>) {
    const id = 'evt-' + Math.random().toString(36).slice(2, 10);
    setState((s) => ({ ...s, events: [...s.events, { ...event, id }] }));
    return id;
  },
  updateEvent(eventId: string, patch: Partial<Omit<SchoolEvent, 'id'>>) {
    setState((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === eventId ? { ...e, ...patch } : e)),
    }));
  },
  /** Only events without submissions can be deleted; others should be closed instead. */
  deleteEvent(eventId: string) {
    setState((s) =>
      s.submissions.some((sub) => sub.eventId === eventId)
        ? s
        : { ...s, events: s.events.filter((e) => e.id !== eventId) }
    );
  },
  markNotificationsRead(userId: string) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      ),
    }));
  },
  resetDemoData() {
    const init = getInitialState();
    init.currentUserId = state.currentUserId;
    setState(() => init);
  },
};
