import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, Circle } from "lucide-react";
import { vocabularyApi, normalizeId } from "@/api/vocabularyApi";
import type { VocabularySet, FlashCard } from "@/api/vocabularyApi";
import { vocabularyProgressApi } from "@/api/vocabularyProgressApi";
import { getMyCustomVocabularySetById } from "@/api/studentVocabularyApi";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// Import exercise components
import FlashCardExercise from "@/components/vocabulary/FlashCardExercise";
import MultipleChoiceExercise from "@/components/vocabulary/MultipleChoiceExercise";
import ListeningExercise from "@/components/vocabulary/ListeningExercise";
import UnscrambleExercise from "@/components/vocabulary/UnscrambleExercise";
import TypingExercise from "@/components/vocabulary/TypingExercise";

type ExerciseMode = "flashcard" | "multiple-choice" | "listening" | "unscramble" | "typing";
type SubExercise = "multiple-choice" | "listening" | "unscramble" | "typing";

const SUB_EXERCISES: { id: SubExercise; label: string; icon: string }[] = [
  { id: "multiple-choice", label: "Trắc nghiệm", icon: "📝" },
  { id: "listening", label: "Nghe từ", icon: "🎧" },
  { id: "unscramble", label: "Ghép từ", icon: "🧩" },
  { id: "typing", label: "Viết từ", icon: "⌨️" },
];

export default function VocabularyExercisePage() {
  console.log("🚀 VocabularyExercisePage component rendered!");
  
  const { setId: rawSetId } = useParams();
  const location = useLocation();
  const isCustomSet = location.pathname.includes("/my-vocabulary/");
  
  const setId = useMemo(() => {
    const normalized = normalizeId(rawSetId || "");
    console.log("🔑 rawSetId:", rawSetId, "→ normalized:", normalized, "isCustom:", isCustomSet);
    return normalized;
  }, [rawSetId, isCustomSet]);
  
  const navigate = useNavigate();

  // Không dùng location.state để tránh data cũ không đầy đủ
  const [activeSet, setActiveSet] = useState<VocabularySet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ExerciseMode>("flashcard");
  const [selectedWord, setSelectedWord] = useState<FlashCard | null>(null);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<any>(null);

  console.log("📊 Component state:", { setId, activeSet: !!activeSet, isLoading, error });

  // Load progress
  useEffect(() => {
    if (setId) {
      loadProgress();
    }
  }, [setId]);

  const loadProgress = async () => {
    try {
      const result = await vocabularyProgressApi.getProgress(setId);
      setProgress(result.data);
      // Set completed words from progress
      if (result.data?.learned_words) {
        const learnedIds = new Set<string>(result.data.learned_words.map((w: any) => w.word_id as string));
        setCompletedWords(learnedIds);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  useEffect(() => {
    console.log("⚡ useEffect triggered - setId:", setId, "activeSet:", !!activeSet);
    
    // Nếu activeSet đã có và có cards đầy đủ, skip fetch
    if (activeSet && activeSet.cards && activeSet.cards.length > 0) {
      console.log("✅ Using cached activeSet with", activeSet.cards.length, "cards");
      return;
    }
    
    if (!setId) {
      console.log("❌ No setId provided");
      setError("Thiếu setId");
      return;
    }

    console.log("🔄 Starting fetch for setId:", setId, "isCustom:", isCustomSet);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("🔍 Fetching setId:", setId);
        
        let fullSet: any;
        if (isCustomSet) {
          // Fetch from custom vocabulary API
          fullSet = await getMyCustomVocabularySetById(setId);
        } else {
          // Fetch from standard vocabulary API
          fullSet = await vocabularyApi.getVocabularySetById(setId);
        }
        
        console.log("✅ Received fullSet:", fullSet);
        console.log("📦 Cards array:", fullSet?.cards);
        console.log("📦 Cards count:", fullSet?.cards?.length);
        setActiveSet(fullSet);
      } catch (e: any) {
        console.error("❌ Fetch error:", e);
        console.error("❌ Response data:", e.response?.data);
        console.error("❌ Status:", e.response?.status);
        setError("Không thể tải flashcards. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setId, activeSet]);

  const handleWordClick = (word: FlashCard) => {
    setSelectedWord(word);
    setMode("flashcard");
  };

  const handleMarkComplete = async (wordId: string, recorded: boolean = false) => {
    setCompletedWords((prev) => new Set(prev).add(wordId));
    
    // Gửi API để lưu progress
    try {
      const result = await vocabularyProgressApi.markWordLearned({
        set_id: setId,
        word_id: wordId,
        recorded: recorded
      });
      // Update progress state
      setProgress(result.data);
    } catch (error) {
      console.error('Failed to mark word as learned:', error);
    }
  };

  if (isLoading && !activeSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Đang tải bộ flashcard...</p>
        </div>
      </div>
    );
  }

  if (error || !activeSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">{error || "Không tìm thấy dữ liệu"}</p>
          <Button variant="outline" onClick={() => navigate("/practice")}>
            ← Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  const cards = activeSet.cards || [];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-blue-600">
                Trang chủ
              </Link>
              <span className="text-gray-300">/</span>
              <Link to="/practice" className="text-gray-500 hover:text-blue-600">
                Luyện tập
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">{activeSet.title}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/practice")}>
              ← Quay lại
            </Button>
          </div>
          {/* Progress Bar */}
          {progress && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Tiến độ: {progress.learned_count}/{progress.total_words} từ
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {progress.completion_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={cn(
                    "h-3 rounded-full transition-all",
                    progress.is_completed ? "bg-green-500" : "bg-blue-500"
                  )}
                  style={{ width: `${progress.completion_percentage}%` }}
                />
              </div>
              {progress.is_completed && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  ✓ Đã hoàn thành set từ vựng này!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: 3 columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar: Mode Selector */}
          <div className="col-span-2">
            <div className="space-y-2 sticky top-6">
              <button
                onClick={() => setMode("flashcard")}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors",
                  mode === "flashcard"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                ≡A 1. FlashCard
              </button>

              <button
                onClick={() => setMode("multiple-choice")}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors",
                  mode !== "flashcard"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                ≡A 2. Bài tập
              </button>

              {/* Sub exercises */}
              {mode !== "flashcard" && (
                <div className="ml-4 space-y-1">
                  {SUB_EXERCISES.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => setMode(ex.id)}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2",
                        mode === ex.id
                          ? "bg-green-100 text-green-700 font-medium"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span>{ex.icon}</span>
                      <span>{ex.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-7">
            <Card className="p-6 min-h-[600px]">
              {mode === "flashcard" && (
                <FlashCardExercise
                  cards={cards}
                  selectedWord={selectedWord}
                  onComplete={(wordId: string) => handleMarkComplete(wordId)}
                />
              )}
              {mode === "multiple-choice" && (
                <MultipleChoiceExercise
                  cards={cards}
                  onComplete={(wordId: string) => handleMarkComplete(wordId)}
                />
              )}
              {mode === "listening" && (
                <ListeningExercise
                  cards={cards}
                  onComplete={(wordId: string) => handleMarkComplete(wordId)}
                />
              )}
              {mode === "unscramble" && (
                <UnscrambleExercise
                  cards={cards}
                  onComplete={(wordId: string) => handleMarkComplete(wordId)}
                />
              )}
              {mode === "typing" && (
                <TypingExercise
                  cards={cards}
                  onComplete={(wordId: string) => handleMarkComplete(wordId)}
                />
              )}
            </Card>
          </div>

          {/* Right Sidebar: Word List */}
          <div className="col-span-3">
            <Card className="p-4 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Danh sách từ vựng</h3>
              <div className="space-y-2">
                {cards.map((card) => {
                  const isCompleted = completedWords.has(card._id);
                  return (
                    <button
                      key={card._id}
                      onClick={() => handleWordClick(card)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all border",
                        selectedWord?._id === card._id && isCompleted
                          ? "border-green-500 bg-green-50 shadow-sm"
                          : selectedWord?._id === card._id
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : isCompleted
                          ? "border-green-200 bg-green-50/30 hover:bg-green-100/50"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={cn(
                            "font-medium",
                            isCompleted ? "text-green-700" : "text-gray-900"
                          )}>
                            {card.term}
                          </div>
                          {card.ipa && (
                            <div className={cn(
                              "text-xs italic",
                              isCompleted ? "text-green-600" : "text-gray-500"
                            )}>
                              /{card.ipa}/
                            </div>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500 fill-green-100" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
