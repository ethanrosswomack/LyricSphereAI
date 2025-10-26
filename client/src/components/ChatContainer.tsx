import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatContainer({ messages, isLoading }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      data-testid="chat-container"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex gap-4" data-testid="loading-indicator">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 max-w-[85%]">
            <div className="bg-card border border-card-border rounded-lg p-4">
              <p className="text-muted-foreground">Thinking...</p>
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
}
