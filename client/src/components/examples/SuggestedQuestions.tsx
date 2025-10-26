import { SuggestedQuestions } from '../SuggestedQuestions';

export default function SuggestedQuestionsExample() {
  const questions = [
    "What is Warning Shots about?",
    "Tell me about the wordplay in your latest track",
    "What themes appear across your albums?",
    "Explain the metaphor in verse 2"
  ];

  const handleQuestionClick = (question: string) => {
    console.log('Question clicked:', question);
  };

  return (
    <div className="p-6 bg-background max-w-4xl">
      <SuggestedQuestions 
        questions={questions} 
        onQuestionClick={handleQuestionClick}
      />
    </div>
  );
}
