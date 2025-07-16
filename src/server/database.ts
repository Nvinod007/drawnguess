import { Prisma, PrismaClient } from "../generated/prisma/client";

// Initialize Prisma client
export const prisma = new PrismaClient();

export async function getRoomFromDB(code: string) {
  return await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      players: {
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

export async function updatePlayerInDB(
  playerId: string,
  updates: Prisma.PlayerUpdateInput
) {
  return await prisma.player.update({
    where: { id: playerId },
    data: updates,
  });
}

export async function updateRoomInDB(
  roomId: string,
  updates: Prisma.RoomUpdateInput
) {
  return await prisma.room.update({
    where: { id: roomId },
    data: updates,
  });
}

// Graceful shutdown
export async function disconnectDB() {
  await prisma.$disconnect();
}
