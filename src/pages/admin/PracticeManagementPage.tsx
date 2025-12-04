import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Search, BookText, Mic, AlertCircle, Video, BookOpen, Plus, PenTool } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import AdminMenu from '@/components/AdminMenu'
import { vocabularyApi, dictationApi } from '@/api/practiceApi'
import { adminWritingApi } from '@/api/adminWritingApi'
import type { WritingPrompt } from '@/api/adminWritingApi'

interface VocabularySet {
  _id: string
  part_of_speech: string
  day_number: number
  title: string
  description?: string
  is_free: boolean
  cards?: FlashCard[]  // Chỉ có khi get by ID
  total_cards?: number // Có khi get list
  createdAt: string
}

interface FlashCard {
  _id?: string
  term: string
  mainMeaning: string
  example?: string
  ipa?: string
  collocations?: Array<{
    phrase: string
    meaning: string
  }>
  audioUS_url?: string
  audioUK_url?: string
}

interface Dictation {
  _id: string
  title: string
  youtubeVideoId: string
  lessonTranslation: string
  breaks: DictationBreak[]
  createdAt: string
}

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

const PART_OF_SPEECH_MAP: Record<string, { label: string; icon: string; color: string }> = {
  noun: { label: 'Danh từ', icon: '📚', color: 'bg-green-100 text-green-800' },
  verb: { label: 'Động từ', icon: '🎬', color: 'bg-blue-100 text-blue-800' },
  adjective: { label: 'Tính từ', icon: '🎨', color: 'bg-orange-100 text-orange-800' },
  adverb: { label: 'Trạng từ', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' }
}

export default function PracticeManagementPage() {
  const navigate = useNavigate()
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([])
  const [dictations, setDictations] = useState<Dictation[]>([])
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchVocab, setSearchVocab] = useState('')
  const [searchDictation, setSearchDictation] = useState('')
  const [searchWriting, setSearchWriting] = useState('')
  const [selectedPartOfSpeech, setSelectedPartOfSpeech] = useState<string>('all')
  const [showDeleteVocabDialog, setShowDeleteVocabDialog] = useState(false)
  const [showDeleteDictationDialog, setShowDeleteDictationDialog] = useState(false)
  const [showDeleteWritingDialog, setShowDeleteWritingDialog] = useState(false)
  const [selectedVocabSets, setSelectedVocabSets] = useState<string[]>([])
  const [selectedDictations, setSelectedDictations] = useState<string[]>([])
  const [selectedWritingPrompts, setSelectedWritingPrompts] = useState<string[]>([])
  const [showCreateSetDialog, setShowCreateSetDialog] = useState(false)
  const [showCreateDictationDialog, setShowCreateDictationDialog] = useState(false)
  const [showCreateWritingDialog, setShowCreateWritingDialog] = useState(false)
  const [showEditWritingDialog, setShowEditWritingDialog] = useState(false)
  const [editingWritingPrompt, setEditingWritingPrompt] = useState<WritingPrompt | null>(null)
  const [createSetForm, setCreateSetForm] = useState({
    part_of_speech: 'noun',
    day_number: 1,
    title: '',
    description: '',
    is_free: true
  })
  const [createDictationForm, setCreateDictationForm] = useState({
    title: '',
    youtubeVideoId: ''
  })
  const [createWritingForm, setCreateWritingForm] = useState({
    type: 'image' as 'text' | 'image',
    required_words: '',
    imageFile: null as File | null,
    image_description: ''
  })
  const [editWritingForm, setEditWritingForm] = useState({
    type: 'image' as 'text' | 'image',
    required_words: '',
    imageFile: null as File | null,
    removeImage: false,
    image_description: ''
  })
  const { toast } = useToast()

  // Fetch data
  useEffect(() => {
    fetchVocabularySets()
    fetchDictations()
    fetchWritingPrompts()
  }, [])

  const fetchVocabularySets = async () => {
    try {
      setLoading(true)
      const response = await vocabularyApi.getAllSets()
      const vocabData = response.data?.data || []
      setVocabularySets(Array.isArray(vocabData) ? vocabData : [])
    } catch (error: any) {
      console.error('Error fetching vocabulary sets:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải danh sách từ vựng'
      })
      setVocabularySets([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDictations = async () => {
    try {
      const response = await dictationApi.getAll()
      const dictData = response.data?.data || []
      setDictations(Array.isArray(dictData) ? dictData : [])
    } catch (error: any) {
      console.error('Error fetching dictations:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải danh sách chính tả'
      })
      setDictations([])
    }
  }

  const fetchWritingPrompts = async () => {
    try {
      const prompts = await adminWritingApi.getAllWritingPrompts()
      setWritingPrompts(Array.isArray(prompts) ? prompts : [])
    } catch (error: any) {
      console.error('Error fetching writing prompts:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải danh sách đề writing'
      })
      setWritingPrompts([])
    }
  }

  // Delete vocabulary sets
  const handleDeleteVocabSets = async () => {
    try {
      await vocabularyApi.deleteSets(selectedVocabSets)
      
      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedVocabSets.length} bộ từ vựng`
      })
      
      setSelectedVocabSets([])
      setShowDeleteVocabDialog(false)
      fetchVocabularySets()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa bộ từ vựng'
      })
    }
  }

  // Delete dictations
  const handleDeleteDictations = async () => {
    try {
      await dictationApi.delete(selectedDictations)
      
      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedDictations.length} bài chính tả`
      })
      
      setSelectedDictations([])
      setShowDeleteDictationDialog(false)
      fetchDictations()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa bài chính tả'
      })
    }
  }

  const handleCreateSet = async () => {
    try {
      const response = await vocabularyApi.createSet(createSetForm)
      const setId = response.data._id
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo bộ từ vựng mới. Chuyển sang trang thêm từ...'
      })
      
      setShowCreateSetDialog(false)
      
      // Reset form
      setCreateSetForm({
        part_of_speech: 'noun',
        day_number: 1,
        title: '',
        description: '',
        is_free: true
      })
      
      // Navigate to detail page to add words
      navigate(`/admin/vocabulary/${setId}`)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo bộ từ vựng'
      })
    }
  }

  const handleCreateDictation = async () => {
    try {
      // Validate
      if (!createDictationForm.title || !createDictationForm.youtubeVideoId) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Vui lòng điền đầy đủ tên bài và YouTube Video ID'
        })
        return
      }

      // Validate YouTube ID format (11 characters)
      if (!/^[a-zA-Z0-9_-]{11}$/.test(createDictationForm.youtubeVideoId)) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'YouTube Video ID không hợp lệ (phải là 11 ký tự)'
        })
        return
      }

      const response = await dictationApi.create({
        title: createDictationForm.title,
        youtubeVideoId: createDictationForm.youtubeVideoId
      })
      
      const dictationId = response.data._id
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo bài chính tả mới. Chuyển sang trang chi tiết...'
      })
      
      setShowCreateDictationDialog(false)
      
      // Reset form
      setCreateDictationForm({
        title: '',
        youtubeVideoId: ''
      })
      
      // Navigate to detail page
      navigate(`/admin/dictation/${dictationId}`)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo bài chính tả'
      })
    }
  }

  // Delete writing prompts
  const handleDeleteWritingPrompts = async () => {
    try {
      await Promise.all(selectedWritingPrompts.map(id => adminWritingApi.deleteWritingPrompt(id)))
      
      toast({
        title: 'Thành công',
        description: `Đã xóa ${selectedWritingPrompts.length} đề writing`
      })
      
      setSelectedWritingPrompts([])
      setShowDeleteWritingDialog(false)
      fetchWritingPrompts()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa đề writing'
      })
    }
  }

  const handleCreateWritingPrompt = async () => {
    try {
      if (!createWritingForm.required_words) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Vui lòng nhập đúng 2 từ yêu cầu (cách nhau bởi dấu phẩy)'
        })
        return
      }

      const wordsArray = createWritingForm.required_words.split(',').map(w => w.trim()).filter(w => w)
      
      if (wordsArray.length !== 2) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Phải nhập đúng 2 từ yêu cầu (hiện tại: ' + wordsArray.length + ' từ)'
        })
        return
      }

      if (createWritingForm.type === 'image' && !createWritingForm.imageFile) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Vui lòng chọn ảnh cho đề writing'
        })
        return
      }

      await adminWritingApi.createWritingPrompt({
        type: createWritingForm.type,
        required_words: wordsArray,
        image: createWritingForm.imageFile || undefined,
        image_description: createWritingForm.image_description || undefined
      })
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo đề writing mới'
      })
      
      setShowCreateWritingDialog(false)
      
      // Reset form
      setCreateWritingForm({
        type: 'image',
        required_words: '',
        imageFile: null,
        image_description: ''
      })
      
      fetchWritingPrompts()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo đề writing'
      })
    }
  }

  const handleEditWritingPrompt = async () => {
    try {
      if (!editingWritingPrompt) return

      if (!editWritingForm.required_words) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Vui lòng nhập đúng 2 từ yêu cầu (cách nhau bởi dấu phẩy)'
        })
        return
      }

      const wordsArray = editWritingForm.required_words.split(',').map(w => w.trim()).filter(w => w)
      
      if (wordsArray.length !== 2) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Phải nhập đúng 2 từ yêu cầu (hiện tại: ' + wordsArray.length + ' từ)'
        })
        return
      }

      if (editWritingForm.type === 'image' && !editingWritingPrompt.image_url && !editWritingForm.imageFile) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Đề hình ảnh phải có ảnh'
        })
        return
      }

      await adminWritingApi.updateWritingPrompt(editingWritingPrompt._id, {
        type: editWritingForm.type,
        required_words: wordsArray,
        image: editWritingForm.imageFile || undefined,
        remove_image: editWritingForm.removeImage,
        image_description: editWritingForm.image_description || undefined
      })
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật đề writing'
      })
      
      setShowEditWritingDialog(false)
      setEditingWritingPrompt(null)
      
      // Reset form
      setEditWritingForm({
        type: 'image',
        required_words: '',
        imageFile: null,
        removeImage: false,
        image_description: ''
      })
      
      fetchWritingPrompts()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật đề writing'
      })
    }
  }

  const openEditWritingDialog = (prompt: WritingPrompt) => {
    setEditingWritingPrompt(prompt)
    setEditWritingForm({
      type: prompt.type,
      required_words: (prompt.required_words || []).join(', '),
      imageFile: null,
      removeImage: false,
      image_description: prompt.image_description || ''
    })
    setShowEditWritingDialog(true)
  }

  // Toggle selection
  const toggleVocabSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedVocabSets(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleDictationSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDictations(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleWritingSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWritingPrompts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleVocabCardClick = (id: string) => {
    if (selectedVocabSets.length === 0) {
      navigate(`/admin/vocabulary/${id}`)
    }
  }

  const handleDictationCardClick = (id: string) => {
    if (selectedDictations.length === 0) {
      navigate(`/admin/dictation/${id}`)
    }
  }

  // Filter data
  const filteredVocabSets = Array.isArray(vocabularySets) ? vocabularySets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchVocab.toLowerCase()) ||
      set.part_of_speech.toLowerCase().includes(searchVocab.toLowerCase())
    const matchesPartOfSpeech = selectedPartOfSpeech === 'all' || set.part_of_speech === selectedPartOfSpeech
    return matchesSearch && matchesPartOfSpeech
  }) : []

  const filteredDictations = Array.isArray(dictations) ? dictations.filter(dict =>
    dict.title.toLowerCase().includes(searchDictation.toLowerCase())
  ) : []

  const filteredWritingPrompts = Array.isArray(writingPrompts) ? writingPrompts.filter(prompt =>
    (prompt.required_words || []).join(', ').toLowerCase().includes(searchWriting.toLowerCase()) ||
    prompt.type.toLowerCase().includes(searchWriting.toLowerCase())
  ) : []

  const getPartOfSpeechInfo = (pos: string) => {
    return PART_OF_SPEECH_MAP[pos] || { label: pos, icon: '📖', color: 'bg-gray-100 text-gray-800' }
  }

  // Stats
  const vocabStats = {
    total: vocabularySets.length,
    free: vocabularySets.filter(s => s.is_free).length,
    noun: vocabularySets.filter(s => s.part_of_speech === 'noun').length,
    verb: vocabularySets.filter(s => s.part_of_speech === 'verb').length,
    adjective: vocabularySets.filter(s => s.part_of_speech === 'adjective').length,
    adverb: vocabularySets.filter(s => s.part_of_speech === 'adverb').length
  }

  const dictStats = {
    total: dictations.length,
    totalBreaks: dictations.reduce((sum, d) => sum + (d.breaks?.length || 0), 0)
  }

  const writingStats = {
    total: writingPrompts.length,
    textType: writingPrompts.filter(p => p.type === 'text').length,
    imageType: writingPrompts.filter(p => p.type === 'image').length
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Quản lý Ôn luyện</h1>
            <p className="text-gray-600">Quản lý bài từ vựng và chính tả</p>
          </div>

          <Tabs defaultValue="vocabulary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                <BookText className="w-4 h-4" />
                Từ vựng ({vocabularySets.length})
              </TabsTrigger>
              <TabsTrigger value="dictation" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Chính tả ({dictations.length})
              </TabsTrigger>
              <TabsTrigger value="writing" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Writing ({writingPrompts.length})
              </TabsTrigger>
            </TabsList>

            {/* VOCABULARY TAB */}
            <TabsContent value="vocabulary" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-blue-600">{vocabStats.total}</div>
                    <div className="text-xs text-gray-600 mt-1">Tổng số bộ</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-green-600">{vocabStats.free}</div>
                    <div className="text-xs text-gray-600 mt-1">Miễn phí</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-xl font-bold">📚 {vocabStats.noun}</div>
                    <div className="text-xs text-gray-600 mt-1">Danh từ</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-xl font-bold">🎬 {vocabStats.verb}</div>
                    <div className="text-xs text-gray-600 mt-1">Động từ</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-xl font-bold">🎨 {vocabStats.adjective}</div>
                    <div className="text-xs text-gray-600 mt-1">Tính từ</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-xl font-bold">⚡ {vocabStats.adverb}</div>
                    <div className="text-xs text-gray-600 mt-1">Trạng từ</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowCreateSetDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tạo bộ từ vựng mới
                </Button>

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm bộ từ vựng..."
                    value={searchVocab}
                    onChange={(e) => setSearchVocab(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {['all', 'noun', 'verb', 'adjective', 'adverb'].map(pos => {
                    const info = pos === 'all' 
                      ? { label: 'Tất cả', icon: '🔤', color: 'bg-gray-100' }
                      : PART_OF_SPEECH_MAP[pos]
                    return (
                      <Button
                        key={pos}
                        variant={selectedPartOfSpeech === pos ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPartOfSpeech(pos)}
                        className="gap-1"
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </Button>
                    )
                  })}
                </div>

                {selectedVocabSets.length > 0 ? (
                  <>
                    <Badge variant="secondary">
                      {selectedVocabSets.length} đã chọn
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVocabSets([])}
                    >
                      Hủy chọn
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteVocabDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (filteredVocabSets.length > 0) {
                        setSelectedVocabSets([filteredVocabSets[0]._id])
                      }
                    }}
                  >
                    Chọn nhiều
                  </Button>
                )}
              </div>

              {/* Vocabulary Cards Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
                </div>
              ) : filteredVocabSets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Không tìm thấy bộ từ vựng nào</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVocabSets.map((set) => {
                    const posInfo = getPartOfSpeechInfo(set.part_of_speech)
                    const isSelected = selectedVocabSets.includes(set._id)
                    
                    return (
                      <Card
                        key={set._id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
                        }`}
                        onClick={() => handleVocabCardClick(set._id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={posInfo.color}>
                                {posInfo.icon} {posInfo.label}
                              </Badge>
                              <Badge variant="outline">Day {set.day_number}</Badge>
                              {set.is_free && (
                                <Badge className="bg-green-100 text-green-800">Miễn phí</Badge>
                              )}
                            </div>
                            {selectedVocabSets.length > 0 && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleVocabSelection(set._id, e as any)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 cursor-pointer"
                              />
                            )}
                          </div>
                          <CardTitle className="text-lg">{set.title}</CardTitle>
                          <CardDescription>
                            {set.description || 'Không có mô tả'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-gray-600">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {set.total_cards ?? set.cards?.length ?? 0} từ
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(set.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* DICTATION TAB */}
            <TabsContent value="dictation" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-purple-600">{dictStats.total}</div>
                    <div className="text-xs text-gray-600 mt-1">Tổng bài học</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-blue-600">{dictStats.totalBreaks}</div>
                    <div className="text-xs text-gray-600 mt-1">Tổng đoạn</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Actions */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm bài chính tả..."
                    value={searchDictation}
                    onChange={(e) => setSearchDictation(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button
                  onClick={() => setShowCreateDictationDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo bài chính tả mới
                </Button>

                {selectedDictations.length > 0 ? (
                  <>
                    <Badge variant="secondary">
                      {selectedDictations.length} đã chọn
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDictations([])}
                    >
                      Hủy chọn
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDictationDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (filteredDictations.length > 0) {
                        setSelectedDictations([filteredDictations[0]._id])
                      }
                    }}
                  >
                    Chọn nhiều
                  </Button>
                )}
              </div>

              {/* Dictation Cards Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
                </div>
              ) : filteredDictations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Không tìm thấy bài chính tả nào</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDictations.map((dict, index) => {
                    const isSelected = selectedDictations.includes(dict._id)
                    
                    return (
                      <Card
                        key={dict._id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? 'ring-2 ring-purple-600 bg-purple-50' : ''
                        }`}
                        onClick={() => handleDictationCardClick(dict._id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Bài {index + 1}</Badge>
                            {selectedDictations.length > 0 && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleDictationSelection(dict._id, e as any)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 cursor-pointer"
                              />
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{dict.title}</CardTitle>
                          <CardDescription className="line-clamp-2 italic">
                            "{dict.lessonTranslation}"
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* YouTube Thumbnail */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={`https://img.youtube.com/vi/${dict.youtubeVideoId}/mqdefault.jpg`}
                              alt={dict.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/320x180?text=YouTube+Video'
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-gray-600">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {dict.breaks?.length || 0} đoạn
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                YouTube
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(dict.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* WRITING TAB */}
            <TabsContent value="writing" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-blue-600">{writingStats.total}</div>
                    <div className="text-xs text-gray-600 mt-1">Tổng số đề</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-purple-600">{writingStats.textType}</div>
                    <div className="text-xs text-gray-600 mt-1">Đề Text</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-orange-600">{writingStats.imageType}</div>
                    <div className="text-xs text-gray-600 mt-1">Đề Hình ảnh</div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowCreateWritingDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tạo đề writing mới
                </Button>

                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo từ yêu cầu hoặc loại..."
                    value={searchWriting}
                    onChange={(e) => setSearchWriting(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {selectedWritingPrompts.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteWritingDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa ({selectedWritingPrompts.length})
                  </Button>
                )}
              </div>

              {/* Writing Prompts List */}
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Đang tải...
                </div>
              ) : filteredWritingPrompts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Chưa có đề writing nào</p>
                  <p className="text-sm mt-2">Nhấn "Tạo đề writing mới" để bắt đầu</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWritingPrompts.map((prompt) => {
                    const isSelected = selectedWritingPrompts.includes(prompt._id)
                    return (
                      <Card
                        key={prompt._id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          // Nếu không có item nào được select, click vào card sẽ mở edit
                          if (selectedWritingPrompts.length === 0) {
                            openEditWritingDialog(prompt)
                          } else {
                            toggleWritingSelection(prompt._id, e)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <Badge className={prompt.type === 'text' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}>
                                {prompt.type === 'text' ? '📝 Text' : '🖼️ Hình ảnh'}
                              </Badge>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleWritingSelection(prompt._id, e)
                              }}
                              className="w-4 h-4 accent-blue-600"
                            />
                          </div>
                          
                          {prompt.image_url && (
                            <div className="mb-3">
                              <img
                                src={prompt.image_url}
                                alt="Writing prompt"
                                className="w-full h-32 object-cover rounded-md"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              <strong>Từ yêu cầu:</strong>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {(prompt.required_words || []).map((word, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {word}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(prompt.createdAt || '').toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Create Vocabulary Set Dialog */}
          <Dialog open={showCreateSetDialog} onOpenChange={setShowCreateSetDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo bộ từ vựng mới</DialogTitle>
                <DialogDescription>
                  Tạo một bộ từ vựng mới. Sau khi tạo, bạn có thể thêm các từ vào bộ này.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Part of Speech */}
                <div>
                  <Label htmlFor="part_of_speech">Loại từ *</Label>
                  <Select
                    value={createSetForm.part_of_speech}
                    onValueChange={(value) => setCreateSetForm({ ...createSetForm, part_of_speech: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noun">📚 Danh từ (Noun)</SelectItem>
                      <SelectItem value="verb">🎬 Động từ (Verb)</SelectItem>
                      <SelectItem value="adjective">🎨 Tính từ (Adjective)</SelectItem>
                      <SelectItem value="adverb">⚡ Trạng từ (Adverb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Day Number */}
                <div>
                  <Label htmlFor="day_number">Số ngày *</Label>
                  <Input
                    id="day_number"
                    type="number"
                    min="1"
                    value={createSetForm.day_number}
                    onChange={(e) => setCreateSetForm({ ...createSetForm, day_number: parseInt(e.target.value) || 1 })}
                    placeholder="VD: 1, 2, 3..."
                  />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    value={createSetForm.title}
                    onChange={(e) => setCreateSetForm({ ...createSetForm, title: e.target.value })}
                    placeholder="VD: Danh từ ngày 1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={createSetForm.description}
                    onChange={(e) => setCreateSetForm({ ...createSetForm, description: e.target.value })}
                    placeholder="Mô tả ngắn về bộ từ vựng này..."
                    rows={3}
                  />
                </div>

                {/* Is Free */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={createSetForm.is_free}
                    onChange={(e) => setCreateSetForm({ ...createSetForm, is_free: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="is_free" className="cursor-pointer">
                    Miễn phí cho học viên
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateSetDialog(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateSet}
                  disabled={!createSetForm.title || !createSetForm.part_of_speech}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo và thêm từ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Vocabulary Confirmation */}
          <Dialog open={showDeleteVocabDialog} onOpenChange={setShowDeleteVocabDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Xác nhận xóa bộ từ vựng
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa <strong>{selectedVocabSets.length}</strong> bộ từ vựng đã chọn?
                  <br />
                  <span className="text-red-600 text-sm mt-2 block">
                    ⚠️ Hành động này không thể hoàn tác!
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteVocabDialog(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDeleteVocabSets}>
                  Xóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Dictation Dialog */}
          <Dialog open={showCreateDictationDialog} onOpenChange={setShowCreateDictationDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo bài chính tả mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin cơ bản để tạo bài chính tả. Sau đó bạn có thể thêm các đoạn chi tiết.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="dict_title">
                    Tên bài học <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dict_title"
                    placeholder="Ví dụ: Balancing Study and Life"
                    value={createDictationForm.title}
                    onChange={(e) => setCreateDictationForm({ ...createDictationForm, title: e.target.value })}
                  />
                </div>

                {/* YouTube Video ID */}
                <div>
                  <Label htmlFor="youtube_id">
                    YouTube Video ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="youtube_id"
                    placeholder="Ví dụ: ElM4KYvoOA0 (từ link youtube.com/watch?v=ElM4KYvoOA0)"
                    value={createDictationForm.youtubeVideoId}
                    onChange={(e) => setCreateDictationForm({ ...createDictationForm, youtubeVideoId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Lấy từ URL YouTube. VD: youtube.com/watch?v=<strong>ElM4KYvoOA0</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    ✨ Bản dịch sẽ được tự động tạo bởi AI
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">📝 Hướng dẫn</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Chỉ cần nhập tên bài và YouTube Video ID</li>
                        <li>✨ AI sẽ tự động dịch tên bài sang tiếng Việt</li>
                        <li>Sau khi tạo, bạn sẽ được chuyển đến trang chi tiết để thêm các đoạn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDictationDialog(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateDictation}
                  disabled={!createDictationForm.title || !createDictationForm.youtubeVideoId}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo và thêm đoạn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dictation Confirmation */}
          <Dialog open={showDeleteDictationDialog} onOpenChange={setShowDeleteDictationDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Xác nhận xóa bài chính tả
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa <strong>{selectedDictations.length}</strong> bài chính tả đã chọn?
                  <br />
                  <span className="text-red-600 text-sm mt-2 block">
                    ⚠️ Hành động này không thể hoàn tác!
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDictationDialog(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDeleteDictations}>
                  Xóa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Writing Prompt Dialog */}
          <Dialog open={showCreateWritingDialog} onOpenChange={setShowCreateWritingDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo đề writing mới</DialogTitle>
                <DialogDescription>
                  Tạo một đề writing có hình ảnh hoặc dạng text (phải nhập đúng 2 từ yêu cầu)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <Label htmlFor="type">Loại đề *</Label>
                  <Select
                    value={createWritingForm.type}
                    onValueChange={(value: 'text' | 'image') => setCreateWritingForm({ ...createWritingForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Text</SelectItem>
                      <SelectItem value="image">🖼️ Hình ảnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Words */}
                <div>
                  <Label htmlFor="required_words">2 từ yêu cầu * (cách nhau bởi dấu phẩy)</Label>
                  <Input
                    id="required_words"
                    placeholder="Ví dụ: coffee, filter"
                    value={createWritingForm.required_words}
                    onChange={(e) => setCreateWritingForm({ ...createWritingForm, required_words: e.target.value })}
                  />
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    ⚠️ Phải nhập đúng 2 từ, cách nhau bởi dấu phẩy
                  </p>
                </div>

                {/* Image Description */}
                <div>
                  <Label htmlFor="image_description">Mô tả tranh (không bắt buộc)</Label>
                  <Textarea
                    id="image_description"
                    placeholder="Mô tả ngắn gọn về bức tranh..."
                    value={createWritingForm.image_description}
                    onChange={(e) => setCreateWritingForm({ ...createWritingForm, image_description: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Image Upload */}
                {createWritingForm.type === 'image' && (
                  <div>
                    <Label htmlFor="image">Tải ảnh lên * (.jpg, .jpeg, .png, .webp - tối đa 5MB)</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              variant: 'destructive',
                              title: 'Lỗi',
                              description: 'Ảnh không được vượt quá 5MB'
                            })
                            e.target.value = ''
                            return
                          }
                          setCreateWritingForm({ ...createWritingForm, imageFile: file })
                        }
                      }}
                    />
                    {createWritingForm.imageFile && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(createWritingForm.imageFile)}
                          alt="Preview"
                          className="max-w-xs rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateWritingDialog(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateWritingPrompt}
                  disabled={!createWritingForm.required_words || (createWritingForm.type === 'image' && !createWritingForm.imageFile)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo đề
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Writing Prompt Dialog */}
          <Dialog open={showEditWritingDialog} onOpenChange={setShowEditWritingDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa đề writing</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin đề writing (phải nhập đúng 2 từ yêu cầu)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <Label htmlFor="edit_type">Loại đề *</Label>
                  <Select
                    value={editWritingForm.type}
                    onValueChange={(value: 'text' | 'image') => setEditWritingForm({ ...editWritingForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">📝 Text</SelectItem>
                      <SelectItem value="image">🖼️ Hình ảnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Words */}
                <div>
                  <Label htmlFor="edit_required_words">2 từ yêu cầu * (cách nhau bởi dấu phẩy)</Label>
                  <Input
                    id="edit_required_words"
                    placeholder="Ví dụ: coffee, filter"
                    value={editWritingForm.required_words}
                    onChange={(e) => setEditWritingForm({ ...editWritingForm, required_words: e.target.value })}
                  />
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    ⚠️ Phải nhập đúng 2 từ, cách nhau bởi dấu phẩy
                  </p>
                </div>

                {/* Image Description */}
                <div>
                  <Label htmlFor="edit_image_description">Mô tả tranh (không bắt buộc)</Label>
                  <Textarea
                    id="edit_image_description"
                    placeholder="Mô tả ngắn gọn về bức tranh..."
                    value={editWritingForm.image_description}
                    onChange={(e) => setEditWritingForm({ ...editWritingForm, image_description: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Current Image */}
                {editingWritingPrompt?.image_url && !editWritingForm.removeImage && (
                  <div>
                    <Label>Ảnh hiện tại</Label>
                    <div className="mt-2 relative">
                      <img
                        src={editingWritingPrompt.image_url}
                        alt="Current"
                        className="max-w-xs rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => setEditWritingForm({ ...editWritingForm, removeImage: true })}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                {editWritingForm.type === 'image' && (
                  <div>
                    <Label htmlFor="edit_image">
                      {editingWritingPrompt?.image_url && !editWritingForm.removeImage ? 'Thay thế ảnh' : 'Tải ảnh lên *'} 
                      {' '}(.jpg, .jpeg, .png, .webp - tối đa 5MB)
                    </Label>
                    <Input
                      id="edit_image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              variant: 'destructive',
                              title: 'Lỗi',
                              description: 'Ảnh không được vượt quá 5MB'
                            })
                            e.target.value = ''
                            return
                          }
                          setEditWritingForm({ ...editWritingForm, imageFile: file, removeImage: false })
                        }
                      }}
                    />
                    {editWritingForm.imageFile && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Ảnh mới:</p>
                        <img
                          src={URL.createObjectURL(editWritingForm.imageFile)}
                          alt="Preview"
                          className="max-w-xs rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowEditWritingDialog(false)
                  setEditingWritingPrompt(null)
                  setEditWritingForm({
                    type: 'image',
                    required_words: '',
                    imageFile: null,
                    removeImage: false,
                    image_description: ''
                  })
                }}>
                  Hủy
                </Button>
                <Button
                  onClick={handleEditWritingPrompt}
                  disabled={!editWritingForm.required_words}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Cập nhật
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Writing Prompt Confirmation */}
          <Dialog open={showDeleteWritingDialog} onOpenChange={setShowDeleteWritingDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Xác nhận xóa đề writing
                </DialogTitle>
                <DialogDescription>
                  Bạn có chắc chắn muốn xóa <strong>{selectedWritingPrompts.length}</strong> đề writing đã chọn?
                  <br />
                  <span className="text-red-600 text-sm mt-2 block">
                    ⚠️ Hành động này không thể hoàn tác! Ảnh sẽ bị xóa khỏi S3.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteWritingDialog(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={handleDeleteWritingPrompts}>
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
