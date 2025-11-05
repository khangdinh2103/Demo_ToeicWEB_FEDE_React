import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  SkipForward, 
  SkipBack, 
  Volume2,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Languages
} from "lucide-react";
import { dictationApi, type Dictation } from "@/api/dictationApi";
import YouTube, { type YouTubeProps } from 'react-youtube';

export default function DictationPlayerPage() {
  const { dictationId } = useParams<{ dictationId: string }>();
  const navigate = useNavigate();
  
  const [dictation, setDictation] = useState<Dictation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBreakIndex, setCurrentBreakIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [score, setScore] = useState(0);
  const [completedBreaks, setCompletedBreaks] = useState<number[]>([]);
  
  const playerRef = useRef<any>(null);

  useEffect(() => {
    loadDictation();
  }, [dictationId]);

  const loadDictation = async () => {
    if (!dictationId) return;
    
    setIsLoading(true);
    try {
      const result = await dictationApi.getDictationById(dictationId);
      setDictation(result);
    } catch (error: any) {
      console.error("Error loading dictation:", error);
      if (error.response?.status === 403) {
        alert("Bạn cần mua khóa học để truy cập bài học này!");
        navigate("/practice");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentBreak = dictation?.breaks?.[currentBreakIndex];

  const onPlayerReady: YouTubeProps['onReady'] = (event: any) => {
    playerRef.current = event.target;
    if (currentBreak) {
      event.target.seekTo(currentBreak.startTime);
    }
  };

  const playCurrentBreak = () => {
    if (playerRef.current && currentBreak) {
      playerRef.current.seekTo(currentBreak.startTime);
      playerRef.current.playVideo();
      
      // Auto pause at end time
      setTimeout(() => {
        playerRef.current?.pauseVideo();
      }, (currentBreak.endTime - currentBreak.startTime) * 1000);
    }
  };

  const handleCheck = () => {
    if (!currentBreak) return;
    
    // Helper function to normalize text: lowercase and remove punctuation
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[.,;:!?'"()]/g, '')  // Remove all punctuation
        .replace(/\s+/g, ' ')          // Normalize whitespace
        .trim();
    };
    
    const normalizedAnswer = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(currentBreak.originalText);
    
    const correct = normalizedAnswer === normalizedCorrect;
    setIsCorrect(correct);
    setIsChecked(true);
    
    if (correct && !completedBreaks.includes(currentBreakIndex)) {
      setScore(score + 1);
      setCompletedBreaks([...completedBreaks, currentBreakIndex]);
    }
  };

  // Function to compare word by word and return colored result
  const renderWordComparison = () => {
    if (!currentBreak) return null;

    // Helper function to normalize text: lowercase and remove punctuation
    const normalizeWord = (word: string) => {
      return word.toLowerCase().replace(/[.,;:!?'"()]/g, '');
    };

    const userWords = userAnswer.trim().split(/\s+/).filter(w => w.length > 0);
    const correctWords = currentBreak.originalText.trim().split(/\s+/).filter(w => w.length > 0);
    
    // Create a set of correct words for flexible matching
    const correctWordsNormalized = correctWords.map(w => normalizeWord(w));
    const usedCorrectIndices = new Set<number>();

    const comparison: { 
      word: string; 
      isCorrect: boolean; 
      isOriginal?: boolean;
      matchedWord?: string;
    }[] = [];

    // Match user words with correct words flexibly
    userWords.forEach(userWord => {
      const normalizedUser = normalizeWord(userWord);
      
      // Try to find exact match first (not already used)
      let matchIndex = -1;
      for (let i = 0; i < correctWordsNormalized.length; i++) {
        if (!usedCorrectIndices.has(i) && normalizedUser === correctWordsNormalized[i]) {
          matchIndex = i;
          break;
        }
      }

      if (matchIndex !== -1) {
        // Found exact match
        usedCorrectIndices.add(matchIndex);
        comparison.push({
          word: userWord,
          isCorrect: true,
          matchedWord: correctWords[matchIndex]
        });
      } else {
        // No match found - wrong word
        comparison.push({
          word: userWord,
          isCorrect: false
        });
      }
    });

    // Add missing words (words in correct answer but not in user answer)
    correctWords.forEach((correctWord, index) => {
      if (!usedCorrectIndices.has(index)) {
        comparison.push({
          word: correctWord,
          isCorrect: false,
          isOriginal: true  // Word missing from user answer
        });
      }
    });

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {comparison.map((item, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded font-medium ${
                item.isCorrect
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : item.isOriginal
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}
              title={item.isOriginal ? 'Từ bị thiếu' : undefined}
            >
              {item.word}
              {item.isOriginal && ' (thiếu)'}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-500 italic">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span> Đúng
          </span>
          {' • '}
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span> Sai
          </span>
          {' • '}
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span> Thiếu
          </span>
        </div>
      </div>
    );
  };

  const nextBreak = () => {
    if (!dictation) return;
    
    if (currentBreakIndex < dictation.breaks.length - 1) {
      setCurrentBreakIndex(currentBreakIndex + 1);
      setUserAnswer("");
      setIsChecked(false);
      setIsCorrect(false);
      setShowTranslation(false);
      setShowVocabulary(false);
      
      // Auto play next break after a short delay to allow state update
      setTimeout(() => {
        const nextBreak = dictation.breaks[currentBreakIndex + 1];
        if (playerRef.current && nextBreak) {
          playerRef.current.seekTo(nextBreak.startTime);
          playerRef.current.playVideo();
          
          // Auto pause at end time
          setTimeout(() => {
            playerRef.current?.pauseVideo();
          }, (nextBreak.endTime - nextBreak.startTime) * 1000);
        }
      }, 300);
    }
  };

  const previousBreak = () => {
    if (currentBreakIndex > 0) {
      setCurrentBreakIndex(currentBreakIndex - 1);
      setUserAnswer("");
      setIsChecked(false);
      setIsCorrect(false);
      setShowTranslation(false);
      setShowVocabulary(false);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '480',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (!dictation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Không tìm thấy bài học</h2>
            <Button onClick={() => navigate("/practice")}>
              Quay lại trang luyện tập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/practice")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{dictation.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{dictation.lessonTranslation}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{score}</div>
            <div className="text-xs text-gray-600">điểm</div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Đoạn {currentBreakIndex + 1} / {dictation.breaks.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((completedBreaks.length / dictation.breaks.length) * 100)}% hoàn thành
              </span>
            </div>
            <Progress 
              value={(completedBreaks.length / dictation.breaks.length) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Video</span>
                  <Badge variant="outline">
                    {currentBreak?.startTime}s - {currentBreak?.endTime}s
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <YouTube
                    videoId={dictation.youtubeVideoId}
                    opts={opts}
                    onReady={onPlayerReady}
                  />
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={previousBreak}
                    disabled={currentBreakIndex === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={playCurrentBreak}
                    className="px-8"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Nghe đoạn này
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextBreak}
                    disabled={currentBreakIndex === dictation.breaks.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Answer Input */}
            <Card>
              <CardHeader>
                <CardTitle>Chép lại câu bạn nghe được</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Gõ câu bạn nghe được ở đây..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isChecked}
                  rows={4}
                  className="text-lg"
                />

                {!isChecked ? (
                  <Button 
                    className="w-full" 
                    onClick={handleCheck}
                    disabled={!userAnswer.trim()}
                  >
                    Kiểm tra
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Result */}
                    <div className={`p-4 rounded-lg ${
                      isCorrect 
                        ? "bg-green-50 border-2 border-green-500" 
                        : "bg-red-50 border-2 border-red-500"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-bold">
                          {isCorrect ? "Chính xác! 🎉" : "Chưa chính xác"}
                        </span>
                      </div>
                      
                      {!isCorrect && (
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-700 block mb-2">
                              Kết quả so sánh từng từ:
                            </span>
                            {renderWordComparison()}
                          </div>
                          <div className="pt-3 border-t">
                            <span className="font-medium text-gray-700 block mb-1">
                              Đáp án đúng:
                            </span>
                            <p className="text-green-700 font-medium text-base">
                              {currentBreak?.originalText}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Button */}
                    {currentBreakIndex < dictation.breaks.length - 1 ? (
                      <Button className="w-full" onClick={nextBreak}>
                        Đoạn tiếp theo
                        <SkipForward className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          alert(`Hoàn thành! Điểm: ${score}/${dictation.breaks.length}`);
                          navigate("/practice");
                        }}
                      >
                        Hoàn thành bài học
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Hints */}
          <div className="space-y-6">
            {/* Translation - Only show after checking */}
            {isChecked && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Bản dịch
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowTranslation(!showTranslation)}
                    >
                      {showTranslation ? "Ẩn" : "Hiện"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {showTranslation && (
                  <CardContent>
                    <p className="text-gray-700 italic">
                      {currentBreak?.textTranslation}
                    </p>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Vocabulary - Only show after checking */}
            {isChecked && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Từ vựng quan trọng
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowVocabulary(!showVocabulary)}
                    >
                      {showVocabulary ? "Ẩn" : "Hiện"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {showVocabulary && (
                  <CardContent>
                    <div className="space-y-3">
                      {currentBreak?.words && currentBreak.words.length > 0 ? (
                        currentBreak.words.map((word, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-bold text-purple-700">{word.word}</div>
                            <div className="text-sm text-gray-600 mt-1">{word.meaning}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Không có từ vựng nào được đánh dấu
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Progress List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiến độ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {dictation.breaks.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentBreakIndex === index ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setCurrentBreakIndex(index);
                        setUserAnswer("");
                        setIsChecked(false);
                        setIsCorrect(false);
                        setShowTranslation(false);
                        setShowVocabulary(false);
                      }}
                    >
                      <span className="mr-2">Đoạn {index + 1}</span>
                      {completedBreaks.includes(index) && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
