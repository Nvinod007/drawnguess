export interface CreateRoomRequest {
  name: string;
  maxPlayers?: number;
  maxRounds?: number;
  roundTime?: number;
}

export interface CreateRoomResponse {
  room: {
    id: string;
    code: string;
    name: string;
    maxPlayers: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface JoinRoomResponse {
  room: {
    id: string;
    code: string;
    name: string;
    maxPlayers: number;
    status: string;
    players: Array<{
      id: string;
      username: string;
      score: number;
      isReady: boolean;
    }>;
  };
}

export interface HomePageState {
  username: string;
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  error: string | null;
}
