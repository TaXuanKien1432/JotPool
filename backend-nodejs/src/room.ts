import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as syncProtocol from 'y-protocols/sync.js';
import * as encoding from 'lib0/encoding.js';
import * as Y from 'yjs'
import type { WSWithCtx } from './index.js';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { loadNote } from './db.js';

const editor = ServerBlockNoteEditor.create();

export type Room = {
    noteId: string;
    doc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    clients: Set<WSWithCtx>;
    dirty: boolean;
    saveTimer: NodeJS.Timeout | null;
}

const rooms = new Map<string, Room>();

export async function getOrCreateRoom(noteId: string): Promise<Room> {
    const existing = rooms.get(noteId);
    if (existing) return existing;

    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    const room: Room = {
        noteId,
        doc,
        awareness,
        clients: new Set(),
        dirty: false,
        saveTimer: null
    };

    const row = await loadNote(noteId);
    if (row === null) {
        throw new Error(`note not found: ${noteId}`);
    }
    if (row.yjsDoc !== null) {
        Y.applyUpdate(doc, new Uint8Array(row.yjsDoc));
    } else {
        // private to collab transition
        const blocks = (row.body as any[]) ?? [];
        const seedDoc = editor.blocksToYDoc(blocks, "body");
        Y.applyUpdate(doc, Y.encodeStateAsUpdate(seedDoc));
        doc.getText("title").insert(0, row.title ?? "");
    }

    // doc update -> broadcast sync update to all clients except the origin
    doc.on("update", (update: Uint8Array, origin) => {
        room.dirty = true;
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 0);
        syncProtocol.writeUpdate(encoder, update);
        const msg = encoding.toUint8Array(encoder);
        for (const client of room.clients) {
            if (client !== origin && client.readyState === client.OPEN) client.send(msg);
        }
    });

    // awareness update -> track which clientIDs the origin ws controls and broadcast to others
    awareness.on("update", ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }, origin: unknown) => {
        if (origin && room.clients.has(origin as WSWithCtx)) {
            const ws = origin as WSWithCtx;
            for (const id of added) ws.ctx.awarenessIds.add(id);
            for (const id of updated) ws.ctx.awarenessIds.add(id);
            for (const id of removed) ws.ctx.awarenessIds.delete(id);
        }
        const changed = [...added, ...updated, ...removed]
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 1);
        encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changed));
        const msg = encoding.toUint8Array(encoder);
        for (const client of room.clients) {
            if (client !== origin && client.readyState === client.OPEN) client.send(msg);
        }
    });

    rooms.set(noteId, room);
    return room;
}

export function removeClient(room: Room, ws: WSWithCtx) {
    if (!room.clients.has(ws)) return;
    room.clients.delete(ws);

    if (ws.ctx.awarenessIds.size > 0) {
        awarenessProtocol.removeAwarenessStates(room.awareness, Array.from(ws.ctx.awarenessIds), null);
    }

    if (room.clients.size === 0) {
        console.log("force-flush stub", { noteId: room.noteId });
        room.awareness.destroy();
        room.doc.destroy();
        rooms.delete(room.noteId);
    }
}
