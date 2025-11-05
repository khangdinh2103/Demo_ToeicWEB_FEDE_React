import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Lock, Loader2, Play, BookOpen } from "lucide-react";
import { dictationApi, type Dictation } from "@/api/dictationApi";

export default function DictationPractice() {
  const navigate = useNavigate();
  
  const [dictations, setDictations] = useState<Dictation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDictations();
  }, []);

  const loadDictations = async () => {
    setIsLoading(true);
    try {
      console.log("🎥 Loading dictation lessons...");
      const result = await dictationApi.getAllDictations();
      console.log("📦 Received dictations:", result);
      setDictations(result?.data || []);
    } catch (error) {
      console.error("Error loading dictations:", error);
      setDictations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startDictation = (dictation: Dictation) => {
    if (dictation.is_locked) {
      alert("Bạn cần mua khóa học để mở khóa bài học này!");
      return;
    }
    navigate(`/practice/dictation/${dictation._id}`, { state: { dictation } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Chép Chính Tả</h2>
        <p className="text-gray-600">
          Luyện nghe và chép chính tả với video YouTube có phụ đề
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            Về tính năng Chép Chính Tả
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ Học từ video YouTube thực tế với phụ đề tự động</p>
          <p>✅ <strong>10 bài học đầu tiên MIỄN PHÍ</strong>, các bài tiếp theo cần mua khóa học</p>
          <p>✅ Luyện nghe, viết chính tả và từ vựng đồng thời</p>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">Đang tải danh sách bài học...</p>
        </div>
      ) : dictations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Chưa có bài học nào</p>
            <p className="text-sm text-gray-500">
              Admin cần tạo bài học từ video YouTube trong trang quản trị
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dictations.map((dictation, index) => (
            <Card 
              key={dictation._id} 
              className={`hover:shadow-lg transition-all ${
                dictation.is_locked 
                  ? "border-gray-300 bg-gray-50 opacity-75" 
                  : "border-purple-200 hover:border-purple-400"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {dictation.is_locked ? (
                        <Badge variant="secondary" className="bg-gray-400">
                          <Lock className="h-3 w-3 mr-1" />
                          Đã khóa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          Miễn phí
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Bài {index + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {dictation.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* YouTube Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={`https://img.youtube.com/vi/${dictation.youtubeVideoId}/mqdefault.jpg`}
                    alt={dictation.title}
                    className="w-full h-full object-cover"
                  />
                  {dictation.is_locked && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Lock className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {dictation.breaks?.length || 0} đoạn
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    YouTube
                  </span>
                </div>

                {/* Translation Preview */}
                {dictation.lessonTranslation && (
                  <p className="text-xs text-gray-500 line-clamp-2 italic">
                    "{dictation.lessonTranslation}"
                  </p>
                )}

                {/* Action Button */}
                <Button 
                  className="w-full"
                  disabled={dictation.is_locked}
                  onClick={() => startDictation(dictation)}
                  variant={dictation.is_locked ? "secondary" : "default"}
                >
                  {dictation.is_locked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Cần mua khóa học
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Bắt đầu học
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Card */}
      {dictations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dictations.length}
                </div>
                <div className="text-sm text-gray-600">Tổng bài học</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dictations.filter(d => !d.is_locked).length}
                </div>
                <div className="text-sm text-gray-600">Miễn phí</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {dictations.filter(d => d.is_locked).length}
                </div>
                <div className="text-sm text-gray-600">Đã khóa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dictations.reduce((sum, d) => sum + (d.breaks?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Tổng đoạn</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
