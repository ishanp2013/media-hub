export type ModerationStatus = 'pass' | 'flagged';

export interface ModerationResult {
  status: ModerationStatus;
  textStatus: ModerationStatus;
  videoStatus: ModerationStatus;
  cleanedText: string;
  cleanedTitle?: string;
  issues: string[];
  notes: string[];
  provider: 'ai' | 'local';
}

export type Role = 'parent' | 'admin' | 'marketing';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  childName?: string;
  childGrade?: string;
}

export type Status = 'pending' | 'approved' | 'rejected' | 'published';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  isObjectUrl: boolean;
}

export interface TimelineStep {
  status: Status;
  label: string;
  date: string;
  note?: string;
}

export interface Submission {
  id: string;
  parentId: string;
  parentName: string;
  childName: string;
  childGrade: string;
  eventId: string;
  eventName: string;
  rating: number;
  textFeedback: string;
  media: MediaItem[];
  status: Status;
  rejectionReason?: string;
  socialLink?: string;
  createdAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  history: TimelineStep[];
  moderation?: ModerationResult;
  storyTitle?: string;
  submitterRole?: Role;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'rejected' | 'published';
  title: string;
  message: string;
  date: string;
  read: boolean;
  submissionId: string;
}

export interface SchoolEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  /** First day parents can pick this event (YYYY-MM-DD, inclusive). Empty = straight away. */
  listFrom?: string;
  /** Last day parents can pick this event (YYYY-MM-DD, inclusive). Empty = no end date. */
  listUntil?: string;
}
