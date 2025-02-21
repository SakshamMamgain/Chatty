
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Room, User } from "@shared/schema";
import { chatClient } from "@/lib/chat";
import SimpleCrypto from "simple-crypto-js";

interface Message {
  type: "message" | "join" | "leave";
  roomId: number;
  userId: number;
  username: string;
  content?: string;
  encrypted?: boolean;
}

export default function ChatRoom({
  room,
  user,
  password,
  onLeave,
}: {
  room: Room;
  user: User;
  password: string;
  onLeave: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const crypto = new SimpleCrypto(password);

  useEffect(() => {
    // Load previous messages
    const loadMessages = async () => {
      try {
        const { data: messages } = await fetch(`/api/rooms/${room.id}/messages`).then(res => res.json());
        if (messages) {
          const decryptedMessages = messages.map((msg: any) => ({
            ...msg,
            content: msg.encrypted ? crypto.decrypt(msg.content) : msg.content
          }));
          setMessages(decryptedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    loadMessages();
    
    const unsubscribe = chatClient.onMessage((message: any) => {
      if (message.roomId === room.id) {
        const messageObj = {
          type: message.type,
          roomId: message.roomId,
          userId: message.userId,
          username: message.username,
          content: message.content,
          encrypted: message.encrypted
        };
        
        if (messageObj.encrypted && messageObj.content) {
          try {
            messageObj.content = crypto.decrypt(messageObj.content) as string;
          } catch (error) {
            console.error("Failed to decrypt message:", error);
          }
        }
        setMessages((prev) => [...prev, messageObj]);
      }
    });

    chatClient.send({
      type: "join",
      roomId: room.id,
      userId: user.id,
      username: user.username,
    });

    return () => {
      unsubscribe();
      chatClient.send({
        type: "leave",
        roomId: room.id,
        userId: user.id,
        username: user.username,
      });
    };
  }, [room.id, user.id, user.username]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const encryptedContent = crypto.encrypt(input);
    chatClient.send({
      type: "message",
      roomId: room.id,
      userId: user.id,
      username: user.username,
      content: encryptedContent,
      encrypted: true,
    });
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">{room.name}</h2>
        <Button variant="outline" onClick={onLeave}>
          Leave Room
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => {
            if (msg.type === "join" || msg.type === "leave") {
              return (
                <div key={i} className="text-center text-sm text-muted-foreground">
                  {msg.username} has {msg.type === "join" ? "joined" : "left"} the room
                </div>
              );
            }
            return (
              <div
                key={i}
                className={`flex ${
                  msg.userId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.userId === user.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <div className="text-sm font-medium">{msg.username}</div>
                  <div>{msg.content}</div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </Card>
  );
}
