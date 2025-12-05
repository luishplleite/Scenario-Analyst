import type { Express } from "express";
import { createServer, type Server } from "http";
<<<<<<< HEAD
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { PlayerState } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  playerId?: string;
  isAlive?: boolean;
}
=======
import { storage } from "./storage";
>>>>>>> 68aad9d (Extracted stack files)

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
<<<<<<< HEAD
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username e senha são obrigatórios" });
      }

      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // For MVP, create user if not exists (simplified auth)
        user = await storage.createUser({ 
          username, 
          password,
          displayName: username,
          avatarSkin: "female-blue",
          language: "pt-br"
        });
      } else if (user.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      return res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarSkin: user.avatarSkin || "female-blue",
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, displayName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username e senha são obrigatórios" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username já existe" });
      }

      const user = await storage.createUser({ 
        username, 
        password,
        displayName: displayName || username,
        avatarSkin: "female-blue",
        language: "pt-br"
      });

      return res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarSkin: user.avatarSkin || "female-blue",
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get online players count
  app.get("/api/players", (req, res) => {
    const players = storage.getAllPlayers();
    return res.json({ 
      count: Object.keys(players).length,
      players: Object.values(players).map(p => ({
        id: p.id,
        username: p.username,
        x: p.x,
        y: p.y,
      }))
    });
  });

  // WebSocket server for real-time multiplayer
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Heartbeat interval to detect disconnected clients
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = ws as WebSocketClient;
      if (client.isAlive === false) {
        if (client.playerId) {
          handlePlayerDisconnect(client.playerId, wss);
        }
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws: WebSocketClient) => {
    console.log('New WebSocket connection');
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message, wss);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (ws.playerId) {
        handlePlayerDisconnect(ws.playerId, wss);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function handleWebSocketMessage(
    ws: WebSocketClient, 
    message: any, 
    wss: WebSocketServer
  ) {
    switch (message.type) {
      case 'playerJoin': {
        const player = message.player as PlayerState;
        ws.playerId = player.id;
        storage.addPlayer(player);
        
        // Send current players to the new player
        ws.send(JSON.stringify({
          type: 'currentPlayers',
          players: storage.getAllPlayers()
        }));

        // Broadcast new player to others
        broadcast(wss, ws, {
          type: 'playerJoin',
          player
        });
        
        console.log(`Player joined: ${player.username} (${player.id})`);
        break;
      }

      case 'playerMove': {
        const { id, x, y, direction, isMoving } = message;
        storage.updatePlayer(id, { x, y, direction, isMoving });
        
        // Broadcast movement to all other players
        broadcast(wss, ws, {
          type: 'playerMove',
          id,
          x,
          y,
          direction,
          isMoving
        });
        break;
      }

      case 'toggleMute': {
        const { id, isMuted } = message;
        storage.updatePlayer(id, { isMuted });
        
        broadcast(wss, ws, {
          type: 'toggleMute',
          id,
          isMuted
        });
        break;
      }

      case 'toggleCamera': {
        const { id, isCameraOff } = message;
        storage.updatePlayer(id, { isCameraOff });
        
        broadcast(wss, ws, {
          type: 'toggleCamera',
          id,
          isCameraOff
        });
        break;
      }

      case 'proximityConnect': {
        // Signal proximity connection between players
        const { peerId, targetPeerId } = message;
        
        // Find the target player's WebSocket and notify them
        wss.clients.forEach((client) => {
          const wsClient = client as WebSocketClient;
          if (wsClient.playerId === targetPeerId && wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify({
              type: 'proximityConnect',
              peerId,
              targetPeerId
            }));
          }
        });
        break;
      }

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  function handlePlayerDisconnect(playerId: string, wss: WebSocketServer) {
    const player = storage.getPlayer(playerId);
    if (player) {
      console.log(`Player disconnected: ${player.username} (${playerId})`);
      storage.removePlayer(playerId);
      
      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'playerLeave',
            id: playerId
          }));
        }
      });
    }
  }

  function broadcast(wss: WebSocketServer, sender: WebSocket, message: any) {
    const messageStr = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
=======
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
>>>>>>> 68aad9d (Extracted stack files)

  return httpServer;
}
