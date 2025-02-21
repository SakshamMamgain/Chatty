/**
 * Storage Module for Secure Messenger
 * 
 * This module provides an abstraction layer for database operations using Supabase.
 * It handles:
 * - User management (create, read)
 * - Chat room management (create, read)
 * - Session storage using MemoryStore
 */

import { type User, type InsertUser, type Room } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { supabase } from './supabase';

const MemoryStore = createMemoryStore(session);

/**
 * Storage interface defining all database operations
 */
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRoom(room: { name: string; password?: string; creatorId: number }): Promise<Room>;
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  getRoomByName(name: string): Promise<Room | undefined>;
  sessionStore: session.Store;
}

/**
 * Supabase implementation of the storage interface
 * Handles all database operations using Supabase client
 */
export class SupabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  /**
   * Get a user by their ID
   * @param id - User's numeric ID
   * @returns User object if found, undefined otherwise
   */
  async getUser(id: number): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error getting user:', error);
        throw new Error(`Failed to get user: ${error.message}`);
      }
      return data || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Get a user by their username
   * @param username - User's username
   * @returns User object if found, undefined otherwise
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('username', username)
        .single();

      if (error) {
        // PGRST116 means no rows found, which is expected for new usernames
        if (error.code === 'PGRST116') {
          return undefined;
        }
        console.error('Supabase error getting user by username:', error);
        throw new Error(`Failed to get user by username: ${error.message}`);
      }
      return data || undefined;
    } catch (error) {
      if (error instanceof Error && error.message.includes('PGRST116')) {
        return undefined;
      }
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param insertUser - User data to insert
   * @returns Created user object
   * @throws Error if creation fails
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([insertUser])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating user:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      if (!data) {
        throw new Error('No user data returned after creation');
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Create a new chat room
   * @param room - Room data including name, optional password, and creator ID
   * @returns Created room object
   * @throws Error if creation fails
   */
  async createRoom(room: { name: string; password?: string; creatorId: number }): Promise<Room> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: room.name,
          password: room.password,
          creator_id: room.creatorId
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating room:', error);
        throw new Error(`Failed to create room: ${error.message}`);
      }

      if (!data) {
        throw new Error('No room data returned after creation');
      }

      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  /**
   * Get all chat rooms
   * @returns Array of all rooms
   */
  async getRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select();

      if (error) {
        console.error('Supabase error getting rooms:', error);
        throw new Error(`Failed to get rooms: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error('Error getting rooms:', error);
      throw error;
    }
  }

  /**
   * Get a room by its ID
   * @param id - Room's numeric ID
   * @returns Room object if found, undefined otherwise
   */
  async getRoom(id: number): Promise<Room | undefined> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error getting room:', error);
        throw new Error(`Failed to get room: ${error.message}`);
      }
      return data || undefined;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }

  /**
   * Get a room by its name
   * @param name - Room's name
   * @returns Room object if found, undefined otherwise
   */
  async getRoomByName(name: string): Promise<Room | undefined> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select()
        .eq('name', name)
        .single();

      if (error) {
        // PGRST116 means no rows found, which is fine for a lookup
        if (error.code === 'PGRST116') {
          return undefined;
        }
        console.error('Supabase error getting room by name:', error);
        throw new Error(`Failed to get room by name: ${error.message}`);
      }
      return data || undefined;
    } catch (error) {
      // Only rethrow if it's not the "no rows" case
      if (error instanceof Error && !error.message.includes('PGRST116')) {
        console.error('Error getting room by name:', error);
        throw error;
      }
      return undefined;
    }
  }
}

export const storage = new SupabaseStorage();
