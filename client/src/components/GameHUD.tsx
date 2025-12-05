import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/lib/gameContext";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings, 
  LogOut,
  Wifi,
  WifiOff,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GameHUD() {
  const { 
    t, 
    currentUser, 
    isConnected, 
    isMuted, 
    isCameraOff, 
    players,
    activeCalls,
    toggleMute, 
    toggleCamera,
    logout 
  } = useGame();

  const playerCount = Object.keys(players).length;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-4 left-4 flex items-center gap-3 pointer-events-auto">
        <Badge 
          variant="secondary" 
          className={cn(
            "gap-2 py-1.5 px-3",
            isConnected ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
          )}
          data-testid="status-connection"
        >
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              {t.hud.connected}
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              {t.hud.disconnected}
            </>
          )}
        </Badge>

        <Badge 
          variant="secondary" 
          className="gap-2 py-1.5 px-3"
          data-testid="status-players"
        >
          <Users className="w-3.5 h-3.5" />
          {playerCount} online
        </Badge>

        {currentUser && (
          <Badge 
            variant="outline" 
            className="py-1.5 px-3"
            data-testid="text-username"
          >
            {currentUser.displayName || currentUser.username}
          </Badge>
        )}
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleMute}
          data-testid="button-toggle-mute"
        >
          {isMuted ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant={isCameraOff ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleCamera}
          data-testid="button-toggle-camera"
        >
          {isCameraOff ? (
            <VideoOff className="w-4 h-4" />
          ) : (
            <Video className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {activeCalls.length > 0 && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
          {activeCalls.map((peerId) => (
            <div 
              key={peerId}
              className="w-32 h-24 bg-card rounded-md border border-border overflow-hidden"
              data-testid={`video-call-${peerId}`}
            >
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Video className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <div className="text-xs text-muted-foreground font-mono bg-card/80 px-2 py-1 rounded">
          WASD / Arrows para mover
        </div>
      </div>
    </div>
  );
}
