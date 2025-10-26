import { ChatMessage } from '../ChatMessage';

export default function ChatMessageExample() {
  const userMessage = {
    id: '1',
    role: 'user' as const,
    content: 'What is Warning Shots about?',
    timestamp: new Date(),
  };

  const assistantMessage = {
    id: '2',
    role: 'assistant' as const,
    content: '"Warning Shots" explores themes of resilience and determination. The track serves as an announcement of arrival, with powerful wordplay and metaphors throughout the verses. [1][2]',
    timestamp: new Date(),
    citations: [
      {
        key: 'warning_shots.md',
        title: 'Warning Shots — Lyrics',
        url: 'https://s3.omniversalaether.app/src/data/HAWK-ARS-00/01_singles/warning_shots.md',
      },
      {
        key: 'commentary_warning_shots.md',
        title: 'Warning Shots Commentary',
        url: 'https://s3.omniversalaether.app/commentary/warning_shots.md',
      },
    ],
  };

  return (
    <div className="space-y-6 p-6 bg-background">
      <ChatMessage message={userMessage} />
      <ChatMessage message={assistantMessage} />
    </div>
  );
}
