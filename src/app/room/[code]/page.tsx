import { GameRoomPage } from "@/features/game-room";

interface PageProps {
  params: {
    code: string;
  };
}

export default function RoomPage({ params }: PageProps) {
  return <GameRoomPage roomCode={params.code} />;
}
