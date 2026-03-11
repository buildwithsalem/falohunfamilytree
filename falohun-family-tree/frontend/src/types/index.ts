// types/index.ts

export interface User {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  location?: string;
  profilePhotoUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  allowContact: boolean;
  showSocialLinks: boolean;
}

export interface Person {
  personId: string;
  fullName: string;
  nickname?: string;
  maidenName?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  currentCity?: string;
  isLiving: boolean;
  biography?: string;
  culturalNotes?: string;
  tags?: string;
  createdByUserId: string;
  linkedUserId?: string;
  profilePhotoUrl?: string;
}

export interface Relationship {
  relationshipId: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: 'PARENT' | 'CHILD' | 'SPOUSE' | 'PARTNER' | 'SIBLING';
  createdByUserId: string;
}

export interface TreeNode {
  id: string;
  data: {
    person: Person;
    isRoot?: boolean;
  };
  position: { x: number; y: number };
  type: string;
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: { relationshipType: string };
}

export interface Message {
  messageId: string;
  threadId: string;
  senderUserId: string;
  recipientUserId: string;
  content: string;
  createdAt: string;
  senderProfile?: UserProfile;
}

export interface Thread {
  threadId: string;
  createdAt: string;
  otherUser?: UserProfile & { userId: string };
  lastMessage?: Message;
  unreadCount: number;
}

export interface Media {
  mediaId: string;
  personId?: string;
  uploaderUserId: string;
  type: 'photo' | 'video';
  url: string;
  caption?: string;
  createdAt: string;
}

export interface InviteCode {
  codeId: string;
  code: string;
  createdByUserId: string;
  usedByUserId?: string;
  createdAt: string;
  expiresAt?: string;
  isUsed: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
