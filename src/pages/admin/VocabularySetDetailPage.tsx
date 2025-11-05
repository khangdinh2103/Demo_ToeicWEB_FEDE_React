import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Volume2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import AdminMenu from '@/components/AdminMenu'
import { vocabularyApi } from '@/api/practiceApi'

interface FlashCard {
  _id?: string
  term: string
  main_meaning: string
  example?: string
  ipa?: string
  collocations?: Array<{
    phrase: string
    meaning: string
    _id?: string
  }>
  audio_us_url?: string
  audio_uk_url?: string
}

interface VocabularySet {
  _id: string
  part_of_speech: string
  day_number: number
  title: string
  description?: string
  is_free: boolean
  cards: FlashCard[]
  createdAt: string
}

const PART_OF_SPEECH_MAP: Record<string, { label: string; icon: string; color: string }> = {
  noun: { label: 'Danh từ', icon: '📚', color: 'bg-green-100 text-green-800' },
  verb: { label: 'Động từ', icon: '🎬', color: 'bg-blue-100 text-blue-800' },
  adjective: { label: 'Tính từ', icon: '🎨', color: 'bg-orange-100 text-orange-800' },
  adverb: { label: 'Trạng từ', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' }
}

export default function VocabularySetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [vocabularySet, setVocabularySet] = useState<VocabularySet | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [isAddingCard, setIsAddingCard] = useState(false)

  // Form state for new/edit card
  const [formData, setFormData] = useState<FlashCard>({
    term: '',
    main_meaning: '',
    example: '',
    ipa: '',
    collocations: [],
    audio_us_url: '',
    audio_uk_url: ''
  })

  // Collocation form
  const [newCollocation, setNewCollocation] = useState({ phrase: '', meaning: '' })

  useEffect(() => {
    if (id) {
      fetchVocabularySet()
    }
  }, [id])

  const fetchVocabularySet = async () => {
    try {
      setLoading(true)
      const response = await vocabularyApi.getSetById(id!)
      setVocabularySet(response.data)
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

  const handleAddCard = async () => {
    try {
      setIsAddingCard(true)
      toast({
        title: '⏳ Đang xử lý...',
        description: 'AI đang tạo phiên âm, ví dụ, collocations và audio. Vui lòng đợi 10-20 giây...'
      })
      
      await vocabularyApi.addFlashCards(id!, [formData])
      
      toast({
        title: '✅ Thành công',
        description: 'Đã thêm từ mới với đầy đủ thông tin từ AI!'
      })
      setShowAddDialog(false)
      resetForm()
      fetchVocabularySet()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể thêm từ'
      })
    } finally {
      setIsAddingCard(false)
    }
  }

  const handleEditCard = async () => {
    try {
      // Delete old card and add new one (since API doesn't have update)
      if (editingCard?._id) {
        await vocabularyApi.deleteFlashCards(id!, [editingCard._id])
      }
      await vocabularyApi.addFlashCards(id!, [formData])
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật từ'
      })
      setShowEditDialog(false)
      setEditingCard(null)
      resetForm()
      fetchVocabularySet()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật từ'
      })
    }
  }

  const handleDeleteCard = async () => {
    try {
      if (cardToDelete) {
        await vocabularyApi.deleteFlashCards(id!, [cardToDelete])
        toast({
          title: 'Thành công',
          description: 'Đã xóa từ'
        })
        setShowDeleteDialog(false)
        setCardToDelete(null)
        fetchVocabularySet()
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa từ'
      })
    }
  }

  const openEditDialog = (card: FlashCard) => {
    setEditingCard(card)
    setFormData({
      term: card.term,
      main_meaning: card.main_meaning,
      example: card.example || '',
      ipa: card.ipa || '',
      collocations: card.collocations || [],
      audio_us_url: card.audio_us_url || '',
      audio_uk_url: card.audio_uk_url || ''
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (cardId: string) => {
    setCardToDelete(cardId)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setFormData({
      term: '',
      main_meaning: '',
      example: '',
      ipa: '',
      collocations: [],
      audio_us_url: '',
      audio_uk_url: ''
    })
    setNewCollocation({ phrase: '', meaning: '' })
  }

  const addCollocation = () => {
    if (newCollocation.phrase && newCollocation.meaning) {
      setFormData({
        ...formData,
        collocations: [...(formData.collocations || []), newCollocation]
      })
      setNewCollocation({ phrase: '', meaning: '' })
    }
  }

  const removeCollocation = (index: number) => {
    setFormData({
      ...formData,
      collocations: formData.collocations?.filter((_, i) => i !== index)
    })
  }

  const playAudio = (url: string) => {
    const audio = new Audio(url)
    audio.play().catch(() => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể phát audio'
      })
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!vocabularySet) {
    return null
  }

  const posInfo = PART_OF_SPEECH_MAP[vocabularySet.part_of_speech] || { label: '', icon: '📖', color: 'bg-gray-100' }

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
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={posInfo.color}>
                    {posInfo.icon} {posInfo.label}
                  </Badge>
                  <Badge variant="outline">Day {vocabularySet.day_number}</Badge>
                  {vocabularySet.is_free && (
                    <Badge className="bg-green-100 text-green-800">Miễn phí</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{vocabularySet.title}</h1>
                <p className="text-gray-600">{vocabularySet.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {vocabularySet.cards.length} từ • Tạo ngày {new Date(vocabularySet.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm từ mới
              </Button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {vocabularySet.cards.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-4">Chưa có từ vựng nào</p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm từ đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              vocabularySet.cards.map((card, index) => (
                <Card key={card._id || index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl">{card.term}</CardTitle>
                          {card.ipa && (
                            <span className="text-blue-600 text-sm font-mono">{card.ipa}</span>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {card.main_meaning}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(card)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => card._id && openDeleteDialog(card._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Example */}
                    {card.example && (
                      <div>
                        <Label className="text-xs text-gray-500">VÍ DỤ</Label>
                        <p className="text-sm italic mt-1">"{card.example}"</p>
                      </div>
                    )}

                    {/* Audio */}
                    {(card.audio_us_url || card.audio_uk_url) && (
                      <div>
                        <Label className="text-xs text-gray-500">PHÁT ÂM</Label>
                        <div className="flex gap-2 mt-1">
                          {card.audio_us_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playAudio(card.audio_us_url!)}
                            >
                              <Volume2 className="w-4 h-4 mr-1" />
                              🇺🇸 US
                            </Button>
                          )}
                          {card.audio_uk_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => playAudio(card.audio_uk_url!)}
                            >
                              <Volume2 className="w-4 h-4 mr-1" />
                              🇬🇧 UK
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Collocations */}
                    {card.collocations && card.collocations.length > 0 && (
                      <div>
                        <Label className="text-xs text-gray-500">COLLOCATIONS</Label>
                        <div className="grid gap-2 mt-1">
                          {card.collocations.map((col, idx) => (
                            <div
                              key={col._id || idx}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <div>
                                <span className="font-medium">{col.phrase}</span>
                                <span className="text-gray-600 text-sm ml-2">- {col.meaning}</span>
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

          {/* Add Card Dialog */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm từ mới</DialogTitle>
                <DialogDescription>
                  Chỉ cần nhập từ tiếng Anh và nghĩa tiếng Việt. 
                  <br />
                  <span className="text-blue-600 font-medium">✨ AI sẽ tự động tạo phiên âm, ví dụ, collocations và audio!</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Term */}
                <div>
                  <Label htmlFor="term">Từ tiếng Anh *</Label>
                  <Input
                    id="term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="VD: initiative"
                    className="text-lg"
                  />
                </div>

                {/* Main Meaning */}
                <div>
                  <Label htmlFor="main_meaning">Nghĩa tiếng Việt *</Label>
                  <Input
                    id="main_meaning"
                    value={formData.main_meaning}
                    onChange={(e) => setFormData({ ...formData, main_meaning: e.target.value })}
                    placeholder="VD: sáng kiến, sự chủ động"
                    className="text-lg"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1 text-sm text-blue-800">
                      <p className="font-medium mb-1">AI sẽ tự động tạo:</p>
                      <ul className="space-y-1 ml-4 list-disc">
                        <li>🔤 Phiên âm IPA</li>
                        <li>📝 Ví dụ câu</li>
                        <li>🔗 Collocations (cụm từ đi kèm)</li>
                        <li>🔊 Audio US & UK (giọng đọc)</li>
                      </ul>
                      <p className="mt-2 text-xs text-blue-600">
                        ⏱️ Quá trình này có thể mất 10-20 giây
                      </p>
                    </div>
                  </div>
                </div>

                {/* Optional fields - collapsed by default */}
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    ⚙️ Tùy chọn nâng cao (không bắt buộc)
                  </summary>
                  
                  <div className="space-y-4 mt-4">
                    {/* IPA */}
                    <div>
                      <Label htmlFor="ipa">Phiên âm IPA (tùy chọn)</Label>
                      <Input
                        id="ipa"
                        value={formData.ipa}
                        onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
                        placeholder="VD: /ɪˈnɪʃ.ə.tɪv/ - Để trống AI sẽ tự tạo"
                      />
                    </div>

                    {/* Example */}
                    <div>
                      <Label htmlFor="example">Ví dụ (tùy chọn)</Label>
                      <Textarea
                        id="example"
                        value={formData.example}
                        onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                        placeholder="VD: We need someone who can take the initiative... - Để trống AI sẽ tự tạo"
                        rows={2}
                      />
                    </div>

                    {/* Audio URLs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="audio_us_url">Audio US URL (tùy chọn)</Label>
                        <Input
                          id="audio_us_url"
                          value={formData.audio_us_url}
                          onChange={(e) => setFormData({ ...formData, audio_us_url: e.target.value })}
                          placeholder="AI sẽ tự tạo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="audio_uk_url">Audio UK URL (tùy chọn)</Label>
                        <Input
                          id="audio_uk_url"
                          value={formData.audio_uk_url}
                          onChange={(e) => setFormData({ ...formData, audio_uk_url: e.target.value })}
                          placeholder="AI sẽ tự tạo"
                        />
                      </div>
                    </div>

                    {/* Collocations */}
                    <div>
                      <Label>Collocations (tùy chọn - AI sẽ tự tạo)</Label>
                      <div className="space-y-2 mt-2">
                        {formData.collocations?.map((col, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <div className="flex-1">
                              <span className="font-medium">{col.phrase}</span>
                              <span className="text-gray-600 text-sm ml-2">- {col.meaning}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCollocation(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Phrase"
                          value={newCollocation.phrase}
                          onChange={(e) => setNewCollocation({ ...newCollocation, phrase: e.target.value })}
                        />
                        <Input
                          placeholder="Meaning"
                          value={newCollocation.meaning}
                          onChange={(e) => setNewCollocation({ ...newCollocation, meaning: e.target.value })}
                        />
                        <Button onClick={addCollocation} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => { setShowAddDialog(false); resetForm() }}
                  disabled={isAddingCard}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddCard}
                  disabled={!formData.term || !formData.main_meaning || isAddingCard}
                  className="min-w-[140px]"
                >
                  {isAddingCard ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Thêm từ với AI
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Card Dialog - Same as Add but with edit handler */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa từ</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin cho từ vựng
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Same form as Add Dialog */}
                <div>
                  <Label htmlFor="edit-term">Từ vựng *</Label>
                  <Input
                    id="edit-term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-main_meaning">Nghĩa chính *</Label>
                  <Input
                    id="edit-main_meaning"
                    value={formData.main_meaning}
                    onChange={(e) => setFormData({ ...formData, main_meaning: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-ipa">Phiên âm IPA</Label>
                  <Input
                    id="edit-ipa"
                    value={formData.ipa}
                    onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-example">Ví dụ</Label>
                  <Textarea
                    id="edit-example"
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-audio_us_url">Audio US URL</Label>
                    <Input
                      id="edit-audio_us_url"
                      value={formData.audio_us_url}
                      onChange={(e) => setFormData({ ...formData, audio_us_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-audio_uk_url">Audio UK URL</Label>
                    <Input
                      id="edit-audio_uk_url"
                      value={formData.audio_uk_url}
                      onChange={(e) => setFormData({ ...formData, audio_uk_url: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Collocations</Label>
                  <div className="space-y-2 mt-2">
                    {formData.collocations?.map((col, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{col.phrase}</span>
                          <span className="text-gray-600 text-sm ml-2">- {col.meaning}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollocation(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Phrase"
                      value={newCollocation.phrase}
                      onChange={(e) => setNewCollocation({ ...newCollocation, phrase: e.target.value })}
                    />
                    <Input
                      placeholder="Meaning"
                      value={newCollocation.meaning}
                      onChange={(e) => setNewCollocation({ ...newCollocation, meaning: e.target.value })}
                    />
                    <Button onClick={addCollocation} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm() }}>
                  Hủy
                </Button>
                <Button
                  onClick={handleEditCard}
                  disabled={!formData.term || !formData.main_meaning}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Xác nhận xóa từ
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa từ này?
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
                <Button variant="destructive" onClick={handleDeleteCard}>
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
