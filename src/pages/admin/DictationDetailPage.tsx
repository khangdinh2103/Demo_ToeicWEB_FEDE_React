import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import AdminMenu from '@/components/AdminMenu'
import { dictationApi } from '@/api/practiceApi'

interface DictationBreak {
  breakNumber: number
  startTime: number
  endTime: number
  originalText: string
  textTranslation: string
  words: Array<{
    word: string
    meaning: string
  }>
}

interface Dictation {
  _id: string
  title: string
  youtubeVideoId: string
  lessonTranslation: string
  breaks: DictationBreak[]
  createdAt: string
}

export default function DictationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [dictation, setDictation] = useState<Dictation | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingBreak, setEditingBreak] = useState<DictationBreak | null>(null)
  const [breakToDelete, setBreakToDelete] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState<DictationBreak>({
    breakNumber: 0,
    startTime: 0,
    endTime: 0,
    originalText: '',
    textTranslation: '',
    words: []
  })

  const [newWord, setNewWord] = useState({ word: '', meaning: '' })

  useEffect(() => {
    if (id) {
      fetchDictation()
    }
  }, [id])

  const fetchDictation = async () => {
    try {
      setLoading(true)
      const response = await dictationApi.getById(id!)
      setDictation(response.data)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải dữ liệu'
      })
      navigate('/admin/practice')
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (breakItem: DictationBreak) => {
    setEditingBreak(breakItem)
    setFormData({ ...breakItem })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (breakNumber: number) => {
    setBreakToDelete(breakNumber)
    setShowDeleteDialog(true)
  }

  const addWord = () => {
    if (newWord.word && newWord.meaning) {
      setFormData({
        ...formData,
        words: [...formData.words, newWord]
      })
      setNewWord({ word: '', meaning: '' })
    }
  }

  const removeWord = (index: number) => {
    setFormData({
      ...formData,
      words: formData.words.filter((_, i) => i !== index)
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dictation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/practice')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{dictation.title}</h1>
                <p className="text-gray-600 italic mb-2">"{dictation.lessonTranslation}"</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>🎬 YouTube: {dictation.youtubeVideoId}</span>
                  <span>📝 {dictation.breaks.length} đoạn</span>
                  <span>📅 {new Date(dictation.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout: Video Left, Breaks Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - YouTube Video */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video Preview</CardTitle>
                  <CardDescription>YouTube: {dictation.youtubeVideoId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${dictation.youtubeVideoId}`}
                      title={dictation.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Breaks List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Các đoạn ({dictation.breaks.length})</h2>
              </div>

              {dictation.breaks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 mb-4">Chưa có đoạn nào</p>
                  </CardContent>
                </Card>
              ) : (
                dictation.breaks.map((breakItem) => (
                <Card key={breakItem.breakNumber} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">Đoạn {breakItem.breakNumber}</Badge>
                          <Badge variant="secondary">
                            <Play className="w-3 h-3 mr-1" />
                            {formatTime(breakItem.startTime)} - {formatTime(breakItem.endTime)}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-1">{breakItem.originalText}</CardTitle>
                        <CardDescription className="italic">
                          {breakItem.textTranslation}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(breakItem)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(breakItem.breakNumber)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Words */}
                    {breakItem.words && breakItem.words.length > 0 && (
                      <div>
                        <Label className="text-xs text-gray-500 mb-2 block">TỪ VỰNG ({breakItem.words.length})</Label>
                        <div className="grid gap-2 md:grid-cols-2">
                          {breakItem.words.map((word, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                            >
                              <div>
                                <span className="font-medium text-blue-600">{word.word}</span>
                                <span className="text-gray-600 ml-2">- {word.meaning}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
            </div>
          </div>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa đoạn {editingBreak?.breakNumber}</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin cho đoạn chính tả
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Thời gian bắt đầu (giây)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Thời gian kết thúc (giây)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Original Text */}
                <div>
                  <Label>Văn bản gốc (tiếng Anh)</Label>
                  <Textarea
                    value={formData.originalText}
                    onChange={(e) => setFormData({ ...formData, originalText: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Translation */}
                <div>
                  <Label>Bản dịch (tiếng Việt)</Label>
                  <Textarea
                    value={formData.textTranslation}
                    onChange={(e) => setFormData({ ...formData, textTranslation: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Words */}
                <div>
                  <Label>Từ vựng</Label>
                  <div className="space-y-2 mt-2">
                    {formData.words.map((word, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <div className="flex-1">
                          <span className="font-medium text-blue-600">{word.word}</span>
                          <span className="text-gray-600 ml-2">- {word.meaning}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWord(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Word"
                      value={newWord.word}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    />
                    <Input
                      placeholder="Meaning"
                      value={newWord.meaning}
                      onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                    />
                    <Button onClick={addWord} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={() => {
                  toast({
                    title: 'Thông báo',
                    description: 'Tính năng chỉnh sửa đang được phát triển'
                  })
                  setShowEditDialog(false)
                }}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Xác nhận xóa đoạn
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa đoạn số {breakToDelete}?
                  <br />
                  <span className="text-red-600 text-sm mt-2 block">
                    ⚠️ Hành động này không thể hoàn tác!
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={() => {
                  toast({
                    title: 'Thông báo',
                    description: 'Tính năng xóa đang được phát triển'
                  })
                  setShowDeleteDialog(false)
                }}>
                  Xóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
