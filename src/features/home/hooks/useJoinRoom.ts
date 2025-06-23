"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useJoinRoom() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoom = async (username: string, roomCode: string) => {
    console.log("jpin", username);
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
      const data = await response.json();

      if (response.ok) {
        // Store username for the game room
        localStorage.setItem("username", username.trim());
        // Navigate to the game room
        router.push(`/room/${code}`);
      } else {
        setError(data.error || "Room not found");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Join room error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { joinRoom, isLoading, error };
}
