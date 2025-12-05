import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { PlayerState } from "@shared/schema";
import { translations, getTranslations, type Language } from "./translations";

type Translations = typeof translations["pt-br"];

interface GameContextType {
  // User state
  isAuthenticated: boolean;
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    avatarSkin: string;
  } | null;
  
  // Game state
  gamePhase: 'login' | 'lobby' | 'game';
  isConnected: boolean;
  players: Record<string, PlayerState>;
  
  // Media state
  isMuted: boolean;
  isCameraOff: boolean;
  activeCalls: string[];
  
  // Language
  language: Language;
  t: Translations;
  
  // Actions
  setGamePhase: (phase: 'login' | 'lobby' | 'game') => void;
  setIsConnected: (connected: boolean) => void;
  setPlayers: (players: Record<string, PlayerState>) => void;
  updatePlayer: (id: string, data: Partial<PlayerState>) => void;
  removePlayer: (id: string) => void;
  login: (user: { id: string; username: string; displayName: string; avatarSkin: string }) => void;
  logout: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  addActiveCall: (peerId: string) => void;
  removeActiveCall: (peerId: string) => void;
  setLanguage: (lang: Language) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<GameContextType['currentUser']>(null);
  const [gamePhase, setGamePhase] = useState<'login' | 'lobby' | 'game'>('login');
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [activeCalls, setActiveCalls] = useState<string[]>([]);
  const [language, setLanguageState] = useState<Language>('pt-br');
  
  const t = getTranslations(language);

  const login = useCallback((user: { id: string; username: string; displayName: string; avatarSkin: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setGamePhase('lobby');
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setGamePhase('login');
    setPlayers({});
    setActiveCalls([]);
  }, []);

  const updatePlayer = useCallback((id: string, data: Partial<PlayerState>) => {
    setPlayers(prev => ({
      ...prev,
      [id]: { ...prev[id], ...data }
    }));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers(prev => {
      const newPlayers = { ...prev };
      delete newPlayers[id];
      return newPlayers;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOff(prev => !prev);
  }, []);

  const addActiveCall = useCallback((peerId: string) => {
    setActiveCalls(prev => {
      if (prev.includes(peerId)) return prev;
      return [...prev, peerId];
    });
  }, []);

  const removeActiveCall = useCallback((peerId: string) => {
    setActiveCalls(prev => prev.filter(id => id !== peerId));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('devhub-language', lang);
  }, []);

  return (
    <GameContext.Provider value={{
      isAuthenticated,
      currentUser,
      gamePhase,
      isConnected,
      players,
      isMuted,
      isCameraOff,
      activeCalls,
      language,
      t,
      setGamePhase,
      setIsConnected,
      setPlayers,
      updatePlayer,
      removePlayer,
      login,
      logout,
      toggleMute,
      toggleCamera,
      addActiveCall,
      removeActiveCall,
      setLanguage,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
