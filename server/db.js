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
export function createUser(database, username, displayName) {
  const stmt = database.prepare(`
    INSERT INTO users (username, display_name) VALUES (?, ?)
    ON CONFLICT(username) DO UPDATE SET display_name = excluded.display_name
  `);
  stmt.run(username, displayName);
  return getUserByUsername(database, username);
}

/**
 * Get user by username, or null.
 */
export function getUserByUsername(database, username) {
  const row = database.prepare(`
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
export function getPostById(database, id) {
  const row = database.prepare(`
    ${postSelect}
    WHERE p.id = ?
  `).get(Number(id));
  if (!row) return null;
  return mapRowToPost(row);
}

const ORDER_CLAUSES = {
  PUBLISHED_AT_DESC: 'ORDER BY p.id DESC',
  PUBLISHED_AT_ASC: 'ORDER BY p.id ASC',
  TITLE_ASC: 'ORDER BY p.title ASC, p.id ASC',
  TITLE_DESC: 'ORDER BY p.title DESC, p.id DESC',
};

/**
 * Get all posts with optional filter and ordering.
 * orderBy defaults to PUBLISHED_AT_DESC (newest first).
 */
export function getAllPosts(database, limit = null, authorUsername = null, orderBy = 'PUBLISHED_AT_DESC') {
  const useLimit = limit != null && Number.isInteger(limit) && limit > 0;
  const order = ORDER_CLAUSES[orderBy] ?? ORDER_CLAUSES.PUBLISHED_AT_DESC;
  const hasAuthor = authorUsername != null && String(authorUsername).trim() !== '';
  const where = hasAuthor ? 'WHERE u.username = ?' : '';
  const params = hasAuthor ? [authorUsername.trim()] : [];
  if (useLimit) params.push(limit);

  const sql = `
    ${postSelect}
    ${where}
    ${order}
    ${useLimit ? 'LIMIT ?' : ''}
  `;
  const rows = database.prepare(sql).all(...params);
  return rows.map(mapRowToPost);
}

function buildCursor(row, orderBy) {
  const id = String(row.id);
  if (orderBy === 'PUBLISHED_AT_DESC' || orderBy === 'PUBLISHED_AT_ASC') {
    return id;
  }
  return Buffer.from(JSON.stringify({ t: row.title, i: id })).toString('base64');
}

function parseCursor(after, orderBy) {
  if (after == null || after === '') return null;
  if (orderBy === 'PUBLISHED_AT_DESC' || orderBy === 'PUBLISHED_AT_ASC') {
    const id = Number(after);
    return Number.isNaN(id) ? null : { id };
  }
  try {
    const decoded = JSON.parse(Buffer.from(after, 'base64').toString());
    return decoded?.t != null && decoded?.i != null ? { title: decoded.t, id: decoded.i } : null;
  } catch {
    return null;
  }
}

/**
 * Cursor-based pagination: returns a PostConnection (edges + pageInfo).
 * Supports authorUsername filter and orderBy.
 */
export function getPostsConnection(database, first = 10, after = null, authorUsername = null, orderBy = 'PUBLISHED_AT_DESC') {
  const limit = Math.min(Math.max(Number(first) || 10, 1), 100);
  const fetchLimit = limit + 1;
  const order = ORDER_CLAUSES[orderBy] ?? ORDER_CLAUSES.PUBLISHED_AT_DESC;
  const hasAuthor = authorUsername != null && String(authorUsername).trim() !== '';
  const cursor = parseCursor(after, orderBy);

  const conditions = [];
  const params = [];

  if (hasAuthor) {
    conditions.push('u.username = ?');
    params.push(authorUsername.trim());
  }

  if (cursor) {
    if (cursor.id !== undefined && cursor.title === undefined) {
      const id = Number(cursor.id);
      if (!Number.isNaN(id)) {
        if (orderBy === 'PUBLISHED_AT_DESC') {
          conditions.push('p.id < ?');
          params.push(id);
        } else {
          conditions.push('p.id > ?');
          params.push(id);
        }
      }
    } else if (cursor.title != null && cursor.id != null) {
      if (orderBy === 'TITLE_ASC') {
        conditions.push('(p.title > ? OR (p.title = ? AND p.id > ?))');
        params.push(cursor.title, cursor.title, Number(cursor.id));
      } else {
        conditions.push('(p.title < ? OR (p.title = ? AND p.id < ?))');
        params.push(cursor.title, cursor.title, Number(cursor.id));
      }
    }
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  params.push(fetchLimit);

  const sql = `
    ${postSelect}
    ${where}
    ${order}
    LIMIT ?
  `;
  const rows = database.prepare(sql).all(...params);
  const hasNextPage = rows.length > limit;
  const slice = hasNextPage ? rows.slice(0, limit) : rows;
  const edges = slice.map((row) => {
    const node = mapRowToPost(row);
    return { node, cursor: buildCursor(row, orderBy) };
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
export function insertPost(database, title, body, authorId) {
  const publishedAt = new Date().toISOString();
  const result = database.prepare(`
    INSERT INTO posts (title, body, published_at, author_id)
    VALUES (?, ?, ?, ?)
  `).run(title, body, publishedAt, authorId ?? null);
  const id = String(result.lastInsertRowid);
  const post = getAllPosts(database).find((p) => p.id === id);
  return post ?? { id, title, body, publishedAt, author: null };
}
