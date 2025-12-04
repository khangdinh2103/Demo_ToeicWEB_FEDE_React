import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, BookOpen, Plus } from "lucide-react";
import { generateVocabularySet, getMyCustomVocabularySets } from "@/api/studentVocabularyApi";
import type { StudentVocabularySet } from "@/api/studentVocabularyApi";
import { useEffect } from "react";

export default function CreateVocabularySetPage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mySets, setMySets] = useState<StudentVocabularySet[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState(true);

  useEffect(() => {
    loadMySets();
  }, []);

  const loadMySets = async () => {
    try {
      const result = await getMyCustomVocabularySets();
      setMySets(result.data);
    } catch (error) {
      console.error("Failed to load custom sets:", error);
    } finally {
      setIsLoadingSets(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Vui lòng nhập chủ đề");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateVocabularySet({ topic: topic.trim(), count });
      
      alert(`Đã tạo thành công set "${result.title}" với ${result.cards.length} từ vựng!`);
      
      // Reload danh sách
      await loadMySets();
      
      // Reset form
      setTopic("");
      setCount(15);
      
      // Chuyển đến trang luyện tập set vừa tạo
      navigate(`/practice/my-vocabulary/${result._id}/exercises`);
    } catch (error: any) {
      console.error("Generate vocabulary set error:", error);
      alert(error.response?.data?.message || "Lỗi khi tạo set từ vựng. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Tạo Set Từ Vựng với AI</h1>
          </div>
          <p className="text-xl text-gray-600">
            Nhập chủ đề bạn muốn học, AI sẽ tạo bộ từ vựng hoàn chỉnh cho bạn
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 mb-12 shadow-lg">
          <div className="space-y-6">
            <div>
              <Label htmlFor="topic" className="text-lg font-semibold">
                Chủ đề từ vựng
              </Label>
              <Input
                id="topic"
                type="text"
                placeholder="Ví dụ: Công nghệ thông tin, Du lịch, Ẩm thực..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-2 text-lg"
                disabled={isGenerating}
              />
              <p className="text-sm text-gray-500 mt-2">
                Nhập chủ đề bạn quan tâm, AI sẽ tạo từ vựng phù hợp
              </p>
            </div>

            <div>
              <Label htmlFor="count" className="text-lg font-semibold">
                Số lượng từ vựng
              </Label>
              <div className="flex items-center mt-2 space-x-4">
                <Input
                  id="count"
                  type="number"
                  min={5}
                  max={30}
                  value={count}
                  onChange={(e) => setCount(Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
                  className="w-32 text-lg"
                  disabled={isGenerating}
                />
                <span className="text-gray-600">từ (5-30)</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full text-lg py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tạo set từ vựng...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Tạo Set Từ Vựng
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* My Custom Sets */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Set Từ Vựng Của Tôi ({mySets.length})
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate("/practice")}
            >
              Về trang luyện tập
            </Button>
          </div>

          {isLoadingSets ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : mySets.length === 0 ? (
            <Card className="p-12 text-center">
              <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">
                Bạn chưa có set từ vựng nào. Hãy tạo set đầu tiên!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mySets.map((set) => (
                <Card
                  key={set._id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/practice/my-vocabulary/${set._id}/exercises`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {set.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Chủ đề: {set.topic}
                      </p>
                    </div>
                    <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  </div>

                  {set.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {set.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {set.total_cards} từ vựng
                    </span>
                    <span className="text-gray-500">
                      {new Date(set.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/practice/my-vocabulary/${set._id}/exercises`);
                    }}
                  >
                    Luyện tập ngay
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
