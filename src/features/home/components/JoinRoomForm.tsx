"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Key, Target } from "lucide-react";

interface JoinRoomFormProps {
  username: string;
  onSubmit: (roomCode: string) => void;
  isLoading?: boolean;
}

export function JoinRoomForm({
  username,
  onSubmit,
  isLoading = false,
}: JoinRoomFormProps) {
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && username.trim()) {
      onSubmit(roomCode.trim().toUpperCase());
    }
  };

  const handleRoomCodeChange = (value: string) => {
    // Auto-uppercase and limit to 6 characters
    setRoomCode(value.toUpperCase().slice(0, 6));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Join Existing Room</h3>
      </div>

      <Input
        placeholder="Enter room code"
        value={roomCode}
        onChange={(e) => handleRoomCodeChange(e.target.value)}
        maxLength={6}
        variant="bordered"
        size="lg"
        startContent={<Key className="text-default-400" size={18} />}
        classNames={{
          input: "text-base font-mono tracking-wider",
          inputWrapper: "h-12",
        }}
      />

      <Button
        type="submit"
        color="secondary"
        size="lg"
        className="w-full font-medium"
        isDisabled={!roomCode.trim() || !username.trim() || roomCode.length < 4}
        isLoading={isLoading}
        startContent={!isLoading && <Target size={18} />}
      >
        {isLoading ? "Joining..." : "Join Room"}
      </Button>
    </form>
  );
}
