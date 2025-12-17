import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { vocabularyApi, normalizeId } from "@/api/vocabularyApi";
import type { VocabularySet } from "@/api/vocabularyApi";
import VocabularyFlashCard from "@/components/VocabularyFlashCard";

export default function VocabularySetPracticePage() {
  const { setId: rawSetId } = useParams();
  const setId = useMemo(() => normalizeId(rawSetId || ""), [rawSetId]);
  const location = useLocation() as any;
  const navigate = useNavigate();

  const [activeSet, setActiveSet] = useState<VocabularySet | null>(location?.state?.set || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSet) return; // đã có từ state
    if (!setId) {
      setError("Thiếu setId");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
          const data = await vocabularyApi.getVocabularySetById(setId);
          setActiveSet(data);
      } catch (e: any) {
        console.error("Không thể tải bộ flashcard:", e);
        setError("Không thể tải flashcards. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setId, activeSet]);

  const handleCompletePractice = () => {
    navigate("/practice");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            <Link to="/practice" className="text-gray-500 hover:text-blue-600">
              Luyện tập
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Từ vựng</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !activeSet ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Đang tải bộ flashcard...</p>
          </div>
        ) : error ? (
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => navigate("/practice")}>← Quay lại</Button>
            </CardContent>
          </Card>
        ) : activeSet ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigate("/practice")}>
                ← Quay lại Luyện tập
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{activeSet.title}</h2>
              <p className="text-gray-600">
                {activeSet.cards?.length || 0} từ vựng{activeSet.part_of_speech ? ` • ${activeSet.part_of_speech.charAt(0).toUpperCase() + activeSet.part_of_speech.slice(1)}` : ''}
              </p>
            </div>

            <VocabularyFlashCard cards={activeSet.cards || []} onComplete={handleCompletePractice} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
