<<<<<<< HEAD
import { type User, type InsertUser, type PlayerState } from "@shared/schema";
import { randomUUID } from "crypto";

=======
import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

>>>>>>> 68aad9d (Extracted stack files)
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
<<<<<<< HEAD
  
  // Player state management
  getPlayer(id: string): PlayerState | undefined;
  getAllPlayers(): Record<string, PlayerState>;
  addPlayer(player: PlayerState): void;
  updatePlayer(id: string, data: Partial<PlayerState>): void;
  removePlayer(id: string): void;
=======
>>>>>>> 68aad9d (Extracted stack files)
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
<<<<<<< HEAD
  private players: Map<string, PlayerState>;

  constructor() {
    this.users = new Map();
    this.players = new Map();
=======

  constructor() {
    this.users = new Map();
>>>>>>> 68aad9d (Extracted stack files)
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
<<<<<<< HEAD
    const user: User = { 
      ...insertUser, 
      id,
      displayName: insertUser.displayName || insertUser.username,
      avatarSkin: insertUser.avatarSkin || "female-blue",
      spawnX: 400,
      spawnY: 300,
      language: insertUser.language || "pt-br",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  getPlayer(id: string): PlayerState | undefined {
    return this.players.get(id);
  }

  getAllPlayers(): Record<string, PlayerState> {
    const result: Record<string, PlayerState> = {};
    this.players.forEach((player, id) => {
      result[id] = player;
    });
    return result;
  }

  addPlayer(player: PlayerState): void {
    this.players.set(player.id, player);
  }

  updatePlayer(id: string, data: Partial<PlayerState>): void {
    const existing = this.players.get(id);
    if (existing) {
      this.players.set(id, { ...existing, ...data });
    }
  }

  removePlayer(id: string): void {
    this.players.delete(id);
  }
=======
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
>>>>>>> 68aad9d (Extracted stack files)
}

export const storage = new MemStorage();
