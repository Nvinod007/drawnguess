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

// Drawing related types - PROPERLY TYPED
export interface DrawPoint {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface DrawPath {
  id: string;
  points: DrawPoint[];
  tool: "pen" | "eraser" | "brush";
  color: string;
  width: number;
  opacity?: number;
  timestamp: number;
}

export interface DrawingPaths {
  paths: DrawPath[];
  canvasWidth: number;
  canvasHeight: number;
  version: number;
}

// FIXED: No more any types!
export interface DrawingData {
  id: string;
  roomId: string;
  round: number;
  drawerId?: string;
  drawData: DrawingPaths; // ✅ Properly typed instead of any
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

export interface CanvasState {
  paths: DrawPath[];
  isDrawing: boolean;
  currentTool: "pen" | "eraser" | "brush";
  currentColor: string;
  currentWidth: number;
  canvasWidth: number;
  canvasHeight: number;
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
