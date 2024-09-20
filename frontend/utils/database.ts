import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: './mydb.sqlite',
      driver: sqlite3.Database
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        google_id TEXT UNIQUE,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry INTEGER
      )
    `);
  }
  return db;
}

export async function findOrCreateUser(email: string, name: string, googleId: string, tokens: any) {
  const db = await openDb();
  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
  
  if (existingUser) {
    await db.run(
      'UPDATE users SET name = ?, google_id = ?, access_token = ?, refresh_token = ?, token_expiry = ? WHERE email = ?',
      name, googleId, tokens.access_token, tokens.refresh_token, Date.now() + tokens.expires_in * 1000, email
    );
    return existingUser;
  } else {
    const result = await db.run(
      'INSERT INTO users (email, name, google_id, access_token, refresh_token, token_expiry) VALUES (?, ?, ?, ?, ?, ?)',
      email, name, googleId, tokens.access_token, tokens.refresh_token, Date.now() + tokens.expires_in * 1000
    );
    return { id: result.lastID, email, name, google_id: googleId };
  }
}