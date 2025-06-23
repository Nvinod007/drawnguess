"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useCreateRoom() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (username: string, roomName: string) => {
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

      const data = await response.json();

      if (response.ok) {
        // Store username for the game room
        localStorage.setItem("username", username.trim());
        // Navigate to the game room
        router.push(`/room/${data.room.code}`);
      } else {
        setError(data.error || "Failed to create room");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Create room error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createRoom, isLoading, error };
}
