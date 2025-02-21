import { useQuery } from "@tanstack/react-query";
import { Room } from "@shared/schema";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoomList({ onJoinRoom }: { onJoinRoom: (room: Room, password: string) => void }) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const handleJoin = () => {
    if (selectedRoom) {
      onJoinRoom(selectedRoom, password);
      setSelectedRoom(null);
      setPassword("");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Rooms</h2>
      <div className="grid gap-4">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent"
            onClick={() => setSelectedRoom(room)}
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>{room.name}</span>
            </div>
            <Button size="sm" variant="secondary">
              Join
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join {selectedRoom?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter room password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" onClick={handleJoin}>
              Join Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
