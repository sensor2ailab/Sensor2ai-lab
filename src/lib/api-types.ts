// Client-facing shapes returned by the /api/v1 backend. These mirror the server
// DTOs; kept here so client components stay free of server imports.

export interface SessionUser {
  id: string;
  email: string;
  role: "admin" | "user";
  fullName: string;
  phone: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  link: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  employmentType: string | null;
  isOpen: boolean;
  urgent: boolean;
  pendingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  entryType: string | null;
  bibtexKey: string | null;
  title: string;
  authors: string[];
  tags: string[];
  year: number | null;
  venue: string | null;
  volume: string | null;
  number: string | null;
  pages: string | null;
  publisher: string | null;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  rawBibtex: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface Application {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  college: string | null;
  resumeLink: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  reviewedAt: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface Hire {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  collegeName: string | null;
  lastMeetingAt: string | null;
  active: boolean;
  jobTitles: string[];
  notifications: Notification[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "admin" | "user";
  body: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessageAt: string;
  lastMessage: string | null;
  unread: boolean;
}

// The error envelope every failing route returns.
export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
