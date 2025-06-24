import { prisma } from "@/lib/prisma";
import { generateRoomCode } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface CreateRoomBody {
  name: string;
  maxPlayers?: number;
  maxRounds?: number;
  roundTime?: number;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

// GET /api/rooms - Get all rooms
export async function GET(): Promise<NextResponse> {
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
      { error: "Failed to fetch rooms" } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create new room
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateRoomBody = await request.json();
    const { name, maxPlayers = 8, maxRounds = 3, roundTime = 80 } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Room name is required" } as ApiResponse,
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
        name: name.trim(),
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
      { error: "Failed to create room" } as ApiResponse,
      { status: 500 }
    );
  }
}
