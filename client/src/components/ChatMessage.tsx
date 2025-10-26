import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music2, ExternalLink, Copy, Check } from "lucide-react";
import { Message } from "@shared/schema";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      data-testid={`message-${message.role}`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
        }`}
        data-testid={`avatar-${message.role}`}
      >
        {isUser ? (
          <span className="text-sm font-semibold">You</span>
        ) : (
          <Music2 className="w-5 h-5" />
        )}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <Card
          className={`p-4 ${
            isUser
              ? 'bg-primary text-primary-foreground border-primary-border'
              : 'bg-card border-card-border'
          }`}
          data-testid={`card-message-${message.id}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-base leading-relaxed whitespace-pre-wrap flex-1">
              {message.content}
            </p>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="flex-shrink-0 h-6 w-6 hover-elevate"
              data-testid={`button-copy-${message.id}`}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>

          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
              <p className="text-xs font-medium opacity-70">Sources:</p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="hover-elevate"
                    data-testid={`citation-${message.id}-${idx}`}
                  >
                    <a
                      href={citation.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <span>[{idx + 1}] {citation.title}</span>
                      {citation.url && <ExternalLink className="h-3 w-3" />}
                    </a>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <p className="text-xs text-muted-foreground mt-1 px-1" data-testid={`time-${message.id}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
