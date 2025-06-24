import { ChatMessage, DrawPath, GamePlayer } from "@/shared/types/game";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Define types for events emitted from the server to the client
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

// Define types for events emitted from the client to the server
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

// Define specific types for Socket.IO's built-in reserved events received by the client.
// These are standard event signatures defined by the library.
interface SocketReservedEvents {
  connect: () => void;
  disconnect: (reason: Socket.DisconnectReason) => void;
  connect_error: (err: Error) => void;
}

// A union type of all possible event names the client can listen to.
type AllEventNames = keyof ServerToClientEvents | keyof SocketReservedEvents;

// A union type of all possible listener functions for both custom and reserved events.
// This is the key to removing 'any' from the implementation signature.
type AnyListenerFn =
  | ServerToClientEvents[keyof ServerToClientEvents]
  | SocketReservedEvents[keyof SocketReservedEvents];

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

/**
 * A custom React hook for managing Socket.IO connection and events.
 * Provides functions to emit events and listen for incoming events.
 */
export function useSocket() {
  // Socket type correctly uses two generic parameters:
  // ServerToClientEvents for listening, ClientToServerEvents for emitting.
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        SOCKET_URL,
        {
          autoConnect: false,
        }
      );

      socketRef.current = newSocket;

      // These internal event listeners work directly with `Socket<ServerToClientEvents, ClientToServerEvents>`
      // because `socket.io-client` implicitly knows these are part of its own event system.
      newSocket.on("connect", () => {
        console.log("Connected to socket server:", newSocket.id);
        setIsConnected(true);
        setError(null);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Disconnected from socket server:", reason);
        setIsConnected(false);
        if (reason !== "io client disconnect") {
          setError(new Error(`Disconnected unexpectedly: ${reason}`));
        } else {
          setError(null);
        }
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setError(err);
      });

      newSocket.connect();
    }

    return () => {
      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current = null;
      }
    };
  }, []);

  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(
      event: K,
      ...args: Parameters<ClientToServerEvents[K]>
    ): void => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(event, ...args);
      } else {
        console.warn("Socket not connected, cannot emit:", event);
      }
    },
    []
  );

  // --- Overloaded 'on' method for full type safety at the call site ---

  // Overload 1: For all custom ServerToClientEvents
  function on<K extends keyof ServerToClientEvents>(
    event: K,
    listener: ServerToClientEvents[K]
  ): void;

  // Overload 2: For 'connect' reserved event
  function on(
    event: "connect",
    listener: SocketReservedEvents["connect"]
  ): void;

  // Overload 3: For 'disconnect' reserved event
  function on(
    event: "disconnect",
    listener: SocketReservedEvents["disconnect"]
  ): void;

  // Overload 4: For 'connect_error' reserved event
  function on(
    event: "connect_error",
    listener: SocketReservedEvents["connect_error"]
  ): void;

  // Implementation signature: This uses the exact union types to be 'any'-free.
  function on(event: AllEventNames, listener: AnyListenerFn): void {
    if (socketRef.current) {
      // TypeScript can now correctly resolve this as the implementation signature's
      // parameters precisely match the union of all possible event names and listener types.
      socketRef.current.on(event, listener);
    }
  }

  const memoizedOn = useCallback(on, [on]);

  // --- Overloaded 'off' method for full type safety at the call site ---

  // Overload 1: For all custom ServerToClientEvents
  function off<K extends keyof ServerToClientEvents>(
    event: K,
    listener?: ServerToClientEvents[K]
  ): void;

  // Overload 2: For 'connect' reserved event
  function off(
    event: "connect",
    listener?: SocketReservedEvents["connect"]
  ): void;

  // Overload 3: For 'disconnect' reserved event
  function off(
    event: "disconnect",
    listener?: SocketReservedEvents["disconnect"]
  ): void;

  // Overload 4: For 'connect_error' reserved event
  function off(
    event: "connect_error",
    listener?: SocketReservedEvents["connect_error"]
  ): void;

  // Implementation signature for 'off'
  function off(event: AllEventNames, listener?: AnyListenerFn): void {
    if (socketRef.current) {
      if (listener) {
        socketRef.current.off(event, listener);
      } else {
        socketRef.current.off(event);
      }
    }
  }

  const memoizedOff = useCallback(off, [off]);

  // --- Specific event emitters for convenience ---
  const joinRoom = useCallback(
    (roomCode: string, username: string) => {
      emit("join-room", { roomCode, username });
    },
    [emit]
  );

  const leaveRoom = useCallback(
    (roomCode: string) => {
      emit("leave-room", roomCode);
    },
    [emit]
  );

  const sendDrawing = useCallback(
    (roomCode: string, path: DrawPath) => {
      emit("draw", { roomCode, path });
    },
    [emit]
  );

  const sendMessage = useCallback(
    (roomCode: string, content: string) => {
      emit("message", { roomCode, content });
    },
    [emit]
  );

  const startGame = useCallback(
    (roomCode: string) => {
      emit("start-game", roomCode);
    },
    [emit]
  );

  const clearCanvas = useCallback(
    (roomCode: string) => {
      emit("clear-canvas", roomCode);
    },
    [emit]
  );

  const selectWord = useCallback(
    (roomCode: string, word: string) => {
      emit("select-word", { roomCode, word });
    },
    [emit]
  );

  const sendGuess = useCallback(
    (roomCode: string, guess: string) => {
      emit("guess", { roomCode, guess });
    },
    [emit]
  );

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on: memoizedOn,
    off: memoizedOff,
    joinRoom,
    leaveRoom,
    sendDrawing,
    sendMessage,
    startGame,
    clearCanvas,
    selectWord,
    sendGuess,
  };
}
