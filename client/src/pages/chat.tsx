import { useState } from "react";
import { ChatContainer } from "@/components/ChatContainer";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { WelcomeHero } from "@/components/WelcomeHero";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Message } from "@shared/schema";
import { Music2 } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "What is Warning Shots about?",
  "Tell me about the wordplay in your tracks",
  "What themes appear across your albums?",
  "Explain the meaning behind your lyrics",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome! Ask me anything about the music, lyrics, meanings, or backstories. I can help you explore the catalog and discover deeper insights.',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: Replace with actual Cloudflare Worker endpoint
      const workerEndpoint = '/api/chat';
      
      const response = await fetch(workerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || data.error || 'Sorry, I could not process your request.',
        timestamp: new Date(),
        citations: data.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error connecting to the service. Please make sure your Cloudflare Worker endpoint is configured.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const showWelcome = messages.length === 1;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Music2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold" data-testid="text-app-title">
            Hawk Eye
          </h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto">
        {showWelcome && (
          <div className="flex-shrink-0">
            <WelcomeHero />
          </div>
        )}

        <ChatContainer messages={messages} isLoading={isLoading} />

        <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur p-4 space-y-4">
          {showWelcome && (
            <SuggestedQuestions
              questions={SUGGESTED_QUESTIONS}
              onQuestionClick={handleQuestionClick}
            />
          )}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
