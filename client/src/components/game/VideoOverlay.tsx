import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/gameContext";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlayerState } from "@shared/schema";

interface VideoOverlayProps {
  nearbyPlayers: string[];
  players: Record<string, PlayerState>;
}

export function VideoOverlay({ nearbyPlayers, players }: VideoOverlayProps) {
  const { isMuted, isCameraOff, t } = useGame();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const startMedia = async () => {
      if (nearbyPlayers.length === 0) {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
        return;
      }

      if (localStream) return; // Already have stream

      setIsConnecting(true);
      setMediaError(null);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: !isCameraOff,
          audio: !isMuted,
        });
        
        if (mounted) {
          setLocalStream(stream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (error: any) {
        console.log("Media access error:", error.name);
        if (mounted) {
          if (error.name === 'NotAllowedError') {
            setMediaError("Permissão de câmera/microfone negada");
          } else if (error.name === 'NotFoundError') {
            setMediaError("Câmera/microfone não encontrado");
          } else {
            setMediaError("Não foi possível acessar mídia");
          }
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    startMedia();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [nearbyPlayers.length, isCameraOff, isMuted]);

  // Cleanup stream when no nearby players
  useEffect(() => {
    if (nearbyPlayers.length === 0 && localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  }, [nearbyPlayers.length, localStream]);

  // Toggle audio track
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  // Toggle video track
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOff;
      });
    }
  }, [isCameraOff, localStream]);

  if (nearbyPlayers.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3 pointer-events-auto">
      {isConnecting && (
        <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-md px-3 py-2 border border-border">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{t.hud.connecting}</span>
        </div>
      )}

      {mediaError && (
        <div className="flex items-center gap-2 bg-destructive/20 backdrop-blur-sm rounded-md px-3 py-2 border border-destructive/50">
          <VideoOff className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive-foreground">{mediaError}</span>
        </div>
      )}

      {/* Local video feed */}
      {(localStream || !mediaError) && nearbyPlayers.length > 0 && (
        <div 
          className="relative w-40 h-28 rounded-md overflow-hidden border-2 border-primary/50 shadow-lg bg-card"
          data-testid="video-local"
        >
          {localStream && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute bottom-1 left-1 flex gap-1">
            <Badge 
              variant="secondary" 
              className={cn(
                "px-1.5 py-0.5 text-xs",
                isMuted && "bg-destructive/80"
              )}
            >
              {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </Badge>
          </div>
          
          <Badge 
            variant="secondary" 
            className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs"
          >
            Você
          </Badge>
        </div>
      )}

      {/* Remote player video feeds (placeholders - would need WebRTC peer connections) */}
      {nearbyPlayers.map((playerId) => {
        const player = players[playerId];
        if (!player) return null;

        return (
          <div 
            key={playerId}
            className="relative w-40 h-28 rounded-md overflow-hidden border border-border shadow-lg bg-card"
            data-testid={`video-remote-${playerId}`}
          >
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {player.isCameraOff ? "Câmera desligada" : "Conectando..."}
                </span>
              </div>
            </div>
            
            <Badge 
              variant="secondary" 
              className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs"
            >
              {player.username}
            </Badge>
            
            {player.isMuted && (
              <Badge 
                variant="destructive" 
                className="absolute bottom-1 left-1 px-1.5 py-0.5"
              >
                <MicOff className="w-3 h-3" />
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
