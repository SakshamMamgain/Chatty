import { useChat } from "@/hooks/use-chat";
import { useQuery } from "@tanstack/react-query";
import { Room } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users } from "lucide-react";
import CreateRoomDialog from "./create-room-dialog";
import JoinRoomDialog from "./join-room-dialog";

export default function RoomList() {
  const { currentRoom, leaveRoom } = useChat();
  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  return (
    <div className="flex flex-col h-[calc(100vh-69px)]">
      <div className="p-4 space-y-2">
        <CreateRoomDialog>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </CreateRoomDialog>
        <JoinRoomDialog>
          <Button variant="outline" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Join Room
          </Button>
        </JoinRoomDialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`p-4 rounded-lg ${
                currentRoom?.id === room.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted cursor-pointer"
              }`}
            >
              <div className="font-medium">{room.name}</div>
              <div className="text-sm opacity-80">
                {room.users.size} users online
              </div>
              {currentRoom?.id === room.id && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={leaveRoom}
                >
                  Leave Room
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
