import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatInterface from "./ChatInterface";

interface ChatWidgetProps {
  workerEndpoint: string;
}

export default function ChatWidget({ workerEndpoint }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-opacity z-50 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window */}
          <div className="relative w-full max-w-md h-[600px] bg-background rounded-lg shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Chat Interface */}
            <div className="h-full">
              <ChatInterface workerEndpoint={workerEndpoint} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
