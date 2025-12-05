import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/lib/gameContext";
import { Play, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_SKINS = [
  { id: "female-blue", name: "Ana", color: "bg-blue-500" },
  { id: "male-white", name: "Carlos", color: "bg-gray-100" },
  { id: "female-green", name: "Julia", color: "bg-green-500" },
  { id: "male-red", name: "Pedro", color: "bg-red-500" },
];

export function LobbyScreen() {
  const { t, currentUser, setGamePhase } = useGame();
  const [selectedSkin, setSelectedSkin] = useState(currentUser?.avatarSkin || "female-blue");
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);

  const handleEnterGame = () => {
    setGamePhase('game');
  };

  const nextSkin = () => {
    const next = (currentSkinIndex + 1) % AVATAR_SKINS.length;
    setCurrentSkinIndex(next);
    setSelectedSkin(AVATAR_SKINS[next].id);
  };

  const prevSkin = () => {
    const prev = currentSkinIndex === 0 ? AVATAR_SKINS.length - 1 : currentSkinIndex - 1;
    setCurrentSkinIndex(prev);
    setSelectedSkin(AVATAR_SKINS[prev].id);
  };

  const currentSkin = AVATAR_SKINS[currentSkinIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-lg relative z-10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">
            {t.lobby.chooseSkin}
          </CardTitle>
          <p className="text-muted-foreground">
            {currentUser?.displayName || currentUser?.username}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="flex items-center justify-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevSkin}
              data-testid="button-prev-skin"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="relative">
              <div 
                className={cn(
                  "w-32 h-32 rounded-md flex items-center justify-center transition-all duration-300",
                  "bg-card border-2 border-border"
                )}
              >
                <div 
                  className={cn(
                    "w-20 h-20 rounded-md flex items-center justify-center",
                    currentSkin.color
                  )}
                  data-testid={`avatar-preview-${selectedSkin}`}
                >
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
              >
                {currentSkin.name}
              </Badge>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextSkin}
              data-testid="button-next-skin"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex justify-center gap-2">
            {AVATAR_SKINS.map((skin, index) => (
              <button
                key={skin.id}
                onClick={() => {
                  setCurrentSkinIndex(index);
                  setSelectedSkin(skin.id);
                }}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  index === currentSkinIndex 
                    ? "bg-primary scale-125" 
                    : "bg-muted hover:bg-muted-foreground/50"
                )}
                data-testid={`skin-indicator-${index}`}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted/50 space-y-2">
              <h4 className="font-medium text-sm">Controles</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-card rounded text-xs font-mono">W A S D</kbd>
                  <span>Mover</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-card rounded text-xs font-mono">Arrows</kbd>
                  <span>Mover</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleEnterGame}
              data-testid="button-enter-office"
            >
              <Play className="w-5 h-5" />
              {t.lobby.enterButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
