/**
 * Schema definitions for the Secure Messenger application.
 * This file contains database table schemas and TypeScript types using drizzle-orm.
 */

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table schema
 * Stores user account information with secure password hashing
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

/**
 * Chat rooms table schema
 * Stores information about chat rooms including optional password protection
 */
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  password: text("password").notNull(),
  creator_id: integer("creator_id").notNull(), 
});

/**
 * Messages table schema
 * Stores chat messages with support for end-to-end encryption
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  room_id: integer("room_id").notNull(),
  user_id: integer("user_id").notNull(),
  content: text("content").notNull(),
  encrypted: boolean("encrypted").notNull().default(true),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Zod schema for user creation
 * Validates user input when creating new accounts
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

/**
 * Zod schema for room creation
 * Validates input when creating new chat rooms
 */
export const insertRoomSchema = createInsertSchema(rooms)
  .omit({
    id: true,
    creator_id: true,
  });

/**
 * Zod schema for message creation
 * Validates message data before insertion
 */
export const insertMessageSchema = createInsertSchema(messages).pick({
  room_id: true,
  user_id: true,
  content: true,
  encrypted: true,
});

// Type definitions for TypeScript support
export type InsertUser = z.infer<typeof insertUserSchema>;       // Type for creating new users
export type User = typeof users.$inferSelect;                    // Type for user records
export type Room = typeof rooms.$inferSelect;                    // Type for chat room records
export type Message = typeof messages.$inferSelect;              // Type for message records
export type InsertMessage = z.infer<typeof insertMessageSchema>; // Type for creating new messages
