"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface JoinRoomResponse {
  room: {
    id: string;
    code: string;
    name: string;
  };
}

interface UseJoinRoomReturn {
  joinRoom: (username: string, roomCode: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useJoinRoom(): UseJoinRoomReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = async (
    username: string,
    roomCode: string
  ): Promise<void> => {
    if (!username.trim() || !roomCode.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (roomCode.length < 4) {
      setError("Room code must be at least 4 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const code = roomCode.trim().toUpperCase();

      // Check if room exists
      const response = await fetch(`/api/rooms/${code}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Room not found");
        return;
      }

      const data: JoinRoomResponse = await response.json();
      console.log("data", data);
      // Store username for the game room
      localStorage.setItem("username", username.trim());
      // Navigate to the game room
      router.push(`/room/${code}`);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Join room error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { joinRoom, isLoading, error };
}
