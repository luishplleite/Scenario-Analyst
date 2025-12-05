# DevHub - Escritório Virtual Isométrico

## Overview
DevHub é um ambiente virtual multiplayer 2.5D isométrico que simula um escritório de tecnologia moderno. O objetivo é humanizar o trabalho remoto, permitindo que equipes interajam de forma espontânea através de movimentação de avatares e chat de vídeo/áudio baseado em proximidade (estilo Gather.town).

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Game Engine:** Phaser 3 (renderização isométrica)
- **Real-time:** WebSocket (via ws package)
- **Video/Audio:** WebRTC via getUserMedia API
- **UI Components:** Shadcn/UI + Tailwind CSS
- **State Management:** React Context + TanStack Query

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── PhaserGame.tsx      # Phaser 3 game canvas
│   │   │   └── VideoOverlay.tsx    # Video chat overlay
│   │   ├── LoginScreen.tsx         # Authentication UI
│   │   ├── LobbyScreen.tsx         # Avatar selection
│   │   ├── GameScreen.tsx          # Main game wrapper
│   │   └── GameHUD.tsx             # In-game HUD
│   ├── lib/
│   │   ├── gameContext.tsx         # Game state management
│   │   ├── translations.ts         # i18n (PT-BR/EN-US)
│   │   └── queryClient.ts          # API client
│   └── App.tsx                     # Main app entry
server/
├── routes.ts                       # API + WebSocket routes
├── storage.ts                      # In-memory storage
└── index.ts                        # Express server
shared/
└── schema.ts                       # TypeScript types
```

## Features Implemented
1. **Authentication:** Login/Register with username/password
2. **Lobby:** Avatar skin selection (4 options)
3. **Isometric Office:** 
   - Phaser 3 rendered isometric map
   - L-shaped desks with dual monitors
   - Gaming chairs
   - Meeting area with whiteboard
   - Decorative plants
4. **Multiplayer:**
   - WebSocket synchronization
   - Real-time player movement
   - Player join/leave notifications
5. **Proximity Video:**
   - Automatic video activation when players are close (150px)
   - Mute/camera toggle controls
6. **Bilingual UI:** Portuguese (PT-BR) and English (EN-US)

## Controls
- **Movement:** WASD or Arrow keys
- **HUD:** Mic mute, Camera toggle, Settings, Logout

## Environment
- Server runs on port 5000
- WebSocket endpoint: `/ws`
- API endpoints: `/api/auth/login`, `/api/auth/register`, `/api/players`

## Design Theme
- Dark Mode Tech Office aesthetic
- Colors: Dark gray (#2c3e50), Green accents for online status
- Font: Inter for UI, JetBrains Mono for code

## Recent Changes
- Initial MVP implementation with Phaser 3 isometric rendering
- WebSocket-based multiplayer synchronization
- Proximity-based video chat framework
- Bilingual support (PT-BR, EN-US)
