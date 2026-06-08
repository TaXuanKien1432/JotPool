import 'dotenv/config'
import http from 'http'
import { WebSocketServer, type WebSocket } from 'ws'
import jwt from 'jsonwebtoken'
import type { Duplex } from 'stream'
import * as syncProtocol from 'y-protocols/sync.js'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import * as encoding from 'lib0/encoding.js'
import * as decoding from 'lib0/decoding.js'
import { flushAllDirtyRooms, getOrCreateRoom, removeClient, type Room } from './room.js'
import { closePool } from './db.js';

let shuttingDown = false;

const PORT = parseInt(process.env.PORT ?? "8081")
const JWT_SECRET = process.env.JWT_SECRET ?? ""
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? ""
const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL ?? "http://localhost:8080"

if (!JWT_SECRET || !INTERNAL_API_KEY) {
    throw new Error("JWT_SECRET and INTERNAL_API_KEY must be set in .env")
}

type WsContext = {
    userId: string;
    role: string;
    noteId: string;
    awarenessIds: Set<number>;
    room: Room;
};

export type WSWithCtx = WebSocket & { ctx: WsContext };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reject(socket: Duplex, statusLine: string, reason: string, noteId?: string) {
    socket.write(`HTTP/1.1 ${statusLine}\r\n\r\n`);
    socket.destroy();
    console.log("ws rejected", { statusLine, reason, noteId });
}

const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200).end("ok");
        return;
    }

    res.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", async (req, socket, head) => {
    const url = new URL(req.url ?? "", "http://x");
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length !== 2 || segments[0] !== "notes") {
        return reject(socket, "400 Bad Request", "bad path");
    }
    
    // extract noteId
    const noteId = segments[1]!;
    if (!UUID_RE.test(noteId)) {
        return reject(socket, "400 Bad Request", "invalid noteId", noteId);
    }

    // extract jwt token
    const token = url.searchParams.get("token");
    if (!token) {
        return reject(socket, "401 Unauthorized", "no token", noteId);
    }

    // verify jwt and extract userId
    let userId: string;
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"]});
        if (typeof payload === "string" || !payload.sub) {
            return reject(socket, "401 Unauthorized", "bad payload", noteId);
        }
        userId = payload.sub;
    } catch {
        return reject(socket, "401 Unauthorized", "jwt verify failed", noteId);
    }

    // call spring boot to get role
    let role: string;
    try {
        const resp = await fetch(`${SPRING_BOOT_URL}/internal/notes/${noteId}/access`, {
            headers: {
                "X-User-Id": userId,
                "X-Internal-Key": INTERNAL_API_KEY,
            }
        });
        if (!resp.ok) {
            return reject(socket, "403 Forbidden", `spring ${resp.status}`, noteId);
        }
        const data = await resp.json() as { role?: string };
        if (!data.role || data.role === "NONE") {
            return reject(socket, "403 Forbidden", "no access", noteId);
        }
        role = data.role;
    } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        return reject(socket, "502 Bad Gateway", `spring unreachable: ${msg}`, noteId);
    }

    // get room
    let room: Room
    try {
        room = await getOrCreateRoom(noteId);
    } catch (err) {
        return reject(socket, "500 Internal Server Error", `room load failed: ${err instanceof Error ? err.message : err}`, noteId);
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
        (ws as WSWithCtx).ctx = { userId, role, noteId, awarenessIds: new Set(), room };
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", async (ws: WSWithCtx, req) => {
    console.log("ws connected", { url: req.url, ctx: ws.ctx });
    const room = ws.ctx.room;
    room.clients.add(ws);

    {
        // send sync step 1
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, 0);
        syncProtocol.writeSyncStep1(encoder, room.doc);
        ws.send(encoding.toUint8Array(encoder));
    }

    {
        // send awareness snapshot
        const states = room.awareness.getStates();
        if (states.size > 0) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 1);
            encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(states.keys()))
            );
            ws.send(encoding.toUint8Array(encoder));
        }
    }

    ws.on("message", (data) => {
        try {
            const buf = new Uint8Array(data as Buffer);
            const decoder = decoding.createDecoder(buf);
            const encoder = encoding.createEncoder();
            const messageType = decoding.readVarUint(decoder);
            switch (messageType) {
                case 0: {
                    encoding.writeVarUint(encoder, 0);
                    syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);

                    // length > 1 means: more than just type byte we wrote, there is a sync step 2 that replies to sync step 1 from client
                    if (encoding.length(encoder) > 1) {
                        ws.send(encoding.toUint8Array(encoder));
                    }
                    break;
                }
                case 1: {
                    const update = decoding.readVarUint8Array(decoder);
                    awarenessProtocol.applyAwarenessUpdate(room.awareness, update, ws);
                    break;
                }
                default:
                    console.log("unknown message type", { messageType, noteId: ws.ctx.noteId });
            }
        } catch (err) {
            console.log("ws message error", { msg: err instanceof Error ? err.message : String(err), noteId: ws.ctx.noteId });
            ws.close();
        }
    });

    ws.on("close", async (code) => {
        try {
            await removeClient(room, ws);
        } catch (err) {
            console.log("removeClient error", { noteId: ws.ctx.noteId, err });
        }
        console.log("ws closed", { code, noteId: ws.ctx.noteId });
    });

    ws.on("error", (err) => {
        console.log("ws error", err.message);
    });
});

server.listen(PORT, () => console.log("node ws server listening", PORT))

async function shutdown(signal: string) {
    if (shuttingDown) process.exit(1);
    shuttingDown = true;
    console.log("shutting down", { signal });

    const killTimer = setTimeout(() => {
        console.log("shutdown timed out, force exit");
        process.exit(1);
    }, 5_000);
    killTimer.unref();

    server.close();
    wss.close();

    try {
        await flushAllDirtyRooms();
        await closePool();
        console.log("shutdown clean");
        process.exit(0);
    } catch (err) {
        console.log("shutdown error", { err: err instanceof Error ? err.message : err });
        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

