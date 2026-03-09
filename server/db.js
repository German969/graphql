import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'blog.db');

export const db = new Database(dbPath);

// Schema: users first (posts reference them)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id)
  )
`);

// Add author_id to existing DBs that don't have it (SQLite has no IF NOT EXISTS for columns)
const tableInfo = db.prepare(`PRAGMA table_info(posts)`).all();
const hasAuthorId = tableInfo.some((col) => col.name === 'author_id');
if (!hasAuthorId) {
  db.exec(`ALTER TABLE posts ADD COLUMN author_id INTEGER REFERENCES users(id)`);
}

/**
 * Create or update a user by username. Returns the user.
 */
export function createUser(username, displayName) {
  const stmt = db.prepare(`
    INSERT INTO users (username, display_name) VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET display_name = excluded.display_name
  `);
  stmt.run(username, displayName);
  return getUserByUsername(username);
}

/**
 * Get user by username, or null.
 */
export function getUserByUsername(username) {
  const row = db.prepare(`
    SELECT id, username, display_name AS displayName FROM users WHERE username = ?
  `).get(username);
  if (!row) return null;
  return {
    id: String(row.id),
    username: row.username,
    displayName: row.displayName,
  };
}

const postSelect = `
  SELECT
    p.id,
    p.title,
    p.body,
    p.published_at AS publishedAt,
    p.author_id AS authorId,
    u.username AS author_username,
    u.display_name AS author_displayName
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.id
`;

function mapRowToPost(row) {
  return {
    id: String(row.id),
    title: row.title,
    body: row.body,
    publishedAt: row.publishedAt,
    author: row.authorId == null
      ? null
      : {
          id: String(row.authorId),
          username: row.author_username,
          displayName: row.author_displayName,
        },
  };
}

/**
 * Get a single post by id, or null if not found.
 */
export function getPostById(id) {
  const row = db.prepare(`
    ${postSelect}
    WHERE p.id = ?
  `).get(Number(id));
  if (!row) return null;
  return mapRowToPost(row);
}

/**
 * Get all posts, newest first, with author (User or null).
 * Optional limit caps the number of posts returned.
 */
export function getAllPosts(limit = null) {
  const useLimit = limit != null && Number.isInteger(limit) && limit > 0;
  const sql = `
    ${postSelect}
    ORDER BY p.id DESC
    ${useLimit ? 'LIMIT ?' : ''}
  `;
  const rows = useLimit ? db.prepare(sql).all(limit) : db.prepare(sql).all();
  return rows.map(mapRowToPost);
}

/**
 * Cursor-based pagination: returns a PostConnection (edges + pageInfo).
 * first: max items per page (default 10). after: cursor (post id) for "next page".
 * Posts are ordered by id DESC; "after" means "posts with id < after".
 */
export function getPostsConnection(first = 10, after = null) {
  const limit = Math.min(Math.max(Number(first) || 10, 1), 100);
  const fetchLimit = limit + 1;
  const afterId = after != null && after !== '' ? Number(after) : null;

  const params =
    afterId != null && !Number.isNaN(afterId) ? [afterId, fetchLimit] : [fetchLimit];
  const sql =
    afterId != null && !Number.isNaN(afterId)
      ? `
    ${postSelect}
    WHERE p.id < ?
    ORDER BY p.id DESC
    LIMIT ?
  `
      : `
    ${postSelect}
    ORDER BY p.id DESC
    LIMIT ?
  `;

  const rows = db.prepare(sql).all(...params);
  const hasNextPage = rows.length > limit;
  const slice = hasNextPage ? rows.slice(0, limit) : rows;
  const edges = slice.map((row) => {
    const node = mapRowToPost(row);
    return { node, cursor: node.id };
  });
  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
  };
}

/**
 * Insert a new post; returns the created post with author.
 */
export function insertPost(title, body, authorId) {
  const publishedAt = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO posts (title, body, published_at, author_id)
    VALUES (?, ?, ?, ?)
  `).run(title, body, publishedAt, authorId ?? null);
  const id = String(result.lastInsertRowid);
  const post = getAllPosts().find((p) => p.id === id);
  return post ?? { id, title, body, publishedAt, author: null };
}
