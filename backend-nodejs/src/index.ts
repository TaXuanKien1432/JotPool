import 'dotenv/config'
import http from 'http'
import { WebSocketServer } from 'ws'

const PORT = parseInt(process.env.PORT ?? "8081")

const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200).end("ok");
        return;
    }

    res.writeHead(404).end();
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws, req) => {
    console.log("ws connected", req.url);

    ws.on("message", (data) => {
        const text = data.toString();
        ws.send(text);
        console.log("ws echoed", text);
    });

    ws.on("close", (code) => {
        console.log("ws closed", code);
    });

    ws.on("error", (err) => {
        console.log("ws error", err.message);
    });
});

server.listen(PORT, () => console.log("node ws server listening", PORT))

