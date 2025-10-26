import { ChatContainer } from '../ChatContainer';

export default function ChatContainerExample() {
  const messages = [
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Welcome! Ask me anything about Hawk Eye\'s music, lyrics, or commentary.',
      timestamp: new Date(Date.now() - 60000),
    },
    {
      id: '2',
      role: 'user' as const,
      content: 'What themes are explored in your music?',
      timestamp: new Date(Date.now() - 30000),
    },
    {
      id: '3',
      role: 'assistant' as const,
      content: 'The music explores themes of resilience, determination, personal growth, and social commentary. Each track combines powerful wordplay with deep meaning. [1]',
      timestamp: new Date(),
      citations: [
        {
          key: 'overview.md',
          title: 'Music Overview',
          url: 'https://example.com/overview',
        },
      ],
    },
  ];

  return (
    <div className="h-96 bg-background border border-border rounded-lg overflow-hidden flex flex-col">
      <ChatContainer messages={messages} isLoading={false} />
    </div>
  );
}
