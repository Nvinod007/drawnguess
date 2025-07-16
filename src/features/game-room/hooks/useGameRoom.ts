"use client";

import { useSocket } from "@/lib/socket";
import { GamePlayer, GameRoom } from "@/shared/types/game";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useGameRoom(roomCode: string) {
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const {
    isConnected,
    joinRoom: socketJoinRoom,
    startGame,
    on,
    off,
  } = useSocket();

  // Setup socket listeners
  const setupSocketListeners = useCallback(() => {
    on(
      "room-updated",
      (roomData: {
        players: GamePlayer[];
        currentRound?: number;
        currentDrawer?: string;
        status?: string;
      }) => {
        setRoom((prevRoom) =>
          prevRoom
            ? {
                ...prevRoom,
                players: roomData.players,
                currentRound: roomData.currentRound || prevRoom.currentRound,
                currentDrawer: roomData.currentDrawer || prevRoom.currentDrawer,
                status:
                  (roomData.status as "waiting" | "playing" | "finished") ||
                  prevRoom.status,
              }
            : null
        );
      }
    );

    on("player-joined", (player: GamePlayer) => {
      setRoom((prevRoom) => {
        if (!prevRoom) return null;
        const playerExists = prevRoom.players.some((p) => p.id === player.id);
        if (playerExists) return prevRoom;
        return {
          ...prevRoom,
          players: [...prevRoom.players, player],
        };
      });
    });

    on("player-left", (playerId: string) => {
      setRoom((prevRoom) =>
        prevRoom
          ? {
              ...prevRoom,
              players: prevRoom.players.filter((p) => p.id !== playerId),
            }
          : null
      );
    });

    on("game-started", () => {
      setRoom((prevRoom) =>
        prevRoom
          ? {
              ...prevRoom,
              status: "playing",
            }
          : null
      );
    });
  }, [on]);

  const teardownSocketListeners = useCallback(() => {
    off("room-updated");
    off("player-joined");
    off("player-left");
    off("game-started");
  }, [off]);

  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}`);
      const data = await response.json();

      if (response.ok) {
        setRoom(data.room);
      } else {
        if (!hasJoined) {
          setJoinError("Room not found");
          setTimeout(() => router.push("/"), 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      if (!hasJoined) {
        setJoinError("Failed to load room");
      }
    }
  }, [roomCode, hasJoined, router]);

  const joinRoom = useCallback(
    async (username: string) => {
      if (hasJoined) return;

      try {
        const response = await fetch(`/api/rooms/${roomCode}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (response.ok) {
          setRoom(data.room);
          setHasJoined(true);
          setJoinError(null);
        } else {
          setJoinError(data.error || "Failed to join room");
        }
      } catch (error) {
        console.error("Error joining room:", error);
        setJoinError("Network error");
      }
    },
    [hasJoined, roomCode]
  );

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      alert("Room code copied to clipboard!");
    } catch {
      alert("Failed to copy room code");
    }
  };

  const handleStartGame = () => {
    if (isConnected) {
      startGame(roomCode);
    }
  };

  const currentPlayer = room?.players.find((p) => p.username === username);

  const initializeRoom = useCallback(
    async (username: string) => {
      try {
        await fetchRoom();
        await joinRoom(username);
      } catch (error) {
        console.error("Error initializing room:", error);
      } finally {
        setLoading(false);
      }
    },
    [fetchRoom, joinRoom]
  );

  // Initialize room
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/");
      return;
    }
    setUsername(storedUsername);
    initializeRoom(storedUsername);
  }, [roomCode, router, initializeRoom]);

  // Setup socket connection
  useEffect(() => {
    if (isConnected && username && hasJoined) {
      socketJoinRoom(roomCode, username);
      setupSocketListeners();
    }

    return () => {
      if (isConnected) {
        teardownSocketListeners();
      }
    };
  }, [
    isConnected,
    username,
    hasJoined,
    roomCode,
    socketJoinRoom,
    setupSocketListeners,
    teardownSocketListeners,
  ]);

  return {
    room,
    loading,
    joinError,
    hasJoined,
    username,
    currentPlayer,
    copyRoomCode,
    handleStartGame,
  };
}
