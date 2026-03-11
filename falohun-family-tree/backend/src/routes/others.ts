import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { generateId } from '../lib/auth';

// ── Profiles ─────────────────────────────────────────────────────────────────
export const profiles = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();
profiles.use('*', authMiddleware);

profiles.get('/:userId', async (c) => {
  const profile = await c.env.DB.prepare(
    `SELECT u.userId, u.email, u.role, u.createdAt,
     p.displayName, p.bio, p.location, p.profilePhotoUrl,
     p.linkedinUrl, p.instagramUrl, p.facebookUrl, p.twitterUrl,
     p.tiktokUrl, p.youtubeUrl, p.websiteUrl,
     p.allowContact, p.showSocialLinks, p.preferredLanguage
     FROM Users u JOIN UserProfiles p ON u.userId = p.userId WHERE u.userId = ?`
  ).bind(c.req.param('userId')).first();
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ profile });
});

profiles.put('/me', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const fields = ['displayName','bio','location','linkedinUrl','instagramUrl','facebookUrl','twitterUrl','tiktokUrl','youtubeUrl','websiteUrl','allowContact','showSocialLinks','preferredLanguage'];
  const updates: string[] = [];
  const values: any[] = [];
  for (const f of fields) {
    if (body[f] !== undefined) { updates.push(`${f}=?`); values.push(body[f]); }
  }
  if (!updates.length) return c.json({ error: 'No fields to update' }, 400);
  values.push(new Date().toISOString(), user.userId);
  await c.env.DB.prepare(`UPDATE UserProfiles SET ${updates.join(',')}, updatedAt=? WHERE userId=?`).bind(...values).run();
  return c.json({ message: 'Profile updated' });
});

// ── Media ─────────────────────────────────────────────────────────────────────
export const media = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();
media.use('*', authMiddleware);

// Generate presigned upload URL
media.post('/upload-url', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const { personId, type, filename, mimeType } = body;
  if (!filename || !type) return c.json({ error: 'filename and type required' }, 400);

  const mediaId = generateId();
  const ext = filename.split('.').pop() || 'bin';
  const r2Key = `media/${user.userId}/${mediaId}.${ext}`;

  // For Cloudflare Workers, we create a signed URL for direct upload
  // In production, you'd use a signed URL - here we return the key for backend upload
  return c.json({ mediaId, r2Key, uploadEndpoint: `/api/media/upload/${mediaId}` });
});

// Direct upload
media.post('/upload/:mediaId', async (c) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  if (!file) return c.json({ error: 'No file uploaded' }, 400);

  const mediaId = c.req.param('mediaId');
  const ext = file.name.split('.').pop() || 'bin';
  const r2Key = `media/${user.userId}/${mediaId}.${ext}`;
  const type = file.type.startsWith('video/') ? 'video' : 'photo';

  await c.env.MEDIA_BUCKET.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type }
  });

  const publicUrl = `https://media.falohun.family/${r2Key}`;
  const personId = body['personId'] as string || null;
  const caption = body['caption'] as string || null;

  await c.env.DB.prepare(
    'INSERT INTO Media (mediaId,personId,uploaderUserId,type,url,r2Key,caption) VALUES (?,?,?,?,?,?,?)'
  ).bind(mediaId, personId, user.userId, type, publicUrl, r2Key, caption).run();

  return c.json({ mediaId, url: publicUrl, message: 'Uploaded successfully' }, 201);
});

// ── Messaging ─────────────────────────────────────────────────────────────────
export const messages = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();
messages.use('*', authMiddleware);

messages.get('/threads', async (c) => {
  const user = c.get('user');
  const threads = await c.env.DB.prepare(
    `SELECT t.*, 
     CASE WHEN t.participantAId = ? THEN pb.displayName ELSE pa.displayName END as otherName,
     CASE WHEN t.participantAId = ? THEN t.participantBId ELSE t.participantAId END as otherUserId,
     CASE WHEN t.participantAId = ? THEN upb.profilePhotoUrl ELSE upa.profilePhotoUrl END as otherPhoto,
     (SELECT content FROM Messages WHERE threadId = t.threadId ORDER BY createdAt DESC LIMIT 1) as lastMessage,
     (SELECT createdAt FROM Messages WHERE threadId = t.threadId ORDER BY createdAt DESC LIMIT 1) as lastMessageAt,
     (SELECT COUNT(*) FROM Messages WHERE threadId = t.threadId AND senderUserId != ? AND isRead = 0) as unreadCount
     FROM Threads t
     JOIN UserProfiles pa ON t.participantAId = pa.userId
     JOIN UserProfiles pb ON t.participantBId = pb.userId
     LEFT JOIN UserProfiles upa ON t.participantAId = upa.userId
     LEFT JOIN UserProfiles upb ON t.participantBId = upb.userId
     WHERE t.participantAId = ? OR t.participantBId = ?
     ORDER BY lastMessageAt DESC NULLS LAST`
  ).bind(user.userId, user.userId, user.userId, user.userId, user.userId, user.userId).all();
  return c.json({ threads: threads.results });
});

messages.post('/threads', async (c) => {
  const user = c.get('user');
  const { recipientId } = await c.req.json();
  if (!recipientId || recipientId === user.userId) return c.json({ error: 'Invalid recipient' }, 400);

  const existing = await c.env.DB.prepare(
    'SELECT threadId FROM Threads WHERE (participantAId=? AND participantBId=?) OR (participantAId=? AND participantBId=?)'
  ).bind(user.userId, recipientId, recipientId, user.userId).first<{ threadId: string }>();

  if (existing) return c.json({ threadId: existing.threadId });

  const threadId = generateId();
  await c.env.DB.prepare('INSERT INTO Threads (threadId,participantAId,participantBId) VALUES (?,?,?)')
    .bind(threadId, user.userId, recipientId).run();
  return c.json({ threadId }, 201);
});

messages.get('/threads/:threadId', async (c) => {
  const user = c.get('user');
  const thread = await c.env.DB.prepare(
    'SELECT * FROM Threads WHERE threadId = ? AND (participantAId = ? OR participantBId = ?)'
  ).bind(c.req.param('threadId'), user.userId, user.userId).first();
  if (!thread) return c.json({ error: 'Thread not found' }, 404);

  const msgs = await c.env.DB.prepare(
    `SELECT m.*, p.displayName as senderName, p.profilePhotoUrl as senderPhoto
     FROM Messages m JOIN UserProfiles p ON m.senderUserId = p.userId
     WHERE m.threadId = ? ORDER BY m.createdAt ASC`
  ).bind(c.req.param('threadId')).all();

  await c.env.DB.prepare('UPDATE Messages SET isRead=1 WHERE threadId=? AND senderUserId!=?')
    .bind(c.req.param('threadId'), user.userId).run();

  return c.json({ messages: msgs.results });
});

messages.post('/threads/:threadId', async (c) => {
  const user = c.get('user');
  const thread = await c.env.DB.prepare(
    'SELECT * FROM Threads WHERE threadId = ? AND (participantAId = ? OR participantBId = ?)'
  ).bind(c.req.param('threadId'), user.userId, user.userId).first<any>();
  if (!thread) return c.json({ error: 'Forbidden' }, 403);

  const { content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: 'Message cannot be empty' }, 400);

  const messageId = generateId();
  await c.env.DB.prepare(
    'INSERT INTO Messages (messageId,threadId,senderUserId,content) VALUES (?,?,?,?)'
  ).bind(messageId, c.req.param('threadId'), user.userId, content.trim()).run();

  return c.json({ messageId, message: 'Sent' }, 201);
});

// ── Admin ─────────────────────────────────────────────────────────────────────
export const admin = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();
admin.use('*', authMiddleware, adminMiddleware);

admin.get('/users', async (c) => {
  const users = await c.env.DB.prepare(
    `SELECT u.userId, u.email, u.role, u.isApproved, u.createdAt, u.lastLoginAt, p.displayName
     FROM Users u JOIN UserProfiles p ON u.userId = p.userId ORDER BY u.createdAt DESC`
  ).all();
  return c.json({ users: users.results });
});

admin.patch('/users/:userId/approve', async (c) => {
  await c.env.DB.prepare('UPDATE Users SET isApproved=1 WHERE userId=?').bind(c.req.param('userId')).run();
  return c.json({ message: 'User approved' });
});

admin.delete('/users/:userId', async (c) => {
  await c.env.DB.prepare('DELETE FROM Users WHERE userId=?').bind(c.req.param('userId')).run();
  return c.json({ message: 'User deleted' });
});

admin.get('/invites', async (c) => {
  const invites = await c.env.DB.prepare(
    `SELECT i.*, u1.email as createdByEmail, u2.email as usedByEmail
     FROM Invites i
     JOIN Users u1 ON i.createdByUserId = u1.userId
     LEFT JOIN Users u2 ON i.usedByUserId = u2.userId
     ORDER BY i.createdAt DESC`
  ).all();
  return c.json({ invites: invites.results });
});

admin.post('/invites', async (c) => {
  const user = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const code = body.code || `FAM-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
  const expiresAt = body.expiresAt || null;
  const inviteId = generateId();
  await c.env.DB.prepare('INSERT INTO Invites (inviteId,code,createdByUserId,expiresAt) VALUES (?,?,?,?)')
    .bind(inviteId, code, user.userId, expiresAt).run();
  return c.json({ inviteId, code, message: 'Invite created' }, 201);
});

admin.get('/media/pending', async (c) => {
  const items = await c.env.DB.prepare(
    'SELECT m.*, p.displayName as uploaderName FROM Media m JOIN UserProfiles p ON m.uploaderUserId = p.userId WHERE m.isApproved = 0 ORDER BY m.createdAt DESC'
  ).all();
  return c.json({ media: items.results });
});

admin.patch('/media/:mediaId/approve', async (c) => {
  await c.env.DB.prepare('UPDATE Media SET isApproved=1 WHERE mediaId=?').bind(c.req.param('mediaId')).run();
  return c.json({ message: 'Media approved' });
});
