import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Mic,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import type { FlashCard, PronunciationResult } from "@/api/vocabularyApi";
import { vocabularyApi } from "@/api/vocabularyApi";
import { cn } from "@/lib/utils";

interface VocabularyFlashCardProps {
  cards: FlashCard[];
  onComplete?: () => void;
}

export default function VocabularyFlashCard({ cards, onComplete }: VocabularyFlashCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<"US" | "UK">("US");
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  // Play audio
  const playAudio = (voice: "US" | "UK") => {
    const audioUrl = voice === "US" ? currentCard.audioUS_url : currentCard.audioUK_url;
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await analyzePronunciation(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setPronunciationResult(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Analyze pronunciation
  const analyzePronunciation = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    try {
      const result = await vocabularyApi.assessPronunciation(audioBlob, currentCard.term);
      setPronunciationResult(result);
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
      alert("Lỗi khi phân tích phát âm. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Navigation
  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setPronunciationResult(null);
    } else if (onComplete) {
      onComplete();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setPronunciationResult(null);
    }
  };

  const markAsCompleted = () => {
    setCompletedCards((prev) => new Set(prev).add(currentIndex));
    setTimeout(goToNext, 500);
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 bg-green-50";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return "bg-green-500";
    if (accuracy >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helpers: render collocations and examples with flexible shapes
  const formatCollocation = (col: any) => {
    if (typeof col === "string") return col;
    if (col && typeof col === "object") {
      const phrase = (col as any).phrase ?? (col as any).term ?? "";
      const meaning = (col as any).meaning ?? (col as any).translation ?? "";
      return meaning ? `${phrase} — ${meaning}` : phrase;
    }
    return String(col);
  };

  const extractExamples = (card: any): Array<{ sentence: string; translation?: string }> => {
    const result: Array<{ sentence: string; translation?: string }> = [];
    const ex1 = card?.example;
    if (ex1) {
      if (typeof ex1 === "string") result.push({ sentence: ex1 });
      else if (typeof ex1 === "object" && ex1.sentence) result.push({ sentence: ex1.sentence, translation: ex1.translation });
    }
    const exArr = card?.examples;
    if (Array.isArray(exArr)) {
      for (const it of exArr) {
        if (typeof it === "string") result.push({ sentence: it });
        else if (it && typeof it === "object" && "sentence" in it) {
          result.push({ sentence: (it as any).sentence, translation: (it as any).translation });
        }
      }
    }
    return result;
  };

  if (!currentCard) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Thẻ {currentIndex + 1} / {cards.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Card
        className={cn(
          "relative min-h-[400px] cursor-pointer transition-all duration-300 hover:shadow-lg",
          isFlipped && "bg-blue-50"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="p-8">
          {!isFlipped ? (
            // Front side - Term
            <div className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
              <div className="text-center">
                <h2 className="text-5xl font-bold text-gray-900 mb-4">{currentCard.term}</h2>
                {currentCard.ipa && (
                  <p className="text-2xl text-gray-600 font-mono">/{currentCard.ipa}/</p>
                )}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVoice("US");
                    playAudio("US");
                  }}
                  disabled={!currentCard.audioUS_url}
                  className={selectedVoice === "US" ? "border-blue-500 bg-blue-50" : ""}
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  US
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVoice("UK");
                    playAudio("UK");
                  }}
                  disabled={!currentCard.audioUK_url}
                  className={selectedVoice === "UK" ? "border-blue-500 bg-blue-50" : ""}
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  UK
                </Button>
              </div>

              <div className="text-sm text-gray-500 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Nhấn để xem nghĩa
              </div>
            </div>
          ) : (
            // Back side - Meaning
            <div className="space-y-6 min-h-[300px]">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nghĩa</h3>
                <p className="text-2xl text-gray-900">{currentCard.mainMeaning}</p>
              </div>

              {currentCard.collocations && currentCard.collocations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Collocations</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentCard.collocations.map((col: any, idx: number) => {
                      const label = formatCollocation(col);
                      return (
                        <Badge key={idx} variant="secondary">
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {(() => {
                const examples = extractExamples(currentCard as any);
                if (examples.length === 0) return null;
                return (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Ví dụ</h3>
                    <div className="space-y-3">
                      {examples.map((ex, i) => (
                        <div key={i}>
                          <p className="text-gray-900 italic">"{ex.sentence}"</p>
                          {ex.translation && (
                            <p className="text-gray-600 text-sm mt-1">{ex.translation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pronunciation Practice */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Mic className="h-5 w-5 mr-2 text-blue-600" />
            Luyện phát âm
          </h3>

          <div className="flex items-center justify-center gap-4 mb-6">
            {!isRecording ? (
              <Button size="lg" onClick={startRecording} className="px-8" disabled={isAnalyzing}>
                <Mic className="mr-2 h-5 w-5" />
                Bắt đầu thu âm
              </Button>
            ) : (
              <Button size="lg" variant="destructive" onClick={stopRecording} className="px-8">
                <div className="flex items-center">
                  <div className="animate-pulse mr-2 h-3 w-3 rounded-full bg-white" />
                  Dừng thu âm
                </div>
              </Button>
            )}

            {pronunciationResult && (
              <Button variant="outline" onClick={() => setPronunciationResult(null)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>

          {/* Analysis Loading */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Đang phân tích phát âm...</p>
            </div>
          )}

          {/* Pronunciation Results */}
          {pronunciationResult && !isAnalyzing && (
            <div className="space-y-6">
              {/* Overall Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tổng thể", value: pronunciationResult.scores.overall },
                  { label: "Chính xác", value: pronunciationResult.scores.accuracy },
                  { label: "Trôi chảy", value: pronunciationResult.scores.fluency },
                  { label: "Hoàn chỉnh", value: pronunciationResult.scores.completeness },
                ].map((score) => (
                  <div
                    key={score.label}
                    className={cn(
                      "text-center p-4 rounded-lg",
                      getAccuracyColor(score.value || 0)
                    )}
                  >
                    <div className="text-3xl font-bold">{score.value?.toFixed(0) || "N/A"}</div>
                    <div className="text-sm mt-1">{score.label}</div>
                  </div>
                ))}
              </div>

              {/* Syllables Analysis */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Chi tiết từng âm tiết</h4>
                <div className="space-y-4">
                  {pronunciationResult.syllables.map((syllable, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-mono font-bold">{syllable.ipa}</span>
                          {syllable.grapheme && (
                            <span className="text-lg text-gray-600">({syllable.grapheme})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={syllable.accuracy}
                            className={cn("h-2 w-24", getAccuracyBg(syllable.accuracy))}
                          />
                          <span
                            className={cn(
                              "font-semibold text-lg",
                              syllable.accuracy >= 80
                                ? "text-green-600"
                                : syllable.accuracy >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            )}
                          >
                            {syllable.accuracy.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Phonemes */}
                      <div className="space-y-2">
                        {syllable.phonemes.map((phoneme, pIdx) => (
                          <div
                            key={pIdx}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded",
                              getAccuracyColor(phoneme.accuracy)
                            )}
                          >
                            <div className="flex-shrink-0">
                              {phoneme.result === "perfect" ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold">/{phoneme.target}/</span>
                                {phoneme.altPh && phoneme.altPh !== phoneme.target && (
                                  <span className="text-sm text-gray-600">
                                    → Bạn nói: /{phoneme.altPh}/
                                  </span>
                                )}
                                <Badge
                                  variant={
                                    phoneme.result === "perfect"
                                      ? "default"
                                      : phoneme.result === "near_correct"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {phoneme.accuracy.toFixed(0)}%
                                </Badge>
                              </div>
                              <p className="text-sm">{phoneme.feedback}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={goToPrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Trước
        </Button>

        <div className="flex gap-2">
          {completedCards.has(currentIndex) ? (
            <Badge variant="default" className="px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Đã hoàn thành
            </Badge>
          ) : (
            <Button variant="secondary" onClick={markAsCompleted}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Đánh dấu hoàn thành
            </Button>
          )}
        </div>

        <Button
          onClick={goToNext}
          disabled={currentIndex === cards.length - 1 && !onComplete}
        >
          {currentIndex === cards.length - 1 ? "Hoàn thành" : "Tiếp theo"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
