import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/rooms/[code]/join - Join room as player
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await request.json();
    const { username } = body;

    if (!code || !username) {
      return NextResponse.json(
        { error: "Room code and username are required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      return NextResponse.json(
        { error: "Username must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Find the room
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    // FIXED: Better duplicate username detection
    const existingPlayer = room.players.find(
      (player) =>
        player.username.toLowerCase().trim() === trimmedUsername.toLowerCase()
    );

    if (existingPlayer) {
      // If the same username already exists, return the existing player instead of error
      console.log(`Username ${trimmedUsername} already exists in room ${code}`);

      // Get updated room with all players
      const updatedRoom = await prisma.room.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          players: {
            orderBy: { joinedAt: "asc" },
          },
        },
      });

      return NextResponse.json({
        success: true,
        player: existingPlayer,
        room: updatedRoom,
        message: "Already in room",
      });
    }

    // Add player to room
    const player = await prisma.player.create({
      data: {
        username: trimmedUsername,
        roomId: room.id,
      },
    });

    console.log(`Added player ${trimmedUsername} to room ${code}`);

    // Get updated room with all players
    const updatedRoom = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: {
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      player,
      room: updatedRoom,
      message: "Joined room successfully",
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
