import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Upload, FileJson, Loader2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import adminTestApi from '../api/adminTestApi'
import { useNavigate } from 'react-router-dom'

interface ImportTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PartData {
  part: number
  questions: QuestionData[]
}

interface QuestionData {
  type: 'single' | 'group'
  groupNumber?: number
  number?: number
  questionText?: string | null
  audio?: string | null
  image?: string | null
  images?: string[]
  contextHTML?: string | null
  transcript?: string | null
  options?: {
    A?: string
    B?: string
    C?: string
    D?: string
  }
  answer?: string
  explanation?: string
  questions?: QuestionData[]
}

export default function ImportTestDialog({ open, onOpenChange }: ImportTestDialogProps) {
  const [jsonText, setJsonText] = useState('')
  const [importing, setImporting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    source: 'Import'
  })
  const { toast } = useToast()
  const navigate = useNavigate()

  // Reset form khi đóng dialog
  const handleOpenChange = (open: boolean) => {
    if (!open && !importing) {
      setJsonText('')
      setForm({
        title: '',
        year: new Date().getFullYear(),
        source: 'Import'
      })
    }
    onOpenChange(open)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      toast({
        title: '❌ Lỗi',
        description: 'Vui lòng chọn file JSON hoặc TXT',
        variant: 'destructive'
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setJsonText(content)
      toast({
        title: '✅ Thành công',
        description: 'Đã tải nội dung file'
      })
    }
    reader.onerror = () => {
      toast({
        title: '❌ Lỗi',
        description: 'Không thể đọc file',
        variant: 'destructive'
      })
    }
    reader.readAsText(file)
  }

  const validateJSON = (data: any): { valid: boolean; message?: string } => {
    if (!Array.isArray(data)) {
      return { valid: false, message: 'JSON phải là một mảng các parts' }
    }

    if (data.length === 0) {
      return { valid: false, message: 'JSON không chứa parts nào' }
    }

    for (const part of data) {
      if (!part.part || typeof part.part !== 'number') {
        return { valid: false, message: 'Mỗi part phải có trường "part" (number)' }
      }

      if (!Array.isArray(part.questions)) {
        return { valid: false, message: `Part ${part.part} phải có mảng "questions"` }
      }

      for (const q of part.questions) {
        if (!q.type || !['single', 'group'].includes(q.type)) {
          return { valid: false, message: 'Question phải có type: "single" hoặc "group"' }
        }

        if (q.type === 'single' && !q.number) {
          return { valid: false, message: 'Single question phải có trường "number"' }
        }

        if (q.type === 'group' && (!q.questions || !Array.isArray(q.questions))) {
          return { valid: false, message: 'Group question phải có mảng "questions"' }
        }
      }
    }

    return { valid: true }
  }

  const handleImport = async () => {
    // Validate form
    if (!form.title.trim()) {
      toast({
        title: '⚠️ Cảnh báo',
        description: 'Vui lòng nhập tiêu đề đề thi',
        variant: 'destructive'
      })
      return
    }

    if (!jsonText.trim()) {
      toast({
        title: '⚠️ Cảnh báo',
        description: 'Vui lòng nhập hoặc upload JSON',
        variant: 'destructive'
      })
      return
    }

    setImporting(true)

    try {
      // 1. Parse JSON
      let partsData: PartData[]
      try {
        partsData = JSON.parse(jsonText)
      } catch (parseError) {
        toast({
          title: '❌ Lỗi định dạng JSON',
          description: 'JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.',
          variant: 'destructive'
        })
        setImporting(false)
        return
      }

      // 2. Validate structure
      const validation = validateJSON(partsData)
      if (!validation.valid) {
        toast({
          title: '❌ JSON không đúng định dạng',
          description: validation.message || 'Vui lòng kiểm tra lại cấu trúc JSON',
          variant: 'destructive'
        })
        setImporting(false)
        return
      }

      // 3. Tạo test với thông tin từ form
      const test = await adminTestApi.createTest({
        title: form.title,
        year: form.year,
        source: form.source,
        time_limit: 120,
        passing_score: 400,
        parts: [
          { partNumber: 1, questionIds: [] },
          { partNumber: 2, questionIds: [] },
          { partNumber: 3, questionIds: [] },
          { partNumber: 4, questionIds: [] },
          { partNumber: 5, questionIds: [] },
          { partNumber: 6, questionIds: [] },
          { partNumber: 7, questionIds: [] }
        ]
      })

      console.log('✅ Test created:', test._id)

      // 4. Import questions
      let totalQuestions = 0
      
      for (const partData of partsData) {
        for (const q of partData.questions) {
          if (q.type === 'single') {
            // Single question
            await adminTestApi.createQuestion(test._id, {
              part: partData.part,
              questionNumber: q.number || 1,
              questionText: q.questionText || '',
              audio: q.audio || undefined,
              image: q.image || undefined,
              options: q.options,
              transcript: q.transcript || undefined,
              answer: q.answer || 'A',
              explanation: q.explanation
            })
            totalQuestions++
            
          } else if (q.type === 'group') {
            // Group question - tạo parent question trước
            await adminTestApi.createQuestion(test._id, {
              part: partData.part,
              questionNumber: q.questions?.[0]?.number || 1,
              questionText: '', // Parent không có questionText
              audio: q.audio || undefined,
              image: q.images?.[0] || q.image || undefined,
              contextHtml: q.contextHTML || undefined,
              transcript: q.transcript || undefined,
              options: { A: '', B: '', C: '', D: '' },
              answer: 'A'
            })
            
            totalQuestions++

            // Tạo sub-questions (nếu cần thiết có thể bỏ qua hoặc xử lý riêng)
            // Backend hiện tại chưa hỗ trợ tạo sub-questions qua API
            if (q.questions && q.questions.length > 0) {
              for (const subQ of q.questions) {
                await adminTestApi.createQuestion(test._id, {
                  part: partData.part,
                  questionNumber: subQ.number || 1,
                  questionText: subQ.questionText || '',
                  options: subQ.options,
                  answer: subQ.answer || 'A',
                  explanation: subQ.explanation
                })
                totalQuestions++
              }
            }
          }
        }
      }

      toast({
        title: '✅ Import thành công!',
        description: `Đã tạo đề thi với ${totalQuestions} câu hỏi`
      })

      // Reset form
      setJsonText('')
      setForm({
        title: '',
        year: new Date().getFullYear(),
        source: 'Import'
      })
      
      onOpenChange(false)
      
      // Navigate to edit page
      navigate(`/admin/tests/edit/${test._id}`)

    } catch (error: any) {
      console.error('Import error:', error)
      toast({
        title: '❌ Lỗi import',
        description: error.message || 'Không thể import đề thi',
        variant: 'destructive'
      })
    } finally {
      setImporting(false)
    }
  }

  const exampleJSON = `[
  {
    "part": 1,
    "questions": [
      {
        "type": "single",
        "number": 1,
        "questionText": null,
        "audio": "https://example.com/audio.mp3",
        "image": "https://example.com/image.jpg",
        "options": {
          "A": "Option A",
          "B": "Option B",
          "C": "Option C",
          "D": "Option D"
        },
        "answer": "B",
        "explanation": "Giải thích..."
      }
    ]
  },
  {
    "part": 3,
    "questions": [
      {
        "type": "group",
        "groupNumber": 1,
        "audio": "https://example.com/audio.mp3",
        "transcript": "Transcript...",
        "questions": [
          {
            "number": 32,
            "questionText": "Question 32?",
            "options": {
              "A": "Option A",
              "B": "Option B",
              "C": "Option C",
              "D": "Option D"
            },
            "answer": "A"
          }
        ]
      }
    ]
  }
]`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Import đề thi từ JSON
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Thông tin cơ bản */}
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h3 className="font-medium text-sm text-gray-700">Thông tin đề thi</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="import-title">Tiêu đề đề thi</Label>
              <Input
                id="import-title"
                placeholder="Ví dụ: ETS 2024 Test 1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="import-year">Năm</Label>
                <Input
                  id="import-year"
                  type="number"
                  placeholder="2025"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="import-source">Nguồn</Label>
                <Input
                  id="import-source"
                  placeholder="Import"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Upload file */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload file JSON/TXT</label>
            <label className="cursor-pointer">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn file
                </span>
              </Button>
              <input
                type="file"
                accept=".json,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Paste JSON */}
          <div>
            <label className="block text-sm font-medium mb-2">Hoặc paste JSON trực tiếp</label>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste JSON vào đây..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Example format */}
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-sm mb-2">
              📋 Xem định dạng JSON mẫu
            </summary>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
              {exampleJSON}
            </pre>
          </details>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Hủy
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !jsonText.trim()}
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang import...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
