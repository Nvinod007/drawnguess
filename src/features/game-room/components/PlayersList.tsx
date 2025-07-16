"use client";

import { GamePlayer, GameRoom } from "@/shared/types/game";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
} from "@heroui/react";

interface PlayersListProps {
  room: GameRoom;
  currentPlayerId: string;
}

export function PlayersList({ room, currentPlayerId }: PlayersListProps) {
  const playerProgress = (room.players.length / room.maxPlayers) * 100;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-800">Players</h3>
          <Chip color="primary" size="sm">
            {room.players.length}/{room.maxPlayers}
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <Progress
          value={playerProgress}
          color={playerProgress >= 50 ? "success" : "warning"}
          className="mb-4"
          size="sm"
        />

        {room.players.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500 text-sm">
              Waiting for players to join...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {room.players.map((player: GamePlayer) => (
              <Card
                key={player.id}
                className={`${
                  player.id === currentPlayerId
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50"
                }`}
              >
                <CardBody className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={player.username.charAt(0).toUpperCase()}
                      size="sm"
                      color={
                        player.id === currentPlayerId ? "secondary" : "primary"
                      }
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {player.username}
                        {player.id === currentPlayerId && (
                          <span className="text-xs text-blue-600 ml-1">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Score: {player.score}
                      </p>
                    </div>
                    {player.isReady && (
                      <Chip color="success" size="sm" variant="flat">
                        ✓
                      </Chip>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
