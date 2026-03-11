-- Falohun Family Tree Database Schema
-- Compatible with Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS Users (
  userId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK(role IN ('member', 'admin', 'moderator')),
  isApproved INTEGER DEFAULT 0,
  inviteCode TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS UserProfiles (
  profileId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL UNIQUE,
  displayName TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  profilePhotoUrl TEXT,
  linkedinUrl TEXT,
  instagramUrl TEXT,
  facebookUrl TEXT,
  twitterUrl TEXT,
  tiktokUrl TEXT,
  youtubeUrl TEXT,
  websiteUrl TEXT,
  allowContact INTEGER DEFAULT 1,
  showSocialLinks INTEGER DEFAULT 1,
  preferredLanguage TEXT DEFAULT 'en',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Invites (
  inviteId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code TEXT UNIQUE NOT NULL,
  createdByUserId TEXT NOT NULL,
  usedByUserId TEXT,
  expiresAt TEXT,
  isUsed INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (createdByUserId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Persons (
  personId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  fullName TEXT NOT NULL,
  nickname TEXT,
  maidenName TEXT,
  gender TEXT CHECK(gender IN ('male', 'female', 'other', 'unknown')),
  birthDate TEXT,
  deathDate TEXT,
  birthPlace TEXT,
  currentCity TEXT,
  isLiving INTEGER DEFAULT 1,
  biography TEXT,
  culturalNotes TEXT,
  tags TEXT DEFAULT '[]',
  profilePhotoUrl TEXT,
  createdByUserId TEXT NOT NULL,
  linkedUserId TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (createdByUserId) REFERENCES Users(userId),
  FOREIGN KEY (linkedUserId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Relationships (
  relationshipId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  fromPersonId TEXT NOT NULL,
  toPersonId TEXT NOT NULL,
  relationshipType TEXT NOT NULL CHECK(relationshipType IN ('PARENT', 'CHILD', 'SPOUSE', 'PARTNER', 'SIBLING')),
  createdByUserId TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  UNIQUE(fromPersonId, toPersonId, relationshipType),
  FOREIGN KEY (fromPersonId) REFERENCES Persons(personId) ON DELETE CASCADE,
  FOREIGN KEY (toPersonId) REFERENCES Persons(personId) ON DELETE CASCADE,
  FOREIGN KEY (createdByUserId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Media (
  mediaId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  personId TEXT,
  uploaderUserId TEXT NOT NULL,
  type TEXT CHECK(type IN ('photo', 'video', 'document')),
  url TEXT NOT NULL,
  caption TEXT,
  isApproved INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (personId) REFERENCES Persons(personId) ON DELETE SET NULL,
  FOREIGN KEY (uploaderUserId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Threads (
  threadId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  participant1UserId TEXT NOT NULL,
  participant2UserId TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (participant1UserId) REFERENCES Users(userId),
  FOREIGN KEY (participant2UserId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Messages (
  messageId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  threadId TEXT NOT NULL,
  senderUserId TEXT NOT NULL,
  recipientUserId TEXT NOT NULL,
  content TEXT NOT NULL,
  isRead INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (threadId) REFERENCES Threads(threadId) ON DELETE CASCADE,
  FOREIGN KEY (senderUserId) REFERENCES Users(userId),
  FOREIGN KEY (recipientUserId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS AuditLogs (
  logId TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT,
  action TEXT NOT NULL,
  entityType TEXT,
  entityId TEXT,
  details TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_persons_name ON Persons(fullName);
CREATE INDEX IF NOT EXISTS idx_relationships_from ON Relationships(fromPersonId);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON Relationships(toPersonId);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON Messages(threadId);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON Messages(recipientUserId, isRead);
CREATE INDEX IF NOT EXISTS idx_media_person ON Media(personId);

-- Seed admin user (password: Admin@Falohun2024 - change this!)
-- Password hash for "Admin@Falohun2024"
INSERT OR IGNORE INTO Users (userId, email, passwordHash, role, isApproved)
VALUES (
  'admin-00000000000000000000000000000001',
  'admin@falohun.family',
  '$2b$10$rOzJqQZJQZJQZJQZJQZJQOzJqQZJQZJQZJQZJQZJQZJQZJQZJQZJ',
  'admin',
  1
);

INSERT OR IGNORE INTO UserProfiles (profileId, userId, displayName, bio)
VALUES (
  'profile-00000000000000000000000000000001',
  'admin-00000000000000000000000000000001',
  'Family Admin',
  'Keeper of the Falohun Family Tree'
);
