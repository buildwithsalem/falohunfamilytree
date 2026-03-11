-- 0001_initial.sql — Falohun Family Tree Schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
  userId       TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  isApproved   INTEGER NOT NULL DEFAULT 0,
  createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS UserProfiles (
  userId          TEXT PRIMARY KEY REFERENCES Users(userId) ON DELETE CASCADE,
  displayName     TEXT NOT NULL DEFAULT '',
  bio             TEXT,
  location        TEXT,
  profilePhotoUrl TEXT,
  linkedinUrl     TEXT,
  instagramUrl    TEXT,
  facebookUrl     TEXT,
  twitterUrl      TEXT,
  tiktokUrl       TEXT,
  youtubeUrl      TEXT,
  websiteUrl      TEXT,
  allowContact    INTEGER NOT NULL DEFAULT 1,
  showSocialLinks INTEGER NOT NULL DEFAULT 1,
  updatedAt       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Invites (
  codeId          TEXT PRIMARY KEY,
  code            TEXT UNIQUE NOT NULL,
  createdByUserId TEXT REFERENCES Users(userId),
  usedByUserId    TEXT REFERENCES Users(userId),
  createdAt       TEXT NOT NULL DEFAULT (datetime('now')),
  expiresAt       TEXT,
  isUsed          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Persons (
  personId        TEXT PRIMARY KEY,
  fullName        TEXT NOT NULL,
  nickname        TEXT,
  maidenName      TEXT,
  gender          TEXT CHECK (gender IN ('male','female','other')),
  birthDate       TEXT,
  deathDate       TEXT,
  birthPlace      TEXT,
  currentCity     TEXT,
  isLiving        INTEGER NOT NULL DEFAULT 1,
  biography       TEXT,
  culturalNotes   TEXT,
  tags            TEXT,
  profilePhotoUrl TEXT,
  createdByUserId TEXT NOT NULL REFERENCES Users(userId),
  linkedUserId    TEXT REFERENCES Users(userId),
  createdAt       TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Relationships (
  relationshipId   TEXT PRIMARY KEY,
  fromPersonId     TEXT NOT NULL REFERENCES Persons(personId) ON DELETE CASCADE,
  toPersonId       TEXT NOT NULL REFERENCES Persons(personId) ON DELETE CASCADE,
  relationshipType TEXT NOT NULL CHECK (relationshipType IN ('PARENT','CHILD','SPOUSE','PARTNER','SIBLING')),
  createdByUserId  TEXT NOT NULL REFERENCES Users(userId),
  createdAt        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(fromPersonId, toPersonId, relationshipType)
);

CREATE TABLE IF NOT EXISTS Media (
  mediaId         TEXT PRIMARY KEY,
  personId        TEXT REFERENCES Persons(personId) ON DELETE SET NULL,
  uploaderUserId  TEXT NOT NULL REFERENCES Users(userId),
  type            TEXT NOT NULL CHECK (type IN ('photo','video')),
  url             TEXT NOT NULL,
  r2Key           TEXT NOT NULL,
  caption         TEXT,
  isApproved      INTEGER NOT NULL DEFAULT 1,
  createdAt       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Threads (
  threadId  TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ThreadParticipants (
  threadId  TEXT NOT NULL REFERENCES Threads(threadId) ON DELETE CASCADE,
  userId    TEXT NOT NULL REFERENCES Users(userId) ON DELETE CASCADE,
  PRIMARY KEY (threadId, userId)
);

CREATE TABLE IF NOT EXISTS Messages (
  messageId       TEXT PRIMARY KEY,
  threadId        TEXT NOT NULL REFERENCES Threads(threadId) ON DELETE CASCADE,
  senderUserId    TEXT NOT NULL REFERENCES Users(userId),
  recipientUserId TEXT NOT NULL REFERENCES Users(userId),
  content         TEXT NOT NULL,
  isRead          INTEGER NOT NULL DEFAULT 0,
  createdAt       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS AuditLogs (
  logId     TEXT PRIMARY KEY,
  userId    TEXT REFERENCES Users(userId),
  action    TEXT NOT NULL,
  targetId  TEXT,
  metadata  TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_persons_created_by  ON Persons(createdByUserId);
CREATE INDEX IF NOT EXISTS idx_relationships_from  ON Relationships(fromPersonId);
CREATE INDEX IF NOT EXISTS idx_relationships_to    ON Relationships(toPersonId);
CREATE INDEX IF NOT EXISTS idx_messages_thread     ON Messages(threadId);
CREATE INDEX IF NOT EXISTS idx_thread_participants ON ThreadParticipants(userId);
