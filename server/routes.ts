/**
 * Routes and WebSocket Handler for Secure Messenger
 * 
 * This module sets up:
 * - RESTful API routes for rooms and messages
 * - WebSocket server for real-time chat
 * - Real-time message broadcasting
 * - User presence tracking in rooms
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertRoomSchema } from "@shared/schema";
import { ZodError } from "zod";
import { supabase } from "./supabase";

/**
 * Extended WebSocket client interface
 * Includes user and room tracking for chat functionality
 */
interface Client extends WebSocket {
  userId?: number;    // Current user's ID
  roomId?: number;    // Current chat room ID
}

/**
 * Message structure for WebSocket communication
 * Handles different types of chat events
 */
interface Message {
  type: "message" | "join" | "leave";  // Event type
  roomId: number;                      // Target room
  userId: number;                      // Sender's user ID
  username: string;                    // Sender's username
  content?: string;                    // Message content (for type="message")
  encrypted?: boolean;                 // Whether content is encrypted
}

/**
 * Set up all routes and WebSocket server
 * @param app - Express application instance
 * @returns HTTP server instance with attached WebSocket server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Set up authentication routes and middleware
  setupAuth(app);

  /**
   * Create a new chat room
   * POST /api/rooms
   * Requires authentication
   */
  app.post("/api/rooms", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('Unauthorized attempt to create room');
      return res.sendStatus(401);
    }

    try {
      const roomData = insertRoomSchema.parse(req.body);
      console.log('Attempting to create room:', roomData.name);

      const existingRoom = await storage.getRoomByName(roomData.name);
      if (existingRoom) {
        console.log('Room creation failed: name already exists:', roomData.name);
        return res.status(400).json({ message: "Room name already exists" });
      }

      // Add creator_id from the authenticated user
      const room = await storage.createRoom({
        name: roomData.name,
        password: roomData.password,
        creatorId: req.user.id,
      });

      console.log('Room created successfully:', room.name);
      res.status(201).json(room);
    } catch (e) {
      console.error('Error creating room:', e);
      if (e instanceof ZodError) {
        res.status(400).json({ message: "Invalid room data", errors: e.errors });
      } else {
        res.status(500).json({ message: "Failed to create room" });
      }
    }
  });

  /**
   * Get messages for a specific room
   * GET /api/rooms/:roomId/messages
   * Requires authentication
   */
  app.get("/api/rooms/:roomId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', req.params.roomId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Map messages to match expected client format
      const userIds = [...new Set(messages.map(msg => msg.user_id))];
      const { data: users } = await supabase
        .from('users')
        .select('id,username')
        .in('id', userIds);

      const userMap = (users || []).reduce((acc: {[key: number]: string}, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {});

      const formattedMessages = messages.map(msg => ({
        type: 'message',
        roomId: msg.room_id,
        userId: msg.user_id,
        content: msg.content,
        encrypted: msg.encrypted,
        username: userMap[msg.user_id] || 'Unknown User'
      }));
      
      res.json({ data: formattedMessages });
    } catch (e) {
      console.error('Error getting messages:', e);
      res.status(500).send("Internal server error");
    }
  });

  /**
   * Get list of all chat rooms
   * GET /api/rooms
   * Requires authentication
   */
  app.get("/api/rooms", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (e) {
      console.error('Error getting rooms:', e);
      res.status(500).send("Internal server error");
    }
  });

  // Create HTTP server and attach WebSocket server
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Track active clients in each room
  const rooms = new Map<number, Set<Client>>();

  /**
   * Handle WebSocket connections
   * Manages real-time chat functionality including:
   * - Room joining/leaving
   * - Message broadcasting
   * - User presence tracking
   */
  wss.on("connection", (ws: Client) => {
    console.log('WebSocket connection established');

    ws.on("message", async (data) => {
      try {
        const message: Message = JSON.parse(data.toString());
        console.log('Received message:', message.type);

        if (message.type === "join") {
          try {
            const room = await storage.getRoom(message.roomId);
            if (!room) {
              console.error('Room not found:', message.roomId);
              return;
            }

            ws.userId = message.userId;
            ws.roomId = message.roomId;

            let roomClients = rooms.get(message.roomId);
            if (!roomClients) {
              roomClients = new Set();
              rooms.set(message.roomId, roomClients);
            }
            roomClients.add(ws);

            const joinMessage = {
              type: "join",
              userId: message.userId,
              username: message.username,
              roomId: message.roomId
            };

            roomClients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(joinMessage));
              }
            });
          } catch (error) {
            console.error('Error handling join message:', error);
          }
        } else if (message.type === "message") {
          try {
            const roomClients = rooms.get(message.roomId);
            if (!roomClients) {
              console.error('Room not found for message:', message.roomId);
              return;
            }

            const messageToSend = {
              type: "message",
              roomId: message.roomId,
              userId: message.userId,
              username: message.username,
              content: message.content,
              encrypted: message.encrypted
            };

            // Save message to database
            try {
              await supabase.from('messages').insert({
                room_id: message.roomId,
                user_id: message.userId,
                content: message.content,
                encrypted: message.encrypted
              });
            } catch (error) {
              console.error('Error saving message:', error);
            }

            roomClients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageToSend));
              }
            });
          } catch (error) {
            console.error('Error handling chat message:', error);
          }
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log('WebSocket connection closed');
      if (ws.roomId && ws.userId) {
        const roomClients = rooms.get(ws.roomId);
        if (roomClients) {
          roomClients.delete(ws);
          if (roomClients.size === 0) {
            rooms.delete(ws.roomId);
          } else {
            const leaveMessage: Message = {
              type: "leave",
              roomId: ws.roomId,
              userId: ws.userId,
              username: "", // Server doesn't track usernames
            };
            roomClients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leaveMessage));
              }
            });
          }
        }
      }
    });
  });

  return httpServer;
}
