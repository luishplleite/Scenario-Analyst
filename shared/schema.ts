import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profiles for the virtual office
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarSkin: text("avatar_skin").default("female-blue"),
  spawnX: integer("spawn_x").default(400),
  spawnY: integer("spawn_y").default(300),
  language: text("language").default("pt-br"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarSkin: true,
  language: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Player state for real-time synchronization
export interface PlayerState {
  id: string;
  peerId?: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  username: string;
  avatarSkin: string;
  isMoving: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

// Game map configuration
export interface MapTile {
  x: number;
  y: number;
  type: 'floor-carpet' | 'floor-wood' | 'floor-grass' | 'floor-asphalt' | 'wall' | 'glass-wall';
  walkable: boolean;
}

export interface MapObject {
  id: string;
  x: number;
  y: number;
  type: 'desk-l' | 'chair-gamer' | 'monitor' | 'plant' | 'car-red' | 'car-blue';
  rotation: number;
  collidable: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: MapTile[];
  objects: MapObject[];
  spawnPoints: { x: number; y: number }[];
}

// WebSocket message types
export type SocketMessage = 
  | { type: 'playerJoin'; player: PlayerState }
  | { type: 'playerMove'; id: string; x: number; y: number; direction: string; isMoving: boolean }
  | { type: 'playerLeave'; id: string }
  | { type: 'currentPlayers'; players: Record<string, PlayerState> }
  | { type: 'proximityConnect'; peerId: string; targetPeerId: string }
  | { type: 'proximityDisconnect'; peerId: string; targetPeerId: string }
  | { type: 'toggleMute'; id: string; isMuted: boolean }
  | { type: 'toggleCamera'; id: string; isCameraOff: boolean };

// Proximity settings
export const PROXIMITY_RADIUS = 150; // pixels
export const PROXIMITY_DISCONNECT_RADIUS = 200; // hysteresis to prevent flicker

// Translation keys
export interface Translations {
  auth: {
    login: string;
    register: string;
    username: string;
    password: string;
    confirmPassword: string;
    displayName: string;
    enterOffice: string;
    selectAvatar: string;
    selectLanguage: string;
  };
  hud: {
    mute: string;
    unmute: string;
    cameraOn: string;
    cameraOff: string;
    settings: string;
    connecting: string;
    connected: string;
    disconnected: string;
  };
  lobby: {
    title: string;
    chooseSkin: string;
    enterButton: string;
  };
  status: {
    online: string;
    connecting: string;
    offline: string;
  };
}
