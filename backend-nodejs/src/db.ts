import { Pool } from "pg";

const pool = new Pool({
    user: process.env.DB_USERNAME ?? "postgres",
    host: process.env.DB_HOST ?? "localhost",
    database: process.env.DB_NAME ?? "",
    password: process.env.DB_PASSWORD ?? "",
    port: parseInt(process.env.DB_PORT ?? "5432")
});

export async function loadNote(noteId: string): Promise<{ title: string | null; body: unknown; yjsDoc: Buffer | null } | null> {
    const result = await pool.query('SELECT title, body, yjs_doc FROM notes WHERE id = $1', [noteId]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { title: row.title, body: row.body, yjsDoc: row.yjs_doc };
}

export async function saveNoteSnapshot(noteId: string, snapshot: { title: string; body: unknown; yjsDoc: Buffer }): Promise<void> {
    await pool.query('UPDATE notes SET title = $1, body = $2, yjs_doc = $3, updated_at = NOW() WHERE id = $4', [snapshot.title, JSON.stringify(snapshot.body), snapshot.yjsDoc, noteId]);
    console.log("note saved", { noteId });
}