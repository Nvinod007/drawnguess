"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Divider, Spacer } from "@heroui/react";

import { UserNameInput } from "./UserNameInput";
import { CreateRoomForm } from "./CreateRoomForm";
import { JoinRoomForm } from "./JoinRoomForm";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useJoinRoom } from "../hooks/useJoinRoom";
import { ErrorAlert } from "@/shared/components/ErrorAlert";

export function HomePage() {
  const [username, setUsername] = useState("");

  const {
    createRoom,
    isLoading: isCreating,
    error: createError,
  } = useCreateRoom();
  const { joinRoom, isLoading: isJoining, error: joinError } = useJoinRoom();

  const handleCreateRoom = (roomName: string) => {
    createRoom(username, roomName);
  };

  const handleJoinRoom = (roomCode: string) => {
    joinRoom(username, roomCode);
  };

  const clearErrors = () => {
    // Errors will be cleared automatically when new actions are triggered
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex-col">
        <Card className="shadow-2xl ">
          <CardHeader className="text-center pb-2">
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl">🎨</span>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Drawnguess
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Draw and guess with friends!
              </p>
            </div>
          </CardHeader>

          <CardBody className="space-y-6">
            {/* Error Display */}
            {(createError || joinError) && (
              <ErrorAlert
                message={createError || joinError || ""}
                onDismiss={clearErrors}
              />
            )}

            {/* Username Input */}
            <UserNameInput value={username} onChange={setUsername} />

            {/* Create Room Form */}
            <CreateRoomForm
              username={username}
              onSubmit={handleCreateRoom}
              isLoading={isCreating}
            />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <Divider className="flex-1" />
              <span className="text-small text-default-400">OR</span>
              <Divider className="flex-1" />
            </div>

            {/* Join Room Form */}
            <JoinRoomForm
              username={username}
              onSubmit={handleJoinRoom}
              isLoading={isJoining}
            />

            <Spacer y={2} />

            {/* Game Instructions */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <CardBody className="text-center p-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p>🎯 Guess what others are drawing</p>
                  <p>🎨 Draw when it&#39;s your turn</p>
                  <p>🏆 Score points for correct guesses</p>
                </div>
              </CardBody>
            </Card>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
