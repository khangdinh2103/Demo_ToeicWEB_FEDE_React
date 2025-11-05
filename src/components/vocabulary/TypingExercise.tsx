import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { FlashCard } from "@/api/vocabularyApi";
import { cn } from "@/lib/utils";

interface TypingExerciseProps {
  cards: FlashCard[];
  onComplete: (wordId: string) => void;
}

export default function TypingExercise({ cards, onComplete }: TypingExerciseProps) {
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  useEffect(() => {
    setUserInput("");
    setIsChecked(false);
    setIsCorrect(null);
  }, [currentIndex]);

  const currentCard = shuffledCards[currentIndex];

  const handleCheck = () => {
    const userWord = userInput.trim().toLowerCase();
    const correctWord = currentCard.term.toLowerCase();
    const correct = userWord === correctWord;

    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      onComplete(currentCard._id);

      setTimeout(() => {
        if (currentIndex < shuffledCards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }, 2000);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleShowAnswer = () => {
    setUserInput(currentCard.term);
    setIsChecked(true);
    setIsCorrect(false);
  };

  if (!currentCard) return <div>Loading...</div>;

  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tiến độ</span>
          <span>
            {score} / {currentIndex + 1}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="text-center py-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Điền vào để tạo thành từ:
        </h3>
        <p className="text-3xl font-bold text-gray-800 mt-6">
          Nghĩa: {currentCard.mainMeaning}
        </p>
      </div>

      {/* Input Area */}
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex gap-2">
          {currentCard.term.split("").map((_, idx) => (
            <div
              key={idx}
              className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-gray-400">_</span>
            </div>
          ))}
        </div>

        <Input
          type="text"
          value={userInput}
          onChange={(e) => !isChecked && setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isChecked && userInput && handleCheck()}
          placeholder="Gõ từ vào đây..."
          className={cn(
            "text-center text-2xl h-16 font-bold",
            isChecked
              ? isCorrect
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-red-500 bg-red-50 text-red-700"
              : ""
          )}
          disabled={isChecked}
          autoFocus
        />
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={handleShowAnswer} disabled={isChecked}>
          Kiểm tra
        </Button>
        <Button onClick={handleCheck} disabled={!userInput.trim() || isChecked}>
          Kết quả
        </Button>
        {isChecked && !isCorrect && (
          <Button onClick={handleNext}>Đổi</Button>
        )}
      </div>

      {/* Feedback */}
      {isChecked && (
        <div
          className={cn(
            "text-center py-4 rounded-lg font-semibold text-lg",
            isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}
        >
          {isCorrect
            ? "✓ Chính xác!"
            : (
              <div>
                <p>✗ Bạn gõ sai.</p>
                <p className="mt-2">
                  Đáp án đúng là: <span className="font-bold text-xl">{currentCard.term}</span>
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
