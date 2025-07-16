"use client";

import { Button, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";

interface GameRoomHeaderProps {
  roomName: string;
  roomCode: string;
  isConnected: boolean;
  onCopyCode: () => void;
}

export function GameRoomHeader({
  roomName,
  roomCode,
  isConnected,
  onCopyCode,
}: GameRoomHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{roomName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-600">Room Code:</span>
                <Chip
                  color="primary"
                  variant="flat"
                  className="font-mono font-bold"
                >
                  {roomCode}
                </Chip>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <Button
              onClick={onCopyCode}
              color="primary"
              variant="bordered"
              startContent={<span>📋</span>}
            >
              Copy Code
            </Button>
            <Button
              onClick={() => router.push("/")}
              color="default"
              variant="bordered"
              startContent={<span>🏠</span>}
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
