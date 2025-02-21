import { useState } from "react";
import CreateRoom from "@/components/create-room";
import RoomList from "@/components/room-list";
import ChatRoom from "@/components/chat-room";
import { Room } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const [activeRoom, setActiveRoom] = useState<{ room: Room; password: string } | null>(
    null,
  );
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const handleJoinRoom = (room: Room, password: string) => {
    if (password !== room.password) {
      toast({
        title: "Incorrect password",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }
    setActiveRoom({ room, password });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">SecureChat</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user.username}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {activeRoom ? (
        <ChatRoom
          room={activeRoom.room}
          user={user}
          password={activeRoom.password}
          onLeave={() => setActiveRoom(null)}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end">
            <CreateRoom />
          </div>
          <RoomList onJoinRoom={handleJoinRoom} />
        </div>
      )}
    </div>
  );
}
