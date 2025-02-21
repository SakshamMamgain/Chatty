
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function MessageList() {
  const { messages } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollRef} className="h-[calc(100vh-140px)]">
      <div className="p-4 space-y-4">
        {messages.map((message, i) => {
          const isCurrentUser = message.userId === user?.id;
          const content = message.content || '';

          return (
            <div
              key={i}
              className={cn("flex gap-2", isCurrentUser && "flex-row-reverse")}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {message.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex flex-col",
                  isCurrentUser && "items-end"
                )}
              >
                <span className="text-sm text-muted-foreground">
                  {message.username}
                </span>
                <div
                  className={cn(
                    "px-4 py-2 rounded-lg max-w-[80%]",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content || ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
