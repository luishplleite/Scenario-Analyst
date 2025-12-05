<<<<<<< HEAD
=======
import { Switch, Route } from "wouter";
>>>>>>> 68aad9d (Extracted stack files)
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
<<<<<<< HEAD
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
=======
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      {/* <Route path="/" component={Home}/> */}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
>>>>>>> 68aad9d (Extracted stack files)
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
<<<<<<< HEAD
        <GameProvider>
          <div className="dark">
            <GameRouter />
          </div>
        </GameProvider>
        <Toaster />
=======
        <Toaster />
        <Router />
>>>>>>> 68aad9d (Extracted stack files)
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
