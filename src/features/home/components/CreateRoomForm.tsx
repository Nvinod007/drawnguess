"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Home, Rocket } from "lucide-react";

interface CreateRoomFormProps {
  username: string;
  onSubmit: (roomName: string) => void;
  isLoading?: boolean;
}

export function CreateRoomForm({
  username,
  onSubmit,
  isLoading = false,
}: CreateRoomFormProps) {
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && username.trim()) {
      onSubmit(roomName.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Create New Room</h3>
      </div>

      <Input
        placeholder="Room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        maxLength={30}
        variant="bordered"
        size="lg"
        startContent={<Home className="text-default-400" size={18} />}
        classNames={{
          input: "text-base",
          inputWrapper: "h-12",
        }}
      />

      <Button
        type="submit"
        color="primary"
        size="lg"
        className="w-full font-medium"
        isDisabled={!roomName.trim() || !username.trim()}
        isLoading={isLoading}
        startContent={!isLoading && <Rocket size={18} />}
      >
        {isLoading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  );
}
