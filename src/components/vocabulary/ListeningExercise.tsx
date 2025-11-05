import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2 } from "lucide-react";
import type { FlashCard } from "@/api/vocabularyApi";
import { cn } from "@/lib/utils";

interface ListeningExerciseProps {
  cards: FlashCard[];
  onComplete: (wordId: string) => void;
}

export default function ListeningExercise({ cards, onComplete }: ListeningExerciseProps) {
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<FlashCard[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  useEffect(() => {
    if (shuffledCards.length === 0) return;

    const currentCard = shuffledCards[currentIndex];
    if (!currentCard) return;

    const others = shuffledCards.filter((c) => c._id !== currentCard._id);
    const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [currentCard, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(allOptions);

    // Auto play audio
    playAudio();
  }, [currentIndex, shuffledCards]);

  const currentCard = shuffledCards[currentIndex];

  const playAudio = () => {
    if (!currentCard) return;
    const audioUrl = currentCard.audioUS_url || currentCard.audioUK_url;
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionIndex);
    const selected = options[optionIndex];
    const correct = selected._id === currentCard._id;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      onComplete(currentCard._id);
    }

    // Auto play correct audio
    playAudio();

    setTimeout(() => {
      if (currentIndex < shuffledCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }, 2000);
  };

  if (!currentCard || options.length === 0) return <div>Loading...</div>;

  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;
  const correctIndex = options.findIndex((opt) => opt._id === currentCard._id);

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

      {/* Audio Player */}
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Nghe và chọn đáp án đúng</h3>
        <Button
          size="lg"
          onClick={playAudio}
          className="w-32 h-32 rounded-full bg-blue-500 hover:bg-blue-600"
        >
          <Volume2 className="h-16 w-16 text-white" />
        </Button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrectOption = idx === correctIndex;
          let buttonClass = "bg-white border-2 border-gray-300 hover:border-blue-400 text-gray-800";

          if (selectedAnswer !== null) {
            if (isSelected && isCorrect) {
              buttonClass = "bg-green-500 border-green-500 text-white";
            } else if (isSelected && !isCorrect) {
              buttonClass = "bg-red-500 border-red-500 text-white";
            } else if (isCorrectOption && !isCorrect) {
              buttonClass = "bg-green-500 border-green-500 text-white";
            }
          }

          return (
            <Button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selectedAnswer !== null}
              className={cn("h-20 text-lg font-medium transition-all", buttonClass)}
            >
              {option.mainMeaning}
            </Button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div
          className={cn(
            "text-center py-4 rounded-lg font-semibold text-lg",
            isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}
        >
          {isCorrect ? "✓ Chính xác!" : `✗ Sai rồi! Đáp án đúng là: ${currentCard.mainMeaning}`}
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}
