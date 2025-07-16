"use client";

import { useSocket } from "@/lib/socket";
import { Button, Card, CardBody, Progress } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useGameRoom } from "../hooks/useGameRoom";
import { GameRoomHeader } from "./GameRoomHeader";
import { GameSettings } from "./GameSettings";
import { PlayersList } from "./PlayersList";

interface GameRoomPageProps {
  roomCode: string;
}

export function GameRoomPage({ roomCode }: GameRoomPageProps) {
  const router = useRouter();
  const { isConnected } = useSocket();
  const {
    room,
    loading,
    joinError,
    hasJoined,
    currentPlayer,
    copyRoomCode,
    handleStartGame,
  } = useGameRoom(roomCode);

  // Early returns for loading/error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardBody className="text-center p-8">
            <Progress
              size="md"
              isIndeterminate
              aria-label="Loading room..."
              className="max-w-md"
            />
            <p className="mt-4 text-lg">Loading room...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (joinError && !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600">{joinError}</h2>
            <Button
              color="primary"
              className="mt-4"
              onClick={() => router.push("/")}
            >
              🏠 Go Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600">Room not found</h2>
            <Button
              color="primary"
              className="mt-4"
              onClick={() => router.push("/")}
            >
              🏠 Go Home
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <GameRoomHeader
        roomName={room.name}
        roomCode={roomCode}
        isConnected={isConnected}
        onCopyCode={copyRoomCode}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardBody className="p-8">
                <div className="text-center py-12">
                  <div className="text-8xl mb-6">🎨</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Welcome to {room.name}!
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    {hasJoined
                      ? `You're in the room! Invite friends with code: ${roomCode}`
                      : "Joining room..."}
                  </p>

                  {joinError && (
                    <Card className="bg-warning-50 border border-warning-200 mb-6">
                      <CardBody className="p-3">
                        <p className="text-sm text-warning-700">
                          ⚠️ {joinError}
                        </p>
                      </CardBody>
                    </Card>
                  )}

                  <GameSettings room={room} />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Players Sidebar */}
          <div className="lg:col-span-1">
            <PlayersList
              room={room}
              currentPlayerId={currentPlayer?.id || ""}
            />

            {/* Start Game Section */}
            {currentPlayer && (
              <Card className="mt-4 shadow-lg">
                <CardBody className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      ✅ You&#39;re in the room!
                    </p>
                    {room.players.length >= 2 ? (
                      <Button
                        color="success"
                        className="w-full"
                        size="lg"
                        startContent={<span>🚀</span>}
                        onClick={handleStartGame}
                        disabled={!isConnected}
                      >
                        Start Game
                      </Button>
                    ) : (
                      <Card className="bg-warning-50 border border-warning-200">
                        <CardBody className="text-center p-3">
                          <p className="text-sm text-warning-700">
                            Need at least 2 players to start
                          </p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
