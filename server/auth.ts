/**
 * Authentication System for Secure Messenger
 * 
 * This module handles user authentication using Passport.js with a local strategy.
 * Features include:
 * - Secure password hashing using scrypt
 * - Session-based authentication
 * - User registration and login
 * - Secure session storage with encryption
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Extend Express.User interface to include our custom user type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Convert scrypt to use promises instead of callbacks
const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt with a random salt
 * @param password - The plain text password to hash
 * @returns A string in the format "hash.salt"
 */
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compare a supplied password with a stored hash
 * @param supplied - The password to check
 * @param stored - The stored password hash in "hash.salt" format
 * @returns boolean indicating if the passwords match
 */
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Set up authentication middleware and routes
 * This function configures:
 * - Session middleware
 * - Passport local strategy
 * - User serialization
 * - Authentication routes (login, register, logout)
 * 
 * @param app - Express application instance
 */
export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    // Generate a random session secret if not provided
    process.env.SESSION_SECRET = randomBytes(32).toString('hex');
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          console.log('Login failed: Invalid username or password');
          return done(null, false);
        }
        console.log('Login successful for user:', username);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        console.error('Deserialization failed: User not found:', id);
        return done(new Error('User not found'));
      }
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration attempt for username:', req.body.username);
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('Registration failed: Username already exists:', req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) {
          console.error('Login after registration failed:', err);
          return next(err);
        }
        console.log('Registration successful for username:', user.username);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      if (!user) {
        console.log('Login failed: Invalid credentials for username:', req.body.username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('Login session error:', err);
          return next(err);
        }
        console.log('Login successful for username:', user.username);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    try {
      const username = req.user?.username;
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
          return next(err);
        }
        console.log('Logout successful for username:', username);
        res.sendStatus(200);
      });
    } catch (error) {
      console.error('Logout error:', error);
      next(error);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('Unauthorized access to /api/user');
      return res.sendStatus(401);
    }
    console.log('User data retrieved for:', req.user?.username);
    res.json(req.user);
  });
}
