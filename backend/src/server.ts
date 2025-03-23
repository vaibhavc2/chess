import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const gameManager = new GameManager();

wss.on('connection', (ws) => {
  gameManager.addUser(ws);
  ws.on('close', () => {
    gameManager.removeUser(ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket Server is accessible at: ws://localhost:${PORT}`);
});

export default server;
