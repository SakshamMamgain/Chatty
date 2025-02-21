import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./use-auth";
import { Message, Room } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import { encryptMessage, decryptMessage } from "@/lib/chat-encryption";

type ChatContextType = {
  currentRoom: Room | null;
  messages: Message[];
  sendMessage: (content: string) => void;
  createRoom: (name: string, password: string) => Promise<void>;
  joinRoom: (roomId: string, password: string) => Promise<void>;
  leaveRoom: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomPassword, setRoomPassword] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "message") {
        const decryptedMessage = {
          ...message.data,
          content: decryptMessage(message.data.content, roomPassword)
        };
        setMessages(prev => [...prev, decryptedMessage]);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [user]);

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
    enabled: !!user
  });

  const createRoomMutation = useMutation({
    mutationFn: async ({ name, password }: { name: string; password: string }) => {
      const res = await apiRequest("POST", "/api/rooms", { name, password });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const joinRoomMutation = useMutation({
    mutationFn: async ({ roomId, password }: { roomId: string; password: string }) => {
      const res = await apiRequest("POST", "/api/rooms/join", { roomId, password });
      return await res.json();
    },
    onSuccess: (room) => {
      setCurrentRoom(room);
      setRoomPassword(room.password);
      socket?.send(JSON.stringify({
        type: "join",
        username: user?.username,
        roomId: room.id
      }));
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join room",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const sendMessage = (content: string) => {
    if (!socket || !currentRoom) return;

    const encryptedContent = encryptMessage(content, roomPassword);
    socket.send(JSON.stringify({
      type: "message",
      data: {
        content: encryptedContent,
        roomId: currentRoom.id,
        userId: user?.id,
        username: user?.username,
        encrypted: true
      }
    }));
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setMessages([]);
    setRoomPassword("");
  };

  return (
    <ChatContext.Provider
      value={{
        currentRoom,
        messages,
        sendMessage,
        createRoom: async (name, password) => {
          await createRoomMutation.mutateAsync({ name, password });
        },
        joinRoom: async (roomId, password) => {
          await joinRoomMutation.mutateAsync({ roomId, password });
        },
        leaveRoom
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
