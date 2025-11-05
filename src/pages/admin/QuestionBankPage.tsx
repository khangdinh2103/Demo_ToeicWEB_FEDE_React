import { useEffect, useState } from 'react'
import AdminMenu from '../../components/AdminMenu'
import { Search, Plus, Edit, Trash2, Filter, FileText, Volume2, Image, Headphones, FileVideo, Download, Upload } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'

type Choice = { 
  id: number; 
  text: string; 
  isCorrect?: boolean; 
  explanation?: string 
}

type Question = {
  id: number;
  title: string;
  content: string;
  type: 'audio' | 'audio_group' | 'image' | 'image_group' | 'reading' | 'mcq';
  level: 'easy' | 'medium' | 'hard';
  part: number;
  topic: string;
  choices: Choice[];
  explanation?: string;
  audioFile?: File | null;
  imageFile?: File | null;
  src?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedPart, setSelectedPart] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    title: '',
    content: '',
    type: 'mcq',
    level: 'medium',
    part: 1,
    topic: '',
    choices: [
      { id: 1, text: '', isCorrect: false },
      { id: 2, text: '', isCorrect: false },
      { id: 3, text: '', isCorrect: true },
      { id: 4, text: '', isCorrect: false }
    ],
    explanation: ''
  })

  // Question types for selection
  const questionTypes = [
    { id: 'mcq', name: 'Trắc nghiệm thường', icon: FileVideo, description: 'Câu hỏi trắc nghiệm không có media' },
    { id: 'audio', name: 'Câu hỏi Audio đơn', icon: Headphones, description: 'Nghe audio và trả lời 1 câu hỏi' },
    { id: 'audio_group', name: 'Nhóm câu hỏi Audio', icon: Volume2, description: 'Nghe audio và trả lời nhiều câu hỏi' },
    { id: 'image', name: 'Câu hỏi Hình ảnh đơn', icon: Image, description: 'Nhìn hình ảnh và trả lời 1 câu hỏi' },
    { id: 'image_group', name: 'Nhóm câu hỏi Hình ảnh', icon: Image, description: 'Nhìn hình ảnh và trả lời nhiều câu hỏi' },
    { id: 'reading', name: 'Câu hỏi Đọc hiểu', icon: FileText, description: 'Đọc đoạn văn và trả lời câu hỏi' }
  ]

  const levels = [
    { id: 'easy', name: 'Dễ', color: 'bg-green-100 text-green-800' },
    { id: 'medium', name: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'hard', name: 'Khó', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    const saved = localStorage.getItem('questionBank')
    if (saved) {
      const parsed = JSON.parse(saved)
      setQuestions(parsed)
      setFilteredQuestions(parsed)
    }
  }, [])

  useEffect(() => {
    let filtered = questions.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           q.topic.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || q.type === selectedType
      const matchesLevel = selectedLevel === 'all' || q.level === selectedLevel
      const matchesPart = selectedPart === 'all' || q.part.toString() === selectedPart
      
      return matchesSearch && matchesType && matchesLevel && matchesPart
    })
    setFilteredQuestions(filtered)
  }, [questions, searchTerm, selectedType, selectedLevel, selectedPart])

  const saveQuestions = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions)
    localStorage.setItem('questionBank', JSON.stringify(updatedQuestions))
  }

  const createQuestion = () => {
    if (!newQuestion.title || !newQuestion.content || !newQuestion.choices?.some(c => c.text)) {
      alert('Vui lòng điền đầy đủ thông tin câu hỏi')
      return
    }

    const question: Question = {
      id: Date.now(),
      title: newQuestion.title!,
      content: newQuestion.content!,
      type: newQuestion.type!,
      level: newQuestion.level!,
      part: newQuestion.part!,
      topic: newQuestion.topic!,
      choices: newQuestion.choices!,
      explanation: newQuestion.explanation || '',
      audioFile: newQuestion.audioFile,
      imageFile: newQuestion.imageFile,
      src: newQuestion.src,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updated = [...questions, question]
    saveQuestions(updated)
    setShowCreateDialog(false)
    resetNewQuestion()
  }

  const updateQuestion = () => {
    if (!editingQuestion) return

    const updated = questions.map(q => 
      q.id === editingQuestion.id 
        ? { ...editingQuestion, updatedAt: new Date().toISOString() }
        : q
    )
    saveQuestions(updated)
    setShowEditDialog(false)
    setEditingQuestion(null)
  }

  const deleteQuestion = (id: number) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')
    if (confirmed) {
      const updated = questions.filter(q => q.id !== id)
      saveQuestions(updated)
    }
  }

  const resetNewQuestion = () => {
    setNewQuestion({
      title: '',
      content: '',
      type: 'mcq',
      level: 'medium',
      part: 1,
      topic: '',
      choices: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
        { id: 3, text: '', isCorrect: true },
        { id: 4, text: '', isCorrect: false }
      ],
      explanation: ''
    })
  }

  const updateChoice = (questionData: Partial<Question>, choiceIndex: number, field: string, value: any) => {
    if (!questionData.choices) return

    const newChoices = questionData.choices.map((choice, index) => {
      if (index === choiceIndex) {
        if (field === 'isCorrect' && value) {
          // Only one choice can be correct
          return { ...choice, isCorrect: true }
        } else if (field === 'isCorrect' && !value) {
          return { ...choice, isCorrect: false }
        } else {
          return { ...choice, [field]: value }
        }
      } else if (field === 'isCorrect' && value) {
        // Uncheck other choices when marking one as correct
        return { ...choice, isCorrect: false }
      }
      return choice
    })

    return newChoices
  }

  const addChoice = (questionData: Partial<Question>) => {
    if (!questionData.choices) return []
    
    return [
      ...questionData.choices,
      { id: Date.now(), text: '', isCorrect: false }
    ]
  }

  const removeChoice = (questionData: Partial<Question>, choiceIndex: number) => {
    if (!questionData.choices || questionData.choices.length <= 2) return questionData.choices

    return questionData.choices.filter((_, index) => index !== choiceIndex)
  }

  const getTypeIcon = (type: string) => {
    const typeInfo = questionTypes.find(t => t.id === type)
    return typeInfo?.icon || FileText
  }

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'question-bank.json'
    link.click()
  }

  const importQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (Array.isArray(imported)) {
          const confirmed = window.confirm('Bạn có muốn thay thế toàn bộ ngân hàng câu hỏi hiện tại không?')
          if (confirmed) {
            saveQuestions(imported)
            alert('Đã import thành công!')
          }
        }
      } catch (error) {
        alert('File không hợp lệ!')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
                <p className="text-gray-600">Quản lý và tổ chức câu hỏi TOEIC</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{filteredQuestions.length}</span> / {questions.length} câu hỏi
                </div>
                
                {/* Import/Export */}
                <input
                  type="file"
                  accept=".json"
                  onChange={importQuestions}
                  className="hidden"
                  id="import-questions"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-questions')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportQuestions}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Tạo câu hỏi mới
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-60">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề, nội dung, chủ đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tất cả loại</option>
                {questionTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tất cả độ khó</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>

              <select
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tất cả Part</option>
                {[1, 2, 3, 4, 5, 6, 7].map(part => (
                  <option key={part} value={part.toString()}>Part {part}</option>
                ))}
              </select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Lọc nâng cao
              </Button>
            </div>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">
                  {questions.length === 0 ? 'Chưa có câu hỏi nào trong ngân hàng' : 'Không tìm thấy câu hỏi phù hợp'}
                </p>
                <p className="text-sm text-gray-400">
                  {questions.length === 0 ? 'Hãy tạo câu hỏi đầu tiên' : 'Thử thay đổi bộ lọc'}
                </p>
              </Card>
            ) : (
              filteredQuestions.map(question => {
                const TypeIcon = getTypeIcon(question.type)
                const levelInfo = levels.find(l => l.id === question.level)
                
                return (
                  <Card key={question.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-lg">{question.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelInfo?.color}`}>
                            {levelInfo?.name}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            Part {question.part}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{question.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📂 {question.topic}</span>
                          <span>🔢 {question.choices.length} đáp án</span>
                          <span>📅 {new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Create Dialog */}
          {showCreateDialog && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo câu hỏi mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tiêu đề câu hỏi</label>
                      <Input
                        value={newQuestion.title || ''}
                        onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                        placeholder="Nhập tiêu đề câu hỏi..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chủ đề</label>
                      <Input
                        value={newQuestion.topic || ''}
                        onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                        placeholder="VD: Grammar, Vocabulary, Listening..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nội dung câu hỏi</label>
                    <Textarea
                      value={newQuestion.content || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                      placeholder="Nhập nội dung câu hỏi..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Loại câu hỏi</label>
                      <select
                        value={newQuestion.type}
                        onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {questionTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Độ khó</label>
                      <select
                        value={newQuestion.level}
                        onChange={(e) => setNewQuestion({ ...newQuestion, level: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Part</label>
                      <select
                        value={newQuestion.part}
                        onChange={(e) => setNewQuestion({ ...newQuestion, part: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(part => (
                          <option key={part} value={part}>Part {part}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Media upload for audio/image questions */}
                  {(newQuestion.type === 'audio' || newQuestion.type === 'audio_group') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">File Audio</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setNewQuestion({ 
                              ...newQuestion, 
                              audioFile: file, 
                              src: URL.createObjectURL(file) 
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}

                  {(newQuestion.type === 'image' || newQuestion.type === 'image_group') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">File Hình ảnh</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setNewQuestion({ 
                              ...newQuestion, 
                              imageFile: file, 
                              src: URL.createObjectURL(file) 
                            })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Các đáp án</label>
                    <div className="space-y-3">
                      {newQuestion.choices?.map((choice, index) => (
                        <div key={choice.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <span className="font-medium text-sm">{String.fromCharCode(65 + index)}.</span>
                          <Input
                            value={choice.text}
                            onChange={(e) => {
                              const newChoices = updateChoice(newQuestion, index, 'text', e.target.value)
                              setNewQuestion({ ...newQuestion, choices: newChoices })
                            }}
                            placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correct-answer"
                              checked={choice.isCorrect}
                              onChange={() => {
                                const newChoices = updateChoice(newQuestion, index, 'isCorrect', true)
                                setNewQuestion({ ...newQuestion, choices: newChoices })
                              }}
                            />
                            <span className="text-sm">Đúng</span>
                          </label>
                          {newQuestion.choices!.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newChoices = removeChoice(newQuestion, index)
                                setNewQuestion({ ...newQuestion, choices: newChoices })
                              }}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newChoices = addChoice(newQuestion)
                          setNewQuestion({ ...newQuestion, choices: newChoices })
                        }}
                        className="w-full"
                      >
                        + Thêm đáp án
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Giải thích (tùy chọn)</label>
                    <Textarea
                      value={newQuestion.explanation || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      placeholder="Giải thích đáp án đúng..."
                      className="min-h-20"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Hủy
                    </Button>
                    <Button onClick={createQuestion}>
                      Tạo câu hỏi
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Dialog - Similar structure to Create Dialog */}
          {editingQuestion && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tiêu đề câu hỏi</label>
                      <Input
                        value={editingQuestion.title}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                        placeholder="Nhập tiêu đề câu hỏi..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Chủ đề</label>
                      <Input
                        value={editingQuestion.topic}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                        placeholder="VD: Grammar, Vocabulary, Listening..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Nội dung câu hỏi</label>
                    <Textarea
                      value={editingQuestion.content}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                      placeholder="Nhập nội dung câu hỏi..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Loại câu hỏi</label>
                      <select
                        value={editingQuestion.type}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {questionTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Độ khó</label>
                      <select
                        value={editingQuestion.level}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, level: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Part</label>
                      <select
                        value={editingQuestion.part}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, part: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(part => (
                          <option key={part} value={part}>Part {part}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Các đáp án</label>
                    <div className="space-y-3">
                      {editingQuestion.choices.map((choice, index) => (
                        <div key={choice.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <span className="font-medium text-sm">{String.fromCharCode(65 + index)}.</span>
                          <Input
                            value={choice.text}
                            onChange={(e) => {
                              const newChoices = editingQuestion.choices.map((c, i) => 
                                i === index ? { ...c, text: e.target.value } : c
                              )
                              setEditingQuestion({ ...editingQuestion, choices: newChoices })
                            }}
                            placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correct-answer-edit"
                              checked={choice.isCorrect}
                              onChange={() => {
                                const newChoices = editingQuestion.choices.map((c, i) => 
                                  ({ ...c, isCorrect: i === index })
                                )
                                setEditingQuestion({ ...editingQuestion, choices: newChoices })
                              }}
                            />
                            <span className="text-sm">Đúng</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Giải thích (tùy chọn)</label>
                    <Textarea
                      value={editingQuestion.explanation || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                      placeholder="Giải thích đáp án đúng..."
                      className="min-h-20"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      Hủy
                    </Button>
                    <Button onClick={updateQuestion}>
                      Cập nhật
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}
