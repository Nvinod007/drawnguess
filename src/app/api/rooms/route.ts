import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRoomCode } from "@/lib/utils";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        players: true,
        _count: {
          select: { players: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, maxPlayers = 8, maxRounds = 3, roundTime = 80 } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Generate unique room code
    let code = generateRoomCode();
    let existingRoom = await prisma.room.findUnique({ where: { code } });

    // Ensure code is unique
    while (existingRoom) {
      code = generateRoomCode();
      existingRoom = await prisma.room.findUnique({ where: { code } });
    }

    const room = await prisma.room.create({
      data: {
        code,
        name,
        maxPlayers,
        maxRounds,
        roundTime,
      },
      include: {
        players: true,
      },
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
