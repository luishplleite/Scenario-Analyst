import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider, useGame } from "@/lib/gameContext";
import { LoginScreen } from "@/components/LoginScreen";
import { LobbyScreen } from "@/components/LobbyScreen";
import { GameScreen } from "@/components/GameScreen";

function GameRouter() {
  const { gamePhase } = useGame();

  switch (gamePhase) {
    case 'login':
      return <LoginScreen />;
    case 'lobby':
      return <LobbyScreen />;
    case 'game':
      return <GameScreen />;
    default:
      return <LoginScreen />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <div className="dark">
            <GameRouter />
          </div>
        </GameProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
