import { Server } from "socket.io";
import { DEFAULT_WORDS, getRandomWords } from "../lib/utils";
import { updateRoomInDB } from "./database";
import { GameRoom, connectedPlayers } from "./types";

export function getNextDrawer(room: GameRoom): string | undefined {
  const players = Array.from(room.players);
  if (players.length === 0) return undefined;

  const currentIndex = room.currentDrawer
    ? players.indexOf(room.currentDrawer)
    : -1;
  const nextIndex = (currentIndex + 1) % players.length;
  return players[nextIndex];
}

export function startRoundTimer(room: GameRoom, io: Server) {
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
      endRound(room, io);
    }
  }, 1000);
}

export function endRound(room: GameRoom, io: Server) {
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
    endGame(room, io);
  }
}

export function endGame(room: GameRoom, io: Server) {
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
  updateRoomInDB(room.id, {
    status: "finished",
    currentRound: room.currentRound,
    currentDrawer: null,
    currentWord: null,
  });
}
