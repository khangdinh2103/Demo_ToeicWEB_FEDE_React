import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Lock } from "lucide-react";
import { vocabularyApi, normalizeId } from "@/api/vocabularyApi";
import type { VocabularySet } from "@/api/vocabularyApi";
import { vocabularyProgressApi } from "@/api/vocabularyProgressApi";
import type { VocabularyProgress } from "@/api/vocabularyProgressApi";
import { getMyCustomVocabularySets } from "@/api/studentVocabularyApi";
import type { StudentVocabularySet } from "@/api/studentVocabularyApi";
import { cn } from "@/lib/utils";

type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb";
type FilterType = PartOfSpeech | "my-sets";

const PART_OF_SPEECH_FILTERS: { id: PartOfSpeech; label: string; icon: string; color: string }[] = [
  { id: "noun", label: "Noun", icon: "📚", color: "bg-green-500" },
  { id: "verb", label: "Verb", icon: "🎬", color: "bg-blue-500" },
  { id: "adjective", label: "Adjective", icon: "🎨", color: "bg-orange-500" },
  { id: "adverb", label: "Adverb", icon: "⚡", color: "bg-yellow-500" },
];

export default function VocabularyPractice() {
  const navigate = useNavigate();
  
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("noun"); // Default to "noun" instead of "all"
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [myCustomSets, setMyCustomSets] = useState<StudentVocabularySet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, VocabularyProgress>>({});

  // Load vocabulary sets khi component mount hoặc filter thay đổi
  useEffect(() => {
    if (selectedFilter === "my-sets") {
      loadMyCustomSets();
    } else {
      loadVocabularySets();
    }
    loadProgress();
  }, [selectedFilter]);

  const loadVocabularySets = async () => {
    setIsLoading(true);
    try {
      // Luôn gửi part_of_speech vì Backend yêu cầu bắt buộc
      console.log("🔍 Loading vocabulary with filter:", selectedFilter);
      const result = await vocabularyApi.getVocabularySets({ part_of_speech: selectedFilter as PartOfSpeech });
      console.log("📦 Received data:", result);
      setVocabularySets(result?.data || []);
      setMyCustomSets([]);
    } catch (error) {
      console.error("Error loading vocabulary sets:", error);
      setVocabularySets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyCustomSets = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Loading my custom sets");
      const result = await getMyCustomVocabularySets();
      console.log("📦 Received custom sets:", result);
      setMyCustomSets(result.data || []);
      setVocabularySets([]);
    } catch (error) {
      console.error("Error loading custom sets:", error);
      setMyCustomSets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const result = await vocabularyProgressApi.getAllProgress();
      const progressData = result.data || [];
      const map: Record<string, VocabularyProgress> = {};
      progressData.forEach((p: VocabularyProgress) => {
        map[p.set_id] = p;
      });
      setProgressMap(map);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const getIdString = (id: any): string => normalizeId(id);

  const startPractice = async (set: VocabularySet) => {
    const id = getIdString(set._id);
    // Điều hướng sang trang exercises với đầy đủ bài tập
    navigate(`/practice/vocabulary/${encodeURIComponent(id)}/exercises`, { state: { set } });
  };

  const startCustomSetPractice = (set: StudentVocabularySet) => {
    const id = getIdString(set._id);
    navigate(`/practice/my-vocabulary/${encodeURIComponent(id)}/exercises`);
  };

  // Không cần filter ở client nữa vì đã filter ở API
  const filteredSets = vocabularySets;
  const isMySetView = selectedFilter === "my-sets";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Từ vựng</h1>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Filter Menu */}
        <div className="w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Chủ điểm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Part of speech filters */}
              {PART_OF_SPEECH_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3",
                    selectedFilter === filter.id
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-50 border"
                  )}
                >
                  <span className="text-xl">{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}

              {/* Divider */}
              <div className="border-t my-2"></div>

              {/* My Custom Sets Filter */}
              <button
                onClick={() => setSelectedFilter("my-sets")}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3",
                  selectedFilter === "my-sets"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                )}
              >
                <span className="text-xl">✨</span>
                <span>Set của tôi</span>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Vocabulary Sets Grid */}
        <div className="flex-1">
          {/* Vocabulary Sets Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Đang tải danh sách...</p>
            </div>
          ) : isMySetView ? (
            // Render My Custom Sets
            myCustomSets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Bạn chưa có set từ vựng nào. Hãy tạo set đầu tiên!
                  </p>
                  <Button onClick={() => navigate("/practice/create-vocabulary")}>
                    ✨ Tạo Set Mới
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCustomSets.map((set) => (
                  <Card
                    key={getIdString(set._id)}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              ✨ AI Generated
                            </Badge>
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                              {set.topic}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">{set.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription>
                        <div className="text-sm mt-2 space-y-1">
                          <div>{set.total_cards} từ vựng</div>
                          <div className="text-xs text-gray-500">
                            {new Date(set.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => startCustomSetPractice(set)} 
                        className="w-full"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Luyện tập ngay
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : filteredSets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {vocabularySets.length === 0 
                    ? "Chưa có bộ từ vựng nào." 
                    : "Không có bộ từ vựng nào cho bộ lọc này."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSets.map((set) => (
                <Card
                  key={getIdString(set._id)}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            📝 FlashCard-Exam
                          </Badge>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            🗣️ Voca
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{set.title}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>
                      <div className="text-sm mt-2 space-y-1">
                        <div>{set.total_cards || set.cards?.length || 0} từ vựng</div>
                        {progressMap[getIdString(set._id)] && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  "h-2 rounded-full transition-all",
                                  progressMap[getIdString(set._id)].is_completed 
                                    ? "bg-green-500" 
                                    : "bg-blue-500"
                                )}
                                style={{ width: `${progressMap[getIdString(set._id)].completion_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {progressMap[getIdString(set._id)].completion_percentage}%
                            </span>
                          </div>
                        )}
                        {progressMap[getIdString(set._id)]?.is_completed && (
                          <Badge className="bg-green-500 text-white">
                            ✓ Đã hoàn thành
                          </Badge>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600"
                      onClick={() => startPractice(set)}
                      disabled={(set.total_cards || set.cards?.length || 0) === 0}
                    >
                      {(set.total_cards || set.cards?.length || 0) === 0 ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Chưa có từ vựng
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Vào học
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}