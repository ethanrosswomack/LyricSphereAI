import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
  questions: string[];
}

export function SuggestedQuestions({ onQuestionClick, questions }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-4" data-testid="suggested-questions">
      <div className="flex items-center gap-2 text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <p className="text-sm font-medium">Try asking:</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            className="hover-elevate text-left justify-start h-auto py-2 px-4"
            data-testid={`button-suggested-${idx}`}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
