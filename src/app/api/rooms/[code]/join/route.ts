import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { username } = body;

    if (!code || !username) {
      return NextResponse.json(
        { error: "Room code and username are required" },
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

    // Check if player already exists in this room
    const existingPlayer = room.players.find(
      (player) => player.username.toLowerCase() === username.toLowerCase()
    );

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Username already taken in this room" },
        { status: 400 }
      );
    }

    // Add player to room
    const player = await prisma.player.create({
      data: {
        username: username.trim(),
        roomId: room.id,
      },
    });

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
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
