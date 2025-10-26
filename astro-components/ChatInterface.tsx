import { useState, useEffect, useRef } from "react";
import { Music2, Send, Copy, Check, ExternalLink, Moon, Sun, Loader2, MessageCircle } from "lucide-react";

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

interface Citation {
  key: string;
  title: string;
  url?: string;
  score?: number;
}

interface ChatInterfaceProps {
  workerEndpoint: string;
  suggestedQuestions?: string[];
}

// Main Component
export default function ChatInterface({ 
  workerEndpoint,
  suggestedQuestions = [
    "What is Warning Shots about?",
    "Tell me about the wordplay in your tracks",
    "What themes appear across your albums?",
    "Explain the meaning behind your lyrics",
  ]
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome! Ask me anything about the music, lyrics, meanings, or backstories. I can help you explore the catalog and discover deeper insights.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");

    try {
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
        content: 'Sorry, there was an error connecting to the service.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed && !isLoading) {
      handleSendMessage(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const showWelcome = messages.length === 1;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Music2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Hawk Eye</h1>
        </div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-4xl w-full mx-auto">
        {/* Welcome Hero */}
        {showWelcome && (
          <div className="text-center py-8 px-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Music2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Hawk Eye
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore music through conversation. Ask about lyrics, meanings, backstories, or discover songs.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur p-4 space-y-4">
          {showWelcome && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Try asking:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about lyrics, meanings, or themes..."
              disabled={isLoading}
              className="resize-none min-h-12 max-h-32 flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// ChatMessage Component
function ChatMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
        }`}
      >
        {isUser ? 'You' : <Music2 className="w-5 h-5" />}
      </div>

      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`p-4 rounded-lg ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-card-border'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-base leading-relaxed whitespace-pre-wrap flex-1">
              {message.content}
            </p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
              <p className="text-xs font-medium opacity-70">Sources:</p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation, idx) => (
                  <a
                    key={idx}
                    href={citation.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <span>[{idx + 1}] {citation.title}</span>
                    {citation.url && <ExternalLink className="h-3 w-3" />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
