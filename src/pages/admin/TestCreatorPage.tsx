import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminMenu from '../../components/AdminMenu'
import { Trash2, Upload, FileText, Plus, Loader2, ChevronRight, ChevronDown, ArrowUp, ArrowDown, Copy } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { useToast } from '../../hooks/use-toast'
import adminTestApi from '../../api/adminTestApi'

type Choice = { 
  id: string; 
  text: string; 
  isCorrect: boolean; 
}

type Question = {
  id: string;
  questionNumber: number;
  questionText: string;
  audio?: string;
  image?: string;
  options: Choice[];
  answer: string; // A, B, C, D
  explanation?: string;
  transcript?: string;
}

type Part = {
  id: string;
  partNumber: number;
  partName: string;
  questions: Question[];
  isExpanded: boolean;
}

type TestData = {
  title: string;
  year?: number;
  source?: string;
  time_limit?: number;
  passing_score?: number;
  parts: Part[];
}

export default function TestCreatorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState<TestData>({
    title: '',
    year: new Date().getFullYear(),
    source: '',
    time_limit: 120,
    passing_score: 495,
    parts: []
  })
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showAddPartDialog, setShowAddPartDialog] = useState(false)
  const [newPartNumber, setNewPartNumber] = useState('')

  // Add new part
  const addPart = () => {
    const partNum = parseInt(newPartNumber)
    if (isNaN(partNum) || partNum <= 0 || partNum > 7) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Part number phải từ 1-7",
      })
      return
    }

    if (testData.parts.some(p => p.partNumber === partNum)) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: `Part ${partNum} đã tồn tại`,
      })
      return
    }

    const newPart: Part = {
      id: `part_${Date.now()}`,
      partNumber: partNum,
      partName: `Part ${partNum}`,
      questions: [],
      isExpanded: true
    }

    setTestData({
      ...testData,
      parts: [...testData.parts, newPart].sort((a, b) => a.partNumber - b.partNumber)
    })
    setSelectedPart(newPart)
    setNewPartNumber('')
    setShowAddPartDialog(false)

    toast({
      title: "Thành công",
      description: `Đã thêm Part ${partNum}`,
    })
  }

  // Delete part
  const deletePart = (partId: string) => {
    const part = testData.parts.find(p => p.id === partId)
    if (!part) return

    if (part.questions.length > 0) {
      if (!window.confirm(`Part ${part.partNumber} có ${part.questions.length} câu hỏi. Bạn có chắc chắn muốn xóa?`)) {
        return
      }
    }

    setTestData({
      ...testData,
      parts: testData.parts.filter(p => p.id !== partId)
    })

    if (selectedPart?.id === partId) {
      setSelectedPart(null)
      setSelectedQuestion(null)
    }

    toast({
      title: "Đã xóa",
      description: `Đã xóa Part ${part.partNumber}`,
    })
  }

  // Add question to part
  const addQuestion = (partId: string) => {
    const part = testData.parts.find(p => p.id === partId)
    if (!part) return

    const nextQuestionNumber = part.questions.length > 0 
      ? Math.max(...part.questions.map(q => q.questionNumber)) + 1 
      : 1

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      questionNumber: nextQuestionNumber,
      questionText: '',
      options: [
        { id: `opt_${Date.now()}_A`, text: '', isCorrect: false },
        { id: `opt_${Date.now()}_B`, text: '', isCorrect: false },
        { id: `opt_${Date.now()}_C`, text: '', isCorrect: false },
        { id: `opt_${Date.now()}_D`, text: '', isCorrect: false }
      ],
      answer: '',
      explanation: '',
      transcript: ''
    }

    setTestData({
      ...testData,
      parts: testData.parts.map(p => 
        p.id === partId 
          ? { ...p, questions: [...p.questions, newQuestion] }
          : p
      )
    })

    setSelectedQuestion(newQuestion)

    toast({
      title: "Thành công",
      description: `Đã thêm câu hỏi ${nextQuestionNumber}`,
    })
  }

  // Delete question
  const deleteQuestion = (partId: string, questionId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      return
    }

    setTestData({
      ...testData,
      parts: testData.parts.map(p => 
        p.id === partId 
          ? { ...p, questions: p.questions.filter(q => q.id !== questionId) }
          : p
      )
    })

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null)
    }

    toast({
      title: "Đã xóa",
      description: "Đã xóa câu hỏi",
    })
  }

  // Duplicate question
  const duplicateQuestion = (partId: string, questionId: string) => {
    const part = testData.parts.find(p => p.id === partId)
    if (!part) return

    const question = part.questions.find(q => q.id === questionId)
    if (!question) return

    const newQuestion: Question = {
      ...question,
      id: `q_${Date.now()}`,
      questionNumber: part.questions.length + 1,
      options: question.options.map(opt => ({
        ...opt,
        id: `opt_${Date.now()}_${Math.random()}`
      }))
    }

    setTestData({
      ...testData,
      parts: testData.parts.map(p => 
        p.id === partId 
          ? { ...p, questions: [...p.questions, newQuestion] }
          : p
      )
    })

    toast({
      title: "Thành công",
      description: "Đã sao chép câu hỏi",
    })
  }

  // Move question up/down
  const moveQuestion = (partId: string, questionId: string, direction: 'up' | 'down') => {
    const part = testData.parts.find(p => p.id === partId)
    if (!part) return

    const index = part.questions.findIndex(q => q.id === questionId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= part.questions.length) return

    const newQuestions = [...part.questions]
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[newIndex]
    newQuestions[newIndex] = temp

    // Update question numbers
    newQuestions.forEach((q, idx) => {
      q.questionNumber = idx + 1
    })

    setTestData({
      ...testData,
      parts: testData.parts.map(p => 
        p.id === partId 
          ? { ...p, questions: newQuestions }
          : p
      )
    })
  }

  // Update question
  const updateQuestion = (partId: string, updatedQuestion: Question) => {
    setTestData({
      ...testData,
      parts: testData.parts.map(p => 
        p.id === partId 
          ? { ...p, questions: p.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q) }
          : p
      )
    })
  }

  // Toggle part expansion
  const togglePartExpansion = (partId: string) => {
    setTestData({
      ...testData,
      parts: testData.parts.map(p => 
        p.id === partId 
          ? { ...p, isExpanded: !p.isExpanded }
          : p
      )
    })
  }

  // Save test to backend
  const saveTest = async () => {
    if (!testData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập tên đề thi",
      })
      return
    }

    const totalQuestions = testData.parts.reduce((sum, part) => sum + part.questions.length, 0)
    if (totalQuestions === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng thêm ít nhất 1 câu hỏi",
      })
      return
    }

    setLoading(true)
    try {
      // 1. Create test first (without questions)
      const createTestData = {
        title: testData.title,
        year: testData.year,
        source: testData.source,
        time_limit: testData.time_limit,
        passing_score: testData.passing_score,
        parts: testData.parts.map(part => ({
          partNumber: part.partNumber,
          questionIds: [] // Will be filled after creating questions
        }))
      }

      const createdTest = await adminTestApi.createTest(createTestData)

      // 2. Create all questions
      let questionCount = 0
      for (const part of testData.parts) {
        for (const question of part.questions) {
          await adminTestApi.createQuestion(createdTest._id, {
            part: part.partNumber,
            questionNumber: question.questionNumber,
            questionText: question.questionText,
            audio: question.audio,
            image: question.image,
            options: {
              A: question.options[0]?.text || '',
              B: question.options[1]?.text || '',
              C: question.options[2]?.text || '',
              D: question.options[3]?.text || ''
            },
            answer: question.answer,
            explanation: question.explanation,
            transcript: question.transcript
          })
          questionCount++
        }
      }

      toast({
        title: "✅ Thành công",
        description: `Đã tạo đề thi "${testData.title}" với ${questionCount} câu hỏi`,
      })

      // 3. Navigate to edit page with correct route format
      navigate(`/admin/tests/edit/${createdTest._id}`)

    } catch (error: any) {
      console.error('Save test error:', error)
      toast({
        variant: "destructive",
        title: "❌ Lỗi",
        description: error.response?.data?.message || "Không thể lưu đề thi",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get total questions count
  const getTotalQuestions = () => {
    return testData.parts.reduce((total, part) => total + part.questions.length, 0)
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
                <h1 className="text-2xl font-bold text-gray-900">Tạo đề thi mới</h1>
                <p className="text-gray-600">Tạo đề thi TOEIC với các part và câu hỏi</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/admin/tests')}
                >
                  Hủy
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={saveTest}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Lưu đề thi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin đề thi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Tên đề thi *</label>
                <Input
                  value={testData.title}
                  onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                  placeholder="Ví dụ: ETS 2020 Test 1"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <Input
                  type="number"
                  value={testData.year}
                  onChange={(e) => setTestData({ ...testData, year: parseInt(e.target.value) || undefined })}
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nguồn</label>
                <Input
                  value={testData.source}
                  onChange={(e) => setTestData({ ...testData, source: e.target.value })}
                  placeholder="Ví dụ: ETS Official"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
                <Input
                  type="number"
                  value={testData.time_limit}
                  onChange={(e) => setTestData({ ...testData, time_limit: parseInt(e.target.value) || undefined })}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Điểm đạt</label>
                <Input
                  type="number"
                  value={testData.passing_score}
                  onChange={(e) => setTestData({ ...testData, passing_score: parseInt(e.target.value) || undefined })}
                  placeholder="495"
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-10 gap-6">
            {/* Left Panel - Parts List */}
            <div className="col-span-3 space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Danh sách Part ({testData.parts.length})</h3>
                  <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm Part
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm Part mới</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Số Part (1-7)</label>
                          <Input
                            type="number"
                            value={newPartNumber}
                            onChange={(e) => setNewPartNumber(e.target.value)}
                            placeholder="Nhập số part (1-7)"
                            min="1"
                            max="7"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setShowAddPartDialog(false)} variant="outline" className="flex-1">
                            Hủy
                          </Button>
                          <Button onClick={addPart} className="flex-1">
                            Thêm
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  {testData.parts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có part nào</p>
                      <p className="text-xs">Bấm "Thêm Part" để bắt đầu</p>
                    </div>
                  ) : (
                    testData.parts.map(part => (
                      <div key={part.id} className="border rounded-lg overflow-hidden">
                        <div 
                          className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                            selectedPart?.id === part.id ? 'bg-blue-50 border-blue-300' : 'bg-white'
                          }`}
                          onClick={() => setSelectedPart(part)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                togglePartExpansion(part.id)
                              }}
                            >
                              {part.isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <div>
                              <div className="font-medium">Part {part.partNumber}</div>
                              <div className="text-xs text-gray-500">{part.questions.length} câu hỏi</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                addQuestion(part.id)
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePart(part.id)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {part.isExpanded && part.questions.length > 0 && (
                          <div className="border-t bg-gray-50 p-2 space-y-1">
                            {part.questions.map((question, idx) => (
                              <div
                                key={question.id}
                                className={`p-2 rounded flex items-center justify-between cursor-pointer hover:bg-white ${
                                  selectedQuestion?.id === question.id ? 'bg-blue-100' : 'bg-gray-50'
                                }`}
                                onClick={() => setSelectedQuestion(question)}
                              >
                                <span className="text-sm">Câu {question.questionNumber}</span>
                                <div className="flex items-center gap-1">
                                  {idx > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        moveQuestion(part.id, question.id, 'up')
                                      }}
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </Button>
                                  )}
                                  {idx < part.questions.length - 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        moveQuestion(part.id, question.id, 'down')
                                      }}
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      duplicateQuestion(part.id, question.id)
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteQuestion(part.id, question.id)
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-900">
                    <div className="font-medium">Tổng quan:</div>
                    <div className="text-xs mt-1">
                      • {testData.parts.length} Parts<br />
                      • {getTotalQuestions()} Câu hỏi
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel - Question Editor */}
            <div className="col-span-7">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Chỉnh sửa câu hỏi</h3>

                {selectedQuestion && selectedPart ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                      <div>
                        <div className="font-medium text-green-900">
                          Part {selectedPart.partNumber} - Câu {selectedQuestion.questionNumber}
                        </div>
                        <div className="text-xs text-green-700">
                          ID: {selectedQuestion.id}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion(selectedPart.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm câu tiếp theo
                      </Button>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Nội dung câu hỏi</label>
                      <Textarea
                        value={selectedQuestion.questionText}
                        onChange={(e) => {
                          const updated = { ...selectedQuestion, questionText: e.target.value }
                          updateQuestion(selectedPart.id, updated)
                        }}
                        placeholder="Nhập nội dung câu hỏi..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Audio URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">🔊 Audio URL (tùy chọn)</label>
                      <div className="flex gap-2">
                        <Input
                          value={selectedQuestion.audio || ''}
                          onChange={(e) => {
                            const updated = { ...selectedQuestion, audio: e.target.value }
                            updateQuestion(selectedPart.id, updated)
                          }}
                          placeholder="https://..."
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={async () => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'audio/*'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                try {
                                  toast({
                                    title: "⏳ Đang upload...",
                                    description: `Đang tải lên ${file.name}`,
                                  })
                                  
                                  const result = await adminTestApi.uploadMediaFile(file, 'audio')
                                  
                                  const updated = { ...selectedQuestion, audio: result.url }
                                  updateQuestion(selectedPart.id, updated)
                                  
                                  toast({
                                    title: "✅ Upload thành công!",
                                    description: `${file.name} đã được tải lên server`,
                                  })
                                } catch (error: any) {
                                  toast({
                                    variant: "destructive",
                                    title: "❌ Upload thất bại",
                                    description: error.response?.data?.message || "Không thể tải file lên server",
                                  })
                                }
                              }
                            }
                            input.click()
                          }}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                      </div>
                      {selectedQuestion.audio && (
                        <audio controls className="w-full mt-2">
                          <source src={selectedQuestion.audio} />
                        </audio>
                      )}
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">🖼️ Image URL (tùy chọn)</label>
                      <div className="flex gap-2">
                        <Input
                          value={selectedQuestion.image || ''}
                          onChange={(e) => {
                            const updated = { ...selectedQuestion, image: e.target.value }
                            updateQuestion(selectedPart.id, updated)
                          }}
                          placeholder="https://..."
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={async () => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                try {
                                  toast({
                                    title: "⏳ Đang upload...",
                                    description: `Đang tải lên ${file.name}`,
                                  })
                                  
                                  const result = await adminTestApi.uploadMediaFile(file, 'image')
                                  
                                  const updated = { ...selectedQuestion, image: result.url }
                                  updateQuestion(selectedPart.id, updated)
                                  
                                  toast({
                                    title: "✅ Upload thành công!",
                                    description: `${file.name} đã được tải lên server`,
                                  })
                                } catch (error: any) {
                                  toast({
                                    variant: "destructive",
                                    title: "❌ Upload thất bại",
                                    description: error.response?.data?.message || "Không thể tải file lên server",
                                  })
                                }
                              }
                            }
                            input.click()
                          }}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                      </div>
                      {selectedQuestion.image && (
                        <img 
                          src={selectedQuestion.image} 
                          alt="Question" 
                          className="mt-2 max-h-60 rounded-lg border"
                        />
                      )}
                    </div>

                    {/* Options */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Các đáp án</label>
                      <div className="space-y-3">
                        {selectedQuestion.options.map((option, index) => {
                          const letter = String.fromCharCode(65 + index) // A, B, C, D
                          return (
                            <div key={option.id} className={`border-2 rounded-lg p-4 ${
                              option.isCorrect ? 'bg-green-50 border-green-400' : 'bg-white border-gray-300'
                            }`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                                  option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {letter}
                                </div>
                                <Input
                                  value={option.text}
                                  onChange={(e) => {
                                    const newOptions = [...selectedQuestion.options]
                                    newOptions[index] = { ...option, text: e.target.value }
                                    const updated = { ...selectedQuestion, options: newOptions }
                                    updateQuestion(selectedPart.id, updated)
                                  }}
                                  placeholder={`Nhập đáp án ${letter}`}
                                  className="flex-1"
                                />
                                <Button
                                  variant={option.isCorrect ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = selectedQuestion.options.map((opt, idx) => ({
                                      ...opt,
                                      isCorrect: idx === index
                                    }))
                                    const updated = { 
                                      ...selectedQuestion, 
                                      options: newOptions,
                                      answer: letter
                                    }
                                    updateQuestion(selectedPart.id, updated)
                                  }}
                                >
                                  {option.isCorrect ? '✓ Đúng' : 'Chọn đúng'}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">💡 Giải thích (tùy chọn)</label>
                      <Textarea
                        value={selectedQuestion.explanation || ''}
                        onChange={(e) => {
                          const updated = { ...selectedQuestion, explanation: e.target.value }
                          updateQuestion(selectedPart.id, updated)
                        }}
                        placeholder="Giải thích tại sao đáp án này đúng..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Transcript */}
                    <div>
                      <label className="block text-sm font-medium mb-2">📝 Transcript (tùy chọn)</label>
                      <Textarea
                        value={selectedQuestion.transcript || ''}
                        onChange={(e) => {
                          const updated = { ...selectedQuestion, transcript: e.target.value }
                          updateQuestion(selectedPart.id, updated)
                        }}
                        placeholder="Nội dung transcript của audio..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">Chọn một câu hỏi để chỉnh sửa</p>
                    <p className="text-sm">Hoặc thêm Part mới và tạo câu hỏi</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
