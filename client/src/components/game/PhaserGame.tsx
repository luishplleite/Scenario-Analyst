import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { PlayerState } from "@shared/schema";

interface PhaserGameProps {
  players: Record<string, PlayerState>;
  currentUserId?: string;
  onPlayerMove?: (x: number, y: number, direction: string) => void;
  onProximityChange?: (nearbyPlayers: string[]) => void;
}

export function PhaserGame({ players, currentUserId, onPlayerMove, onProximityChange }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MainScene | null>(null);

  const onPlayerMoveRef = useRef(onPlayerMove);
  const onProximityChangeRef = useRef(onProximityChange);
  const playersRef = useRef(players);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    onPlayerMoveRef.current = onPlayerMove;
    onProximityChangeRef.current = onProximityChange;
    playersRef.current = players;
    currentUserIdRef.current = currentUserId;
  });

  useEffect(() => {
    if (sceneRef.current && Object.keys(players).length > 0) {
      sceneRef.current.syncOtherPlayers(players, currentUserId);
    }
  }, [players, currentUserId]);

  class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Container;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
    private otherPlayerSprites: Map<string, Phaser.GameObjects.Container> = new Map();
    private lastX: number = 0;
    private lastY: number = 0;
    private moveThrottle: number = 0;
    private lastProximityCheck: number = 0;
    private currentUsername: string = "Player";

    constructor() {
      super({ key: "MainScene" });
    }

    preload() {
      // Assets are created procedurally
    }

    create() {
      sceneRef.current = this;
      
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      this.add.rectangle(0, 0, width * 4, height * 4, 0x2c3e50).setOrigin(0, 0).setDepth(-1000);

      this.createIsometricFloor(width, height);
      this.createOfficeObjects();
      this.createPlayer();
      this.setupControls();
      
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.cameras.main.setZoom(1.2);
      this.cameras.main.setBackgroundColor(0x2c3e50);
    }

    createIsometricFloor(width: number, height: number) {
      const tileSize = 64;
      const gridWidth = 25;
      const gridHeight = 18;

      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const isoX = (x - y) * (tileSize / 2) + width / 2;
          const isoY = (x + y) * (tileSize / 4) + 80;
          
          const isEdge = x === 0 || y === 0 || x === gridWidth - 1 || y === gridHeight - 1;
          
          let color = 0x3d566e;
          if (isEdge) color = 0x34495e;
          if (!isEdge && (x + y) % 3 === 0) {
            color = 0x3a4f63;
          }
          
          const tile = this.add.polygon(isoX, isoY, [
            0, -tileSize / 4,
            tileSize / 2, 0,
            0, tileSize / 4,
            -tileSize / 2, 0
          ], color, 1);
          
          tile.setStrokeStyle(1, 0x2c3e50, 0.5);
          tile.setDepth(-500);
        }
      }
    }

    createOfficeObjects() {
      const workAreas = [
        { x: 250, y: 180, count: 3 },
        { x: 250, y: 320, count: 3 },
        { x: 650, y: 180, count: 3 },
        { x: 650, y: 320, count: 3 },
      ];

      workAreas.forEach(area => {
        for (let i = 0; i < area.count; i++) {
          const deskX = area.x + i * 120;
          this.createDesk(deskX, area.y);
          
          if (i === 1) {
            this.createPlant(deskX + 60, area.y - 30);
          }
        }
      });

      this.createMeetingArea(1000, 280);
      
      const plantPositions = [
        { x: 100, y: 150 },
        { x: 100, y: 350 },
        { x: 1150, y: 150 },
        { x: 1150, y: 350 },
      ];
      
      plantPositions.forEach(pos => {
        this.createLargePlant(pos.x, pos.y);
      });
    }

    createDesk(x: number, y: number) {
      const desk = this.add.container(x, y);
      
      const deskTop = this.add.polygon(0, 0, [
        -45, -18, 45, -18, 55, 0, 45, 18, -45, 18, -55, 0
      ], 0x1a1a2e, 1);
      deskTop.setStrokeStyle(2, 0x16213e);
      
      const legLeft = this.add.rectangle(-40, 22, 8, 20, 0x0f0f1a);
      const legRight = this.add.rectangle(40, 22, 8, 20, 0x0f0f1a);
      
      const monitor1 = this.createMonitor(-15, -28);
      const monitor2 = this.createMonitor(15, -28);
      const chair = this.createChair(0, 50);
      
      desk.add([legLeft, legRight, deskTop, monitor1, monitor2, chair]);
      desk.setDepth(y);
    }

    createMonitor(x: number, y: number): Phaser.GameObjects.Container {
      const monitor = this.add.container(x, y);
      const screenGlow = this.add.rectangle(0, 0, 28, 18, 0x00d4ff, 0.2);
      const screen = this.add.rectangle(0, 0, 24, 14, 0x00d4ff, 0.9);
      screen.setStrokeStyle(2, 0x0a0a14);
      const stand = this.add.rectangle(0, 12, 6, 8, 0x0a0a14);
      const base = this.add.rectangle(0, 18, 14, 3, 0x0a0a14);
      monitor.add([screenGlow, screen, stand, base]);
      return monitor;
    }

    createChair(x: number, y: number): Phaser.GameObjects.Container {
      const chair = this.add.container(x, y);
      const seat = this.add.ellipse(0, 0, 28, 16, 0x1a1a2e);
      seat.setStrokeStyle(1, 0x16213e);
      const backrest = this.add.ellipse(0, -16, 24, 28, 0x16213e);
      backrest.setStrokeStyle(1, 0x1a1a2e);
      const stripe = this.add.rectangle(0, -16, 4, 22, 0x3498db, 0.6);
      chair.add([seat, backrest, stripe]);
      return chair;
    }

    createPlant(x: number, y: number) {
      const plant = this.add.container(x, y);
      const pot = this.add.polygon(0, 12, [-14, -10, 14, -10, 12, 10, -12, 10], 0x555555, 1);
      pot.setStrokeStyle(1, 0x444444);
      const leaves = this.add.circle(0, -5, 18, 0x27ae60);
      const leaf2 = this.add.circle(-10, -12, 12, 0x2ecc71);
      const leaf3 = this.add.circle(10, -12, 12, 0x2ecc71);
      const leaf4 = this.add.circle(0, -18, 10, 0x27ae60);
      plant.add([pot, leaves, leaf2, leaf3, leaf4]);
      plant.setDepth(y);
    }

    createLargePlant(x: number, y: number) {
      const plant = this.add.container(x, y);
      const pot = this.add.polygon(0, 20, [-20, -15, 20, -15, 18, 15, -18, 15], 0x555555, 1);
      pot.setStrokeStyle(2, 0x444444);
      const leaves = this.add.circle(0, -10, 28, 0x27ae60);
      const leaf2 = this.add.circle(-15, -25, 18, 0x2ecc71);
      const leaf3 = this.add.circle(15, -25, 18, 0x2ecc71);
      const leaf4 = this.add.circle(-8, -35, 14, 0x27ae60);
      const leaf5 = this.add.circle(8, -35, 14, 0x2ecc71);
      plant.add([pot, leaves, leaf2, leaf3, leaf4, leaf5]);
      plant.setDepth(y);
    }

    createMeetingArea(x: number, y: number) {
      const table = this.add.ellipse(x, y, 120, 70, 0x2c3e50);
      table.setStrokeStyle(3, 0x34495e);
      table.setDepth(y - 1);

      const chairPositions = [
        { dx: -70, dy: 0 }, { dx: 70, dy: 0 },
        { dx: -35, dy: -45 }, { dx: 35, dy: -45 },
        { dx: -35, dy: 45 }, { dx: 35, dy: 45 },
      ];

      chairPositions.forEach(pos => {
        const chair = this.add.circle(x + pos.dx, y + pos.dy, 14, 0x1a1a2e);
        chair.setStrokeStyle(2, 0x16213e);
        chair.setDepth(y + pos.dy);
      });
      
      const whiteboard = this.add.container(x, y - 100);
      const board = this.add.rectangle(0, 0, 80, 50, 0xecf0f1);
      board.setStrokeStyle(3, 0x34495e);
      const stand1 = this.add.rectangle(-35, 35, 4, 20, 0x34495e);
      const stand2 = this.add.rectangle(35, 35, 4, 20, 0x34495e);
      whiteboard.add([board, stand1, stand2]);
      whiteboard.setDepth(y - 100);
    }

    createPlayer() {
      const startX = 400;
      const startY = 300;
      
      this.player = this.add.container(startX, startY);
      
      const shadow = this.add.ellipse(0, 22, 32, 16, 0x000000, 0.35);
      const body = this.add.container(0, 0);
      
      const torso = this.add.rectangle(0, 2, 22, 28, 0x3498db);
      torso.setStrokeStyle(1, 0x2980b9);
      const head = this.add.circle(0, -18, 13, 0xfad7a0);
      head.setStrokeStyle(1, 0xe8c88b);
      const hair = this.add.ellipse(0, -24, 15, 11, 0x5d4037);
      const armLeft = this.add.rectangle(-14, 0, 6, 18, 0x3498db);
      const armRight = this.add.rectangle(14, 0, 6, 18, 0x3498db);
      
      body.add([torso, armLeft, armRight, head, hair]);
      
      this.currentUsername = "Player";
      const currentPlayer = playersRef.current[currentUserIdRef.current || ""];
      if (currentPlayer) {
        this.currentUsername = currentPlayer.username;
      }
      
      const nameTag = this.add.text(0, -45, this.currentUsername, {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 8, y: 4 },
      });
      nameTag.setOrigin(0.5, 0.5);
      
      const statusDot = this.add.circle(nameTag.width / 2 + 8, -45, 5, 0x27ae60);
      const statusGlow = this.add.circle(nameTag.width / 2 + 8, -45, 8, 0x27ae60, 0.3);
      
      this.player.add([shadow, body, nameTag, statusGlow, statusDot]);
      this.player.setDepth(startY + 1000);
      
      this.lastX = startX;
      this.lastY = startY;
    }

    setupControls() {
      if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = {
          W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
          A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
          S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
          D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
      }
    }

    update(time: number) {
      if (!this.player || !this.cursors) return;

      const speed = 3.5;
      let dx = 0;
      let dy = 0;
      let direction = "down";

      const left = this.cursors.left.isDown || this.wasdKeys?.A.isDown;
      const right = this.cursors.right.isDown || this.wasdKeys?.D.isDown;
      const up = this.cursors.up.isDown || this.wasdKeys?.W.isDown;
      const down = this.cursors.down.isDown || this.wasdKeys?.S.isDown;

      if (left) { dx = -speed; direction = "left"; }
      else if (right) { dx = speed; direction = "right"; }

      if (up) { dy = -speed * 0.7; direction = "up"; }
      else if (down) { dy = speed * 0.7; direction = "down"; }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }

      if (dx !== 0 || dy !== 0) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        const minX = 80;
        const maxX = 1180;
        const minY = 100;
        const maxY = 480;
        
        if (newX >= minX && newX <= maxX) {
          this.player.x = newX;
        }
        if (newY >= minY && newY <= maxY) {
          this.player.y = newY;
        }
        
        this.player.setDepth(this.player.y + 1000);

        if (time > this.moveThrottle) {
          this.moveThrottle = time + 50;
          
          if (Math.abs(this.player.x - this.lastX) > 2 || Math.abs(this.player.y - this.lastY) > 2) {
            this.lastX = this.player.x;
            this.lastY = this.player.y;
            onPlayerMoveRef.current?.(this.player.x, this.player.y, direction);
          }
        }
      }

      if (time > this.lastProximityCheck + 200) {
        this.lastProximityCheck = time;
        this.checkProximity();
      }
    }

    checkProximity() {
      const proximityRadius = 150;
      const nearbyPlayers: string[] = [];

      Object.entries(playersRef.current).forEach(([id, playerData]) => {
        if (id === currentUserIdRef.current) return;
        
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          playerData.x,
          playerData.y
        );
        
        if (distance < proximityRadius) {
          nearbyPlayers.push(id);
        }
      });

      onProximityChangeRef.current?.(nearbyPlayers);
    }

    syncOtherPlayers(players: Record<string, PlayerState>, currentUserId?: string) {
      Object.entries(players).forEach(([id, playerData]) => {
        if (id === currentUserId) return;
        
        let sprite = this.otherPlayerSprites.get(id);
        
        if (!sprite) {
          sprite = this.createOtherPlayerSprite(playerData);
          this.otherPlayerSprites.set(id, sprite);
        }
        
        // Smooth interpolation
        this.tweens.add({
          targets: sprite,
          x: playerData.x,
          y: playerData.y,
          duration: 100,
          ease: 'Linear',
          onUpdate: () => {
            sprite!.setDepth(sprite!.y + 1000);
          }
        });
      });

      // Remove disconnected players
      this.otherPlayerSprites.forEach((sprite, id) => {
        if (!players[id] || id === currentUserId) {
          sprite.destroy();
          this.otherPlayerSprites.delete(id);
        }
      });
    }

    createOtherPlayerSprite(playerData: PlayerState): Phaser.GameObjects.Container {
      const container = this.add.container(playerData.x, playerData.y);
      
      const shadow = this.add.ellipse(0, 22, 32, 16, 0x000000, 0.35);
      const body = this.add.container(0, 0);
      
      const torso = this.add.rectangle(0, 2, 22, 28, 0xe74c3c);
      torso.setStrokeStyle(1, 0xc0392b);
      const head = this.add.circle(0, -18, 13, 0xfad7a0);
      head.setStrokeStyle(1, 0xe8c88b);
      const hair = this.add.ellipse(0, -24, 15, 11, 0x2c3e50);
      const armLeft = this.add.rectangle(-14, 0, 6, 18, 0xe74c3c);
      const armRight = this.add.rectangle(14, 0, 6, 18, 0xe74c3c);
      body.add([torso, armLeft, armRight, head, hair]);
      
      const nameTag = this.add.text(0, -45, playerData.username || "Player", {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 8, y: 4 },
      });
      nameTag.setOrigin(0.5, 0.5);
      
      const statusDot = this.add.circle(nameTag.width / 2 + 8, -45, 5, 0x27ae60);
      
      container.add([shadow, body, nameTag, statusDot]);
      container.setDepth(playerData.y + 1000);
      
      return container;
    }
  }

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#2c3e50",
      pixelArt: true,
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full absolute inset-0"
      data-testid="game-canvas"
    />
  );
}
