// Types for better type safety
export interface GameRoom {
  id: string;
  code: string;
  players: Set<string>;
  currentDrawer?: string;
  currentWord?: string;
  wordOptions: string[];
  status: "waiting" | "playing" | "finished";
  currentRound: number;
  maxRounds: number;
  roundTime: number;
  roundTimer?: NodeJS.Timeout;
  gameTimer?: NodeJS.Timeout;
}

export interface Player {
  id: string;
  username: string;
  socketId: string;
  roomCode: string;
  score: number;
  isReady: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
}

// In-memory storage for active rooms and players
export const activeRooms = new Map<string, GameRoom>();
export const connectedPlayers = new Map<string, Player>();
