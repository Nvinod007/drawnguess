import { createServer } from "http";
import { Server } from "socket.io";
import { Prisma, PrismaClient } from "../generated/prisma";
import { DEFAULT_WORDS, getRandomWords } from "../lib/utils";
import { ChatMessage } from "../shared/types/game";

// Initialize Prisma client
const prisma = new PrismaClient();

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Types for better type safety
interface GameRoom {
  id: string;
  code: string;
  players: Set<string>;
  currentDrawer?: string;
  currentWord?: string;
  wordOptions: string[];
  status: "waiting" | "playing" | "finished";
  currentRound: number;
  maxRounds: number;
  roundTime: number;
  roundTimer?: NodeJS.Timeout;
  gameTimer?: NodeJS.Timeout;
}

interface Player {
  id: string;
  username: string;
  socketId: string;
  roomCode: string;
  score: number;
  isReady: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
}

// In-memory storage for active rooms and players
const activeRooms = new Map<string, GameRoom>();
const connectedPlayers = new Map<string, Player>();

// Utility functions
async function getRoomFromDB(code: string) {
  return await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      players: {
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

async function updatePlayerInDB(
  playerId: string,
  updates: Prisma.PlayerUpdateInput
) {
  return await prisma.player.update({
    where: { id: playerId },
    data: updates,
  });
}

async function updateRoomInDB(roomId: string, updates: Prisma.RoomUpdateInput) {
  return await prisma.room.update({
    where: { id: roomId },
    data: updates,
  });
}

function getNextDrawer(room: GameRoom): string | undefined {
  const players = Array.from(room.players);
  if (players.length === 0) return undefined;

  const currentIndex = room.currentDrawer
    ? players.indexOf(room.currentDrawer)
    : -1;
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex];
}

function startRoundTimer(room: GameRoom) {
  if (room.roundTimer) {
    clearInterval(room.roundTimer);
  }

  let timeLeft = room.roundTime;

  // Emit initial timer
  io.to(room.code).emit("timer-update", timeLeft);

  room.roundTimer = setInterval(() => {
    timeLeft--;
    io.to(room.code).emit("timer-update", timeLeft);

    if (timeLeft <= 0) {
      clearInterval(room.roundTimer!);
      endRound(room);
    }
  }, 1000);
}

function endRound(room: GameRoom) {
  if (room.roundTimer) {
    clearInterval(room.roundTimer);
  }

  // Move to next round
  room.currentRound++;

  // Reset player states
  room.players.forEach((playerId) => {
    const player = connectedPlayers.get(playerId);
    if (player) {
      player.hasGuessed = false;
      player.isDrawing = false;
    }
  });

  if (room.currentRound <= room.maxRounds) {
    // Start next round
    room.currentDrawer = getNextDrawer(room);
    room.wordOptions = getRandomWords(DEFAULT_WORDS, 3);
    room.currentWord = undefined;

    // Update drawer status
    if (room.currentDrawer) {
      const drawer = connectedPlayers.get(room.currentDrawer);
      if (drawer) {
        drawer.isDrawing = true;
      }
    }

    // Emit round change
    io.to(room.code).emit("turn-changed", room.currentDrawer || "");
    io.to(room.code).emit("room-updated", {
      players: Array.from(room.players)
        .map((id) => connectedPlayers.get(id))
        .filter(Boolean),
      currentRound: room.currentRound,
      currentDrawer: room.currentDrawer,
    });

    // Send word options to drawer
    if (room.currentDrawer) {
      const drawerSocket = io.sockets.sockets.get(
        connectedPlayers.get(room.currentDrawer)?.socketId || ""
      );
      if (drawerSocket) {
        drawerSocket.emit("word-options", room.wordOptions);
      }
    }
  } else {
    // Game ended
    endGame(room);
  }
}

function endGame(room: GameRoom) {
  if (room.roundTimer) {
    clearInterval(room.roundTimer);
  }

  room.status = "finished";

  // Calculate final scores
  const finalScores: Record<string, number> = {};
  room.players.forEach((playerId) => {
    const player = connectedPlayers.get(playerId);
    if (player) {
      finalScores[player.username] = player.score;
    }
  });

  // Emit game end
  io.to(room.code).emit("game-ended", finalScores);

  // Update room in database
  getRoomFromDB(room.code).then((dbRoom) => {
    if (dbRoom) {
      updateRoomInDB(dbRoom.id, {
        status: "finished",
        currentRound: room.currentRound,
        currentDrawer: null,
        currentWord: null,
      });
    }
  });
}

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle room joining
  socket.on("join-room", async ({ roomCode, username }) => {
    try {
      const room = await getRoomFromDB(roomCode);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      // Check if player already exists
      const existingPlayer = room.players.find((p) => p.username === username);
      let player: Player;

      if (existingPlayer) {
        // Update existing player
        player = {
          id: existingPlayer.id,
          username: existingPlayer.username,
          socketId: socket.id,
          roomCode: roomCode.toUpperCase(),
          score: existingPlayer.score,
          isReady: existingPlayer.isReady,
          isDrawing: existingPlayer.isDrawing,
          hasGuessed: existingPlayer.hasGuessed,
        };

        // Update in database
        await updatePlayerInDB(existingPlayer.id, { socketId: socket.id });
      } else {
        // This shouldn't happen as players are created via API
        socket.emit("error", "Player not found in room");
        return;
      }

      // Join socket room
      socket.join(roomCode);

      // Store player connection
      connectedPlayers.set(player.id, player);

      // Get or create active room
      let activeRoom = activeRooms.get(roomCode);
      if (!activeRoom) {
        activeRoom = {
          id: room.id,
          code: roomCode.toUpperCase(),
          players: new Set(),
          status: room.status as "waiting" | "playing" | "finished",
          currentRound: room.currentRound,
          maxRounds: room.maxRounds,
          roundTime: room.roundTime,
          currentDrawer: room.currentDrawer || undefined,
          currentWord: room.currentWord || undefined,
          wordOptions: room.wordOptions,
        };
        activeRooms.set(roomCode, activeRoom);
      }

      // Add player to active room
      activeRoom.players.add(player.id);

      // Emit player joined event
      socket.to(roomCode).emit("player-joined", player);

      // Send room state to all players
      const roomPlayers = Array.from(activeRoom.players)
        .map((id) => connectedPlayers.get(id))
        .filter(Boolean);

      io.to(roomCode).emit("room-updated", {
        players: roomPlayers,
        currentRound: activeRoom.currentRound,
        currentDrawer: activeRoom.currentDrawer,
        status: activeRoom.status,
      });

      console.log(`Player ${username} joined room ${roomCode}`);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", "Failed to join room");
    }
  });

  // Handle leaving room
  socket.on("leave-room", (roomCode) => {
    socket.leave(roomCode);

    // Find and remove player
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    if (player) {
      connectedPlayers.delete(player.id);

      const activeRoom = activeRooms.get(roomCode);
      if (activeRoom) {
        activeRoom.players.delete(player.id);

        // Emit player left event
        socket.to(roomCode).emit("player-left", player.id);

        // If drawer left, end round
        if (activeRoom.currentDrawer === player.id) {
          endRound(activeRoom);
        }

        // If no players left, clean up room
        if (activeRoom.players.size === 0) {
          activeRooms.delete(roomCode);
        }
      }
    }
  });

  // Handle drawing
  socket.on("draw", ({ roomCode, path }) => {
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    if (player && player.isDrawing) {
      socket.to(roomCode).emit("draw", path);
    }
  });

  // Handle canvas clearing
  socket.on("clear-canvas", (roomCode) => {
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    if (player && player.isDrawing) {
      socket.to(roomCode).emit("clear-canvas");
    }
  });

  // Handle chat messages
  socket.on("message", ({ roomCode, content }) => {
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    if (player) {
      const message = {
        id: Date.now().toString(),
        roomId: roomCode,
        playerId: player.id,
        username: player.username,
        content,
        type: "chat" as const,
        createdAt: new Date(),
      };

      io.to(roomCode).emit("message", message);
    }
  });

  // Handle game start
  socket.on("start-game", async (roomCode) => {
    try {
      const activeRoom = activeRooms.get(roomCode);
      if (!activeRoom) return;

      if (activeRoom.players.size < 2) {
        socket.emit("error", "Need at least 2 players to start");
        return;
      }

      // Start game
      activeRoom.status = "playing";
      activeRoom.currentRound = 1;
      activeRoom.currentDrawer = getNextDrawer(activeRoom);
      activeRoom.wordOptions = getRandomWords(DEFAULT_WORDS, 3);

      // Set drawer status
      if (activeRoom.currentDrawer) {
        const drawer = connectedPlayers.get(activeRoom.currentDrawer);
        if (drawer) {
          drawer.isDrawing = true;
        }
      }

      // Update database
      const room = await getRoomFromDB(roomCode);
      if (room) {
        await updateRoomInDB(room.id, {
          status: "playing",
          currentRound: 1,
          currentDrawer: activeRoom.currentDrawer,
        });
      }

      // Emit game started
      io.to(roomCode).emit("game-started");
      io.to(roomCode).emit("turn-changed", activeRoom.currentDrawer || "");

      // Send word options to drawer
      if (activeRoom.currentDrawer) {
        const drawerSocket = io.sockets.sockets.get(
          connectedPlayers.get(activeRoom.currentDrawer)?.socketId || ""
        );
        if (drawerSocket) {
          drawerSocket.emit("word-options", activeRoom.wordOptions);
        }
      }

      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", "Failed to start game");
    }
  });

  // Handle word selection
  socket.on("select-word", ({ roomCode, word }) => {
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    const activeRoom = activeRooms.get(roomCode);
    if (!activeRoom || !player || !player.isDrawing) return;

    activeRoom.currentWord = word;

    // Emit word selected (without revealing the word to guessers)
    socket.to(roomCode).emit("word-selected", "");
    socket.emit("word-selected", word);

    // Start round timer
    startRoundTimer(activeRoom);
  });

  // Handle guesses
  socket.on("guess", ({ roomCode, guess }) => {
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    const activeRoom = activeRooms.get(roomCode);
    if (!activeRoom || !player || player.isDrawing || player.hasGuessed) return;

    const message = {
      id: Date.now().toString(),
      roomId: roomCode,
      playerId: player.id,
      username: player.username,
      content: guess,
      type: "guess" as ChatMessage["type"],
      createdAt: new Date(),
    };

    // Check if guess is correct
    if (
      activeRoom.currentWord &&
      guess.toLowerCase().trim() === activeRoom.currentWord.toLowerCase()
    ) {
      player.hasGuessed = true;
      player.score += 100; // Base score for correct guess

      message.type = "correct";

      // Emit correct guess
      io.to(roomCode).emit("correct-guess", player.id, activeRoom.currentWord);
      io.to(roomCode).emit("message", message);

      // Check if all players have guessed
      const allGuessed = Array.from(activeRoom.players)
        .filter((id) => id !== activeRoom.currentDrawer)
        .every((id) => connectedPlayers.get(id)?.hasGuessed);

      if (allGuessed) {
        endRound(activeRoom);
      }
    } else {
      // Regular guess message
      io.to(roomCode).emit("message", message);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Find player and remove from active connections
    const player = Array.from(connectedPlayers.values()).find(
      (p) => p.socketId === socket.id
    );

    if (player) {
      connectedPlayers.delete(player.id);

      // Find room and remove player
      const activeRoom = activeRooms.get(player.roomCode);
      if (activeRoom) {
        activeRoom.players.delete(player.id);

        // Emit player left
        socket.to(player.roomCode).emit("player-left", player.id);

        // If drawer left, end round
        if (activeRoom.currentDrawer === player.id) {
          endRound(activeRoom);
        }

        // Clean up empty room
        if (activeRoom.players.size === 0) {
          activeRooms.delete(player.roomCode);
        }
      }
    }
  });
});

// Start server
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down Socket.IO server...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down Socket.IO server...");
  await prisma.$disconnect();
  process.exit(0);
});
