import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  code: string;
}

interface PlayerWithId {
  id: string;
  username: string;
  joinedAt: Date;
}

interface PlayerGroupAccumulator {
  [username: string]: PlayerWithId[];
}

interface PlayerForGrouping {
  id: string;
  username: string;
  joinedAt: Date;
}

export async function POST(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const { code } = params;

    // Find the room
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: {
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const playerGroups = room.players.reduce(
      (acc: PlayerGroupAccumulator, player: PlayerForGrouping) => {
        const key: string = player.username.toLowerCase().trim();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(player);
        return acc;
      },
      {} as PlayerGroupAccumulator
    );

    let removedCount = 0;
    for (const [, players] of Object.entries(playerGroups)) {
      if ((players as PlayerWithId[]).length > 1) {
        // Keep the first player (oldest), remove the rest
        const playersToRemove = (players as PlayerWithId[]).slice(1);

        for (const player of playersToRemove) {
          await prisma.player.delete({
            where: { id: player.id },
          });
          removedCount++;
          console.log(
            `Removed duplicate player: ${player.username} (${player.id})`
          );
        }
      }
    }

    // Get updated room
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
      message: `Removed ${removedCount} duplicate players`,
      removedCount,
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Error cleaning up room:", error);
    return NextResponse.json(
      { error: "Failed to cleanup room" },
      { status: 500 }
    );
  }
}
