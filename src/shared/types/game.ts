export interface GameRoom {
  id: string;
  code: string;
  name: string;
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  currentRound: number;
  maxRounds: number;
  roundTime: number;
  currentDrawer?: string;
  currentWord?: string;
  wordOptions: string[];
  players: GamePlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GamePlayer {
  id: string;
  username: string;
  avatar?: string;
  roomId: string;
  score: number;
  isReady: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
  socketId?: string;
  joinedAt: Date;
  updatedAt: Date;
}

export interface DrawingData {
  id: string;
  roomId: string;
  round: number;
  drawerId?: string;
  drawData: any; // JSON drawing paths
  word?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  playerId?: string;
  username: string;
  content: string;
  type: "chat" | "guess" | "system" | "correct";
  round?: number;
  createdAt: Date;
}

export interface Word {
  id: string;
  word: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

// Drawing related types
export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawPath {
  points: DrawPoint[];
  tool: "pen" | "eraser";
  color: string;
  width: number;
}

export interface CanvasState {
  paths: DrawPath[];
  isDrawing: boolean;
  currentTool: "pen" | "eraser";
  currentColor: string;
  currentWidth: number;
}

// Game state types
export interface GameState {
  room: GameRoom | null;
  currentPlayer: GamePlayer | null;
  canvas: CanvasState;
  messages: ChatMessage[];
  isConnected: boolean;
  timeLeft: number;
}
