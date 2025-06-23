// src/lib/socket.ts
import { ChatMessage, DrawPath, GamePlayer } from "@/shared/types/game";
import { io, Socket } from "socket.io-client";

// Define only CUSTOM events (not Socket.io reserved events)
interface ServerToClientEvents {
  "player-joined": (player: GamePlayer) => void;
  "player-left": (playerId: string) => void;
  "room-updated": (roomData: { players: GamePlayer[] }) => void;
  draw: (drawData: DrawPath) => void;
  "clear-canvas": () => void;
  message: (message: ChatMessage) => void;
  "game-started": () => void;
  "game-ended": (scores: Record<string, number>) => void;
  "turn-changed": (drawerId: string) => void;
  "word-selected": (word: string) => void;
  "correct-guess": (playerId: string, word: string) => void;
  "timer-update": (timeLeft: number) => void;
}

interface ClientToServerEvents {
  "join-room": (data: { roomCode: string; username: string }) => void;
  "leave-room": (roomCode: string) => void;
  draw: (data: { roomCode: string; path: DrawPath }) => void;
  "clear-canvas": (roomCode: string) => void;
  message: (data: { roomCode: string; content: string }) => void;
  "start-game": (roomCode: string) => void;
  "select-word": (data: { roomCode: string; word: string }) => void;
  guess: (data: { roomCode: string; guess: string }) => void;
}

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private static instance: SocketManager;

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      autoConnect: false,
    });

    // Handle Socket.io built-in events separately (no typing conflicts)
    this.socket.on("connect", () => {
      console.log("Connected to socket server:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.connect();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  // ✅ FIXED: Simplified emit for custom events only
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    data: Parameters<ClientToServerEvents[K]>[0]
  ): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit:", event);
    }
  }

  // ✅ FIXED: Simplified on for custom events only
  on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // ✅ FIXED: Simplified off for custom events only
  off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K]
  ): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Separate methods for Socket.io built-in events
  onConnect(callback: () => void): void {
    if (this.socket) {
      this.socket.on("connect", callback);
    }
  }

  onDisconnect(callback: () => void): void {
    if (this.socket) {
      this.socket.on("disconnect", callback);
    }
  }

  onError(callback: (error: Error) => void): void {
    if (this.socket) {
      this.socket.on("connect_error", callback);
    }
  }

  // Convenience methods with proper types
  joinRoom(roomCode: string, username: string): void {
    this.emit("join-room", { roomCode, username });
  }

  leaveRoom(roomCode: string): void {
    this.emit("leave-room", roomCode);
  }

  sendDrawing(roomCode: string, path: DrawPath): void {
    this.emit("draw", { roomCode, path });
  }

  sendMessage(roomCode: string, content: string): void {
    this.emit("message", { roomCode, content });
  }

  startGame(roomCode: string): void {
    this.emit("start-game", roomCode);
  }

  clearCanvas(roomCode: string): void {
    this.emit("clear-canvas", roomCode);
  }

  selectWord(roomCode: string, word: string): void {
    this.emit("select-word", { roomCode, word });
  }

  sendGuess(roomCode: string, guess: string): void {
    this.emit("guess", { roomCode, guess });
  }
}

export const socketManager = SocketManager.getInstance();
export default socketManager;

// Export types for use in other files
export type { ClientToServerEvents, ServerToClientEvents };
