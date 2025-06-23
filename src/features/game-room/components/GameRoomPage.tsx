"use client";

import { GameRoom } from "@/shared/types/game";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
  Spacer,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface GameRoomPageProps {
  roomCode: string;
}

export function GameRoomPage({ roomCode }: GameRoomPageProps) {
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/");
      return;
    }
    setUsername(storedUsername);

    // Fetch room data and join
    initializeRoom(storedUsername);

    // Set up auto-refresh every 3 seconds (until we have Socket.io)
    const interval = setInterval(() => {
      if (!loading) {
        fetchRoom();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [roomCode, router]);

  const initializeRoom = async (username: string) => {
    try {
      // First, fetch room data
      await fetchRoom();

      // Then, try to join the room
      await joinRoom(username);
    } catch (error) {
      console.error("Error initializing room:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}`);
      const data = await response.json();

      if (response.ok) {
        setRoom(data.room);
      } else {
        if (!hasJoined) {
          // Only show error if we haven't successfully joined before
          setJoinError("Room not found");
          setTimeout(() => router.push("/"), 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      if (!hasJoined) {
        setJoinError("Failed to load room");
      }
    }
  };

  const joinRoom = async (username: string) => {
    if (hasJoined) return; // Already joined

    try {
      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        setRoom(data.room);
        setHasJoined(true);
        setJoinError(null);
      } else {
        setJoinError(data.error || "Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      setJoinError("Network error");
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      alert("Room code copied to clipboard!");
    } catch {
      alert("Failed to copy room code");
    }
  };

  const refreshRoom = () => {
    fetchRoom();
  };

  const cleanupDuplicates = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/cleanup`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        alert(
          `Cleanup complete! Removed ${data.removedCount} duplicate players.`
        );
        fetchRoom(); // Refresh the room
      } else {
        alert("Cleanup failed: " + data.error);
      }
    } catch (error) {
      alert("Cleanup failed: Network error");
      console.error("Cleanup error:", error);
    }
  };

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

  const playerProgress = (room.players.length / room.maxPlayers) * 100;
  const currentPlayer = room.players.find((p) => p.username === username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {room.name}
                </h1>
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
              <Button
                onClick={refreshRoom}
                color="default"
                variant="bordered"
                startContent={<span>🔄</span>}
                size="sm"
              >
                Refresh
              </Button>
              <Button
                onClick={cleanupDuplicates}
                color="warning"
                variant="bordered"
                startContent={<span>🧹</span>}
                size="sm"
              >
                Clean Duplicates
              </Button>
              <Button
                onClick={copyRoomCode}
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

                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    <CardHeader>
                      <h3 className="font-semibold text-gray-800">
                        🎮 Game Settings
                      </h3>
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
                            color={
                              room.status === "waiting" ? "warning" : "success"
                            }
                            size="sm"
                            variant="flat"
                          >
                            {room.status}
                          </Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Players Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Players
                  </h3>
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
                    {room.players.map((player) => (
                      <Card
                        key={player.id}
                        className={`${
                          player.username === username
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
                                player.username === username
                                  ? "secondary"
                                  : "primary"
                              }
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {player.username}
                                {player.username === username && (
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

                <Spacer y={4} />
                <Divider />
                <Spacer y={4} />

                {/* Current User Status */}
                <div>
                  {currentPlayer ? (
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
                  ) : (
                    <Card className="bg-blue-50 border border-blue-200">
                      <CardBody className="text-center p-3">
                        <p className="text-sm text-blue-700">
                          🔄 Joining room...
                        </p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
