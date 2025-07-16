"use client";

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { GameRoom } from "@/shared/types/game";

interface GameSettingsProps {
  room: GameRoom;
}

export function GameSettings({ room }: GameSettingsProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
      <CardHeader>
        <h3 className="font-semibold text-gray-800">🎮 Game Settings</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>
              Max Players: <strong>{room.maxPlayers}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>
              Rounds: <strong>{room.maxRounds}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>
              Time per Round: <strong>{room.roundTime}s</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>📊</span>
            <Chip
              color={room.status === "waiting" ? "warning" : "success"}
              size="sm"
              variant="flat"
            >
              {room.status}
            </Chip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
