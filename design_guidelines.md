# Design Guidelines: DevHub - Escritório Virtual Isométrico

## Design Approach
**Reference-Based:** Inspired by Gather.town's spatial interaction model combined with modern dark-themed tech office aesthetics. The design prioritizes spatial awareness, proximity-based interactions, and a professional yet inviting virtual workspace atmosphere.

## Visual Style & Perspective

**Isometric 2.5D Rendering:**
- Top-down diagonal perspective (isometric projection)
- Flat vector modern art style with clean lines
- Pixel art aesthetic for character sprites
- Sharp, crisp rendering (pixelArt: true in Phaser config)

**Theme:** "Dark Mode Tech Office"
- Nighttime or interior environment with soft artificial lighting
- Professional workspace ambiance with tech-forward visual identity
- Minimal visual noise, emphasis on clarity and spatial navigation

## Color Palette

**Base Environment:**
- Background/Floor: Dark gray (#2c3e50)
- Wood Accents: Warm orange (#d35400) for desks/furniture
- Asphalt/Secondary surfaces: Charcoal (#34495e)

**UI & Interactive Elements:**
- Primary UI: Semi-transparent black with neon borders (blue or green) for online status indicators
- Accent Color: Vibrant green for plants and "Online" status
- Glass dividers: Subtle transparency with light reflection effects

**Status Indicators:**
- Online: Vibrant green glow/ring
- Connecting: Pulsing blue animation
- Offline/Away: Muted gray

## Typography & Spacing

**Text Hierarchy:**
- Use system fonts for minimal loading (Arial, Helvetica, sans-serif)
- UI labels: 12-14px, medium weight
- Player names: 10-12px, floating above avatars
- Chat messages: 13px, regular weight

**Spacing System:**
- Use Tailwind units: 2, 4, 8 for consistent spacing
- Avatar proximity radius: 150px (for video/audio activation)
- Grid-based layout for map tiles (standard isometric grid)

## Game Assets Structure

**Tilesets (Seamless, Connectable):**
- Office carpet flooring
- Wood planks
- Grass (exterior areas)
- Asphalt (pathways)
- Glass wall dividers
- Concrete walls

**Interactive Objects:**
- L-shaped black desks with dual monitors
- Gaming chairs (ergonomic style)
- Potted plants in concrete planters
- Conference tables
- Break room furniture

**Avatar Sprites:**
- Low-poly/flat vector style
- 4-directional movement sprites (N, S, E, W) adapted for isometric
- Color-differentiated clothing for player identification
- Idle, walk, and sit animations (if time permits)

## Layout & Spatial Organization

**Map Zones:**
1. **Work Areas:** Clustered desks in open floor plan with glass dividers
2. **Meeting Rooms:** Enclosed spaces with conference tables
3. **Break Areas:** Casual seating, plants, relaxation zones
4. **Exterior Campus:** Green spaces, pathways connecting buildings
5. **Spawn Points:** Designated entry areas near entrance/lobby

**Navigation:**
- Clear pathways between zones (minimum 2 tiles wide)
- Collision boundaries on walls, desks, and large furniture
- Visual depth cues (shadows, layering) to indicate walkable areas

## User Interface (HUD)

**Minimal Overlay Design:**
- Top-right corner: Mute controls (Microphone/Camera icons)
- Bottom-right: Settings gear icon
- Player name tags: Floating above avatars, semi-transparent background
- Video feeds: Small circular thumbnails near avatars OR sidebar panel (user preference)

**Proximity Feedback:**
- Visual ring/circle appears around avatar when entering connection range
- "Connecting Audio..." text indicator (fades after 2s)
- Video thumbnail smoothly fades in/scales up

**Status Indicators:**
- Green dot: Active video/audio
- Red slash: Muted
- Gray: Idle/Away (after 5min inactivity)

## Interactions & Animations

**Movement:**
- WASD keyboard controls (immediate response, no input lag)
- Smooth sprite transitions between directional states
- Character shadow follows avatar (slight offset for depth)

**Proximity Video Activation:**
- Automatic connection when distance < 150px
- Smooth fade-in transition (300ms)
- Auto-disconnect when distance > 200px (hysteresis to prevent flicker)

**Environmental Effects (Subtle):**
- Gentle monitor screen glow
- Plant leaves subtle sway (ambient animation)
- Glass reflections (static or minimal shimmer)

**Avoid:** Excessive particle effects, screen shake, or distracting animations that interfere with productivity/conversation

## Accessibility & Internationalization

**Language Support:**
- JSON-based translation files (pt-br.json, en-us.json)
- Language toggle in settings menu
- All UI text must be localized (buttons, labels, tooltips)

**Accessibility:**
- High contrast mode option
- Clear visual indicators for all interactive elements
- Keyboard-only navigation support
- Screen reader compatibility for UI elements (not game canvas)

## Images

**Hero/Marketing (if landing page needed):**
- Large hero image: Isometric overview of the full office campus showing multiple users interacting
- Feature showcases: Close-up shots of proximity video chat in action, team collaboration zones
- Asset previews: Grid display of available avatar customization options

**In-Game:**
- All visual elements rendered via Phaser canvas (no DOM images except UI overlays)
- Avatar selection screen: Sprite preview grid with color variants

---

**Design Priority:** Functionality and spatial clarity over decorative elements. Every visual choice should enhance the sense of presence and facilitate natural, proximity-based collaboration.