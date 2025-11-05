import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FlashCard } from "@/api/vocabularyApi";
import { cn } from "@/lib/utils";

interface UnscrambleExerciseProps {
  cards: FlashCard[];
  onComplete: (wordId: string) => void;
}

export default function UnscrambleExercise({ cards, onComplete }: UnscrambleExerciseProps) {
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  useEffect(() => {
    if (shuffledCards.length === 0) return;
    const currentCard = shuffledCards[currentIndex];
    if (!currentCard) return;

    // Scramble letters
    const letters = currentCard.term.split("");
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(scrambled);
    setUserAnswer([]);
    setIsChecked(false);
    setIsCorrect(null);
  }, [currentIndex, shuffledCards]);

  const currentCard = shuffledCards[currentIndex];

  const handleLetterClick = (letter: string, index: number) => {
    setUserAnswer([...userAnswer, letter]);
    setScrambledLetters(scrambledLetters.filter((_, i) => i !== index));
  };

  const handleRemoveLetter = (index: number) => {
    const letter = userAnswer[index];
    setUserAnswer(userAnswer.filter((_, i) => i !== index));
    setScrambledLetters([...scrambledLetters, letter]);
  };

  const handleCheck = () => {
    const userWord = userAnswer.join("").toLowerCase();
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

  const handleReset = () => {
    const letters = currentCard.term.split("");
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    setScrambledLetters(scrambled);
    setUserAnswer([]);
    setIsChecked(false);
    setIsCorrect(null);
  };

  const handleShowAnswer = () => {
    setUserAnswer(currentCard.term.split(""));
    setScrambledLetters([]);
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
      <div className="text-center py-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">SỰ LẮP RÁP</h3>
        <p className="text-sm text-gray-600 italic mb-4">Dịch nghĩa</p>
        <p className="text-3xl font-bold text-gray-800">{currentCard.mainMeaning}</p>
      </div>

      {/* Scrambled Letters */}
      <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2 min-h-[60px] bg-gray-50 p-4 rounded-lg">
          {scrambledLetters.map((letter, idx) => (
            <Button
              key={idx}
              onClick={() => handleLetterClick(letter, idx)}
              variant="outline"
              className="w-12 h-12 text-xl font-bold bg-white hover:bg-blue-100"
              disabled={isChecked}
            >
              {letter}
            </Button>
          ))}
        </div>

        {/* User Answer Area */}
        <div className="border-b-4 border-gray-300 pb-2">
          <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
            {userAnswer.map((letter, idx) => (
              <Button
                key={idx}
                onClick={() => !isChecked && handleRemoveLetter(idx)}
                variant="outline"
                className={cn(
                  "w-12 h-12 text-xl font-bold",
                  isChecked
                    ? isCorrect
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "bg-red-100 border-red-500 text-red-700"
                    : "bg-blue-100 hover:bg-blue-200"
                )}
                disabled={isChecked}
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={handleReset} disabled={isChecked}>
          Đổi
        </Button>
        <Button onClick={handleCheck} disabled={userAnswer.length === 0 || isChecked}>
          Kiểm tra
        </Button>
        <Button variant="outline" onClick={handleShowAnswer} disabled={isChecked}>
          Kết quả
        </Button>
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
            : `✗ Sai rồi! Đáp án đúng là: ${currentCard.term}`}
        </div>
      )}
    </div>
  );
}
