"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateRoomResponse {
  room: {
    id: string;
    code: string;
    name: string;
  };
}

interface UseCreateRoomReturn {
  createRoom: (username: string, roomName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateRoom(): UseCreateRoomReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (
    username: string,
    roomName: string
  ): Promise<void> => {
    if (!username.trim() || !roomName.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName.trim(),
          maxPlayers: 8,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create room");
        return;
      }

      const data: CreateRoomResponse = await response.json();

      // Store username for the game room
      localStorage.setItem("username", username.trim());
      // Navigate to the game room
      router.push(`/room/${data.room.code}`);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Create room error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createRoom, isLoading, error };
}
