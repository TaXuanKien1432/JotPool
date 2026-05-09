import 'dotenv/config'
import http from 'http'
import { WebSocketServer, type WebSocket } from 'ws'
import jwt from 'jsonwebtoken'
import type { Duplex } from 'stream'

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
};

type WSWithCtx = WebSocket & { ctx?: WsContext };

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

    // verify jwt
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

    wss.handleUpgrade(req, socket, head, (ws) => {
        (ws as WSWithCtx).ctx = { userId, role, noteId };
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws: WSWithCtx, req) => {
    console.log("ws connected", { url: req.url, ctx: ws.ctx });

    ws.on("message", (data) => {
        const text = data.toString();
        ws.send(text);
        console.log("ws echoed", text);
    });

    ws.on("close", (code) => {
        console.log("ws closed", { code, noteId: ws.ctx?.noteId });
    });

    ws.on("error", (err) => {
        console.log("ws error", err.message);
    });
});

server.listen(PORT, () => console.log("node ws server listening", PORT))

