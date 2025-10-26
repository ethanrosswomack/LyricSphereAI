import { ChatInput } from '../ChatInput';

export default function ChatInputExample() {
  const handleSend = (message: string) => {
    console.log('Message sent:', message);
  };

  return (
    <div className="p-6 bg-background max-w-4xl">
      <ChatInput onSend={handleSend} />
    </div>
  );
}
