import { useState, useCallback, useEffect, useRef } from "react";
import { PhaserGame } from "./game/PhaserGame";
import { VideoOverlay } from "./game/VideoOverlay";
import { GameHUD } from "./GameHUD";
import { useGame } from "@/lib/gameContext";
import type { PlayerState } from "@shared/schema";

export function GameScreen() {
  const { 
    currentUser, 
    players,
    setPlayers, 
    updatePlayer, 
    removePlayer,
    setIsConnected,
    isMuted,
    isCameraOff
  } = useGame();
  const [nearbyPlayers, setNearbyPlayers] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  const sendMessage = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Connecting to WebSocket:", wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      if (currentUser) {
        const playerData: PlayerState = {
          id: currentUser.id,
          username: currentUser.displayName || currentUser.username,
          avatarSkin: currentUser.avatarSkin,
          x: 400,
          y: 300,
          direction: "down",
          isMoving: false,
          isMuted: isMuted,
          isCameraOff: isCameraOff,
        };

        socket.send(JSON.stringify({
          type: "playerJoin",
          player: playerData
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WS message received:", message.type);
        
        switch (message.type) {
          case "currentPlayers":
            console.log("Setting current players:", message.players);
            setPlayers(message.players || {});
            break;
            
          case "playerJoin":
            console.log("Player joined:", message.player);
            if (message.player && message.player.id !== currentUser?.id) {
              updatePlayer(message.player.id, message.player);
            }
            break;
            
          case "playerMove":
            if (message.id !== currentUser?.id) {
              updatePlayer(message.id, {
                x: message.x,
                y: message.y,
                direction: message.direction,
                isMoving: message.isMoving,
              });
            }
            break;
            
          case "playerLeave":
            console.log("Player left:", message.id);
            removePlayer(message.id);
            break;
            
          case "toggleMute":
            if (message.id !== currentUser?.id) {
              updatePlayer(message.id, { isMuted: message.isMuted });
            }
            break;
            
          case "toggleCamera":
            if (message.id !== currentUser?.id) {
              updatePlayer(message.id, { isCameraOff: message.isCameraOff });
            }
            break;

          case "proximityConnect":
            console.log("Proximity connection request from:", message.peerId);
            break;
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      socketRef.current = null;
      isConnectingRef.current = false;
      
      // Attempt reconnection after 2 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [currentUser, setIsConnected, setPlayers, updatePlayer, removePlayer, isMuted, isCameraOff]);

  // Sync mute/camera state with server
  useEffect(() => {
    if (currentUser) {
      sendMessage({
        type: "toggleMute",
        id: currentUser.id,
        isMuted
      });
    }
  }, [isMuted, currentUser, sendMessage]);

  useEffect(() => {
    if (currentUser) {
      sendMessage({
        type: "toggleCamera",
        id: currentUser.id,
        isCameraOff
      });
    }
  }, [isCameraOff, currentUser, sendMessage]);

  const handlePlayerMove = useCallback((x: number, y: number, direction: string) => {
    if (currentUser) {
      sendMessage({
        type: "playerMove",
        id: currentUser.id,
        x,
        y,
        direction,
        isMoving: true,
      });
    }
  }, [currentUser, sendMessage]);

  const handleProximityChange = useCallback((playerIds: string[]) => {
    setNearbyPlayers(prev => {
      const prevSorted = [...prev].sort();
      const newSorted = [...playerIds].sort();
      if (prevSorted.length !== newSorted.length || !prevSorted.every((p, i) => p === newSorted[i])) {
        return playerIds;
      }
      return prev;
    });
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-background relative">
      <PhaserGame 
        players={players}
        currentUserId={currentUser?.id}
        onPlayerMove={handlePlayerMove}
        onProximityChange={handleProximityChange}
      />
      
      <GameHUD />
      
      <VideoOverlay nearbyPlayers={nearbyPlayers} players={players} />
    </div>
  );
}
