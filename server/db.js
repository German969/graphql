import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'blog.db');

export const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at TEXT NOT NULL
  )
`);

/**
 * Get all posts, newest first.
 */
export function getAllPosts() {
  const rows = db.prepare(`
    SELECT id, title, body, published_at AS publishedAt
    FROM posts
    ORDER BY id DESC
  `).all();
  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    body: row.body,
    publishedAt: row.publishedAt,
  }));
}

/**
 * Insert a new post; returns the created post.
 */
export function insertPost(title, body) {
  const publishedAt = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO posts (title, body, published_at)
    VALUES (?, ?, ?)
  `).run(title, body, publishedAt);
  return {
    id: String(result.lastInsertRowid),
    title,
    body,
    publishedAt,
  };
}
