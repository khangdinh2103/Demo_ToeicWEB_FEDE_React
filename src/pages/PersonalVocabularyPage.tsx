"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { personalVocabularyApi, type PersonalVocabulary } from "@/api/personalVocabularyApi"
import { useToast } from "@/hooks/use-toast"
import {
  BookOpen,
  Search,
  Heart,
  Trash2,
  Edit,
  Volume2,
  Star,
  TrendingUp,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import AddVocabularyModal from "@/components/vocabulary/AddVocabularyModal"
import { Link } from "react-router-dom"

export default function PersonalVocabularyPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [words, setWords] = useState<PersonalVocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Filters
  const [search, setSearch] = useState("")
  const [filterMastery, setFilterMastery] = useState<string>("all")
  const [filterFavorite, setFilterFavorite] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>("all")
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedWord, setSelectedWord] = useState<PersonalVocabulary | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Stats
  const [stats, setStats] = useState<any>(null)
  const [tags, setTags] = useState<Array<{ tag: string; count: number }>>([])

  useEffect(() => {
    fetchWords()
    fetchStats()
    fetchTags()
  }, [page, filterMastery, filterFavorite, selectedTag, search])

  const fetchWords = async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 20 }
      
      if (search) params.search = search
      if (filterMastery !== "all") params.mastery_level = parseInt(filterMastery)
      if (filterFavorite) params.is_favorite = true
      if (selectedTag !== "all") params.tags = selectedTag

      const data = await personalVocabularyApi.getMyVocabulary(params)
      setWords(data.words)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách từ vựng",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await personalVocabularyApi.getStatistics()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchTags = async () => {
    try {
      const data = await personalVocabularyApi.getAllTags()
      setTags(data)
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      await personalVocabularyApi.toggleFavorite(id)
      fetchWords()
      fetchStats()
      toast({
        title: "Thành công",
        description: "Đã cập nhật yêu thích"
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string, word: string) => {
    if (!confirm(`Xóa từ "${word}" khỏi bộ từ cá nhân?`)) return

    try {
      await personalVocabularyApi.deleteWord(id)
      fetchWords()
      fetchStats()
      toast({
        title: "Thành công",
        description: "Đã xóa từ vựng"
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa từ vựng",
        variant: "destructive"
      })
    }
  }

  const playAudio = (audioUrl?: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const getMasteryColor = (level: number) => {
    if (level >= 4) return "text-green-600 bg-green-50"
    if (level >= 2) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getMasteryLabel = (level: number) => {
    if (level === 0) return "Mới"
    if (level === 1) return "Đang học"
    if (level === 2) return "Quen thuộc"
    if (level === 3) return "Thành thạo"
    if (level === 4) return "Rất tốt"
    return "Xuất sắc"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/practice">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Quay lại
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Bộ từ cá nhân
                </h1>
                <p className="text-sm text-gray-600">
                  {total} từ vựng đã lưu
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Thêm từ mới
            </Button>
            {total > 0 && (
              <Button
                onClick={() => navigate("/practice/vocabulary/personal/exercises")}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Luyện tập ngay
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng số từ</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Yêu thích</p>
                    <p className="text-2xl font-bold">{stats.favorites}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ôn hôm nay</p>
                    <p className="text-2xl font-bold">{stats.reviewedToday}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Thành thạo</p>
                    <p className="text-2xl font-bold">{stats.byMastery[5] || 0}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm từ vựng..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>

              {/* Mastery Level */}
              <Select value={filterMastery} onValueChange={(value) => {
                setFilterMastery(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="0">Mới</SelectItem>
                  <SelectItem value="1">Đang học</SelectItem>
                  <SelectItem value="2">Quen thuộc</SelectItem>
                  <SelectItem value="3">Thành thạo</SelectItem>
                  <SelectItem value="4">Rất tốt</SelectItem>
                  <SelectItem value="5">Xuất sắc</SelectItem>
                </SelectContent>
              </Select>

              {/* Tags */}
              <Select value={selectedTag} onValueChange={(value) => {
                setSelectedTag(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tags</SelectItem>
                  {tags.map(t => (
                    <SelectItem key={t.tag} value={t.tag}>
                      {t.tag} ({t.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Favorite */}
              <Button
                variant={filterFavorite ? "default" : "outline"}
                onClick={() => {
                  setFilterFavorite(!filterFavorite)
                  setPage(1)
                }}
              >
                <Heart className={`h-4 w-4 mr-2 ${filterFavorite ? 'fill-current' : ''}`} />
                Yêu thích
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Word List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : words.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {search || filterMastery !== "all" || filterFavorite || selectedTag !== "all"
                  ? "Không tìm thấy từ vựng nào"
                  : "Bạn chưa có từ vựng nào"}
              </p>
              {!search && filterMastery === "all" && !filterFavorite && selectedTag === "all" && (
                <Button onClick={() => setShowAddModal(true)}>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Thêm từ đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {words.map(word => (
                <Card key={word._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {word.word}
                          </h3>
                          {word.phonetic && (
                            <span className="text-sm text-gray-500">{word.phonetic}</span>
                          )}
                          {word.audioUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => playAudio(word.audioUrl)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {word.part_of_speech && word.part_of_speech !== 'other' && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {word.part_of_speech}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleFavorite(word._id)}
                        >
                          <Heart className={`h-4 w-4 ${word.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedWord(word)
                            setShowDetailModal(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(word._id, word.word)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{word.definition}</p>
                    
                    {word.translation && (
                      <p className="text-sm text-blue-600 mb-2">
                        🇻🇳 {word.translation}
                      </p>
                    )}

                    {word.example && (
                      <p className="text-sm text-gray-600 italic mb-2">
                        "{word.example}"
                      </p>
                    )}

                    {word.notes && word.notes.includes('—') && (
                      <div className="text-sm text-gray-700 mb-2 space-y-1">
                        <p className="font-semibold">Collocations:</p>
                        <div className="pl-2 space-y-0.5">
                          {word.notes.split('\n').map((line, idx) => (
                            line.trim() && line.includes('—') ? (
                              <p key={idx} className="text-xs">{line.trim()}</p>
                            ) : null
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex gap-2">
                        {word.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Badge className={`text-xs ${getMasteryColor(word.mastery_level)}`}>
                        {getMasteryLabel(word.mastery_level)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      <AddVocabularyModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open)
          if (!open) fetchWords()
        }}
      />

      {/* Detail Modal */}
      {selectedWord && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chi tiết từ vựng
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedWord.word}</h3>
                {selectedWord.phonetic && (
                  <p className="text-gray-500">{selectedWord.phonetic}</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-1">Định nghĩa:</h4>
                <p>{selectedWord.definition}</p>
              </div>
              {selectedWord.translation && (
                <div>
                  <h4 className="font-semibold mb-1">Nghĩa tiếng Việt:</h4>
                  <p>{selectedWord.translation}</p>
                </div>
              )}
              {selectedWord.example && (
                <div>
                  <h4 className="font-semibold mb-1">Ví dụ:</h4>
                  <p className="italic">"{selectedWord.example}"</p>
                </div>
              )}
              {selectedWord.notes && (
                <div>
                  <h4 className="font-semibold mb-1">Ghi chú:</h4>
                  <p>{selectedWord.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-semibold">Đã ôn:</span>
                <span>{selectedWord.times_reviewed} lần</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
