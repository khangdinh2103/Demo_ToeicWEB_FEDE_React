"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { personalVocabularyApi, type AddWordDTO } from "@/api/personalVocabularyApi"
import { useToast } from "@/hooks/use-toast"
import { BookmarkPlus, Loader2, X } from "lucide-react"

interface AddVocabularyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialWord?: string
  initialDefinition?: string
  sourceId?: string
  sourceType?: 'Test' | 'Question'
}

const PART_OF_SPEECH_OPTIONS = [
  { value: 'noun', label: 'Noun (Danh từ)' },
  { value: 'verb', label: 'Verb (Động từ)' },
  { value: 'adjective', label: 'Adjective (Tính từ)' },
  { value: 'adverb', label: 'Adverb (Trạng từ)' },
  { value: 'preposition', label: 'Preposition (Giới từ)' },
  { value: 'conjunction', label: 'Conjunction (Liên từ)' },
  { value: 'pronoun', label: 'Pronoun (Đại từ)' },
  { value: 'interjection', label: 'Interjection (Thán từ)' },
  { value: 'other', label: 'Other (Khác)' }
]

export default function AddVocabularyModal({
  open,
  onOpenChange,
  initialWord = "",
  initialDefinition = "",
  sourceId,
  sourceType
}: AddVocabularyModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [audioUK, setAudioUK] = useState("")
  const [audioUS, setAudioUS] = useState("")
  const [generatedWordId, setGeneratedWordId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [checkingSpell, setCheckingSpell] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState<AddWordDTO>({
    word: initialWord,
    definition: initialDefinition,
    example: "",
    translation: "",
    phonetic: "",
    part_of_speech: "other",
    notes: "",
    tags: [],
    source: sourceType === 'Test' ? 'test' : sourceType === 'Question' ? 'question' : 'manual',
    source_id: sourceId,
    source_type: sourceType
  })
  const [tagInput, setTagInput] = useState("")

  // Spell check with debounce
  useEffect(() => {
    if (!formData.word.trim() || formData.word.length < 3) {
      setSuggestions([])
      return
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      await checkSpelling(formData.word)
    }, 500)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [formData.word])

  const checkSpelling = async (word: string) => {
    try {
      setCheckingSpell(true)
      // Kiểm tra từ có tồn tại trong dictionary không
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`)
      
      if (response.ok) {
        // Từ đúng, không cần gợi ý
        setSuggestions([])
      } else {
        // Từ sai, tạo gợi ý từ các biến thể phổ biến
        const suggestions = generateSuggestions(word)
        setSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Spell check error:', error)
      setSuggestions([])
    } finally {
      setCheckingSpell(false)
    }
  }

  const generateSuggestions = (word: string): string[] => {
    const suggestions: string[] = []
    const lower = word.toLowerCase()

    // Common spelling mistakes patterns
    const patterns: { [key: string]: string[] } = {
      'colld': ['cold', 'could', 'called'],
      'recieve': ['receive'],
      'occured': ['occurred'],
      'seperate': ['separate'],
      'definately': ['definitely'],
      'recomend': ['recommend'],
      'begining': ['beginning'],
      'untill': ['until'],
      'wierd': ['weird'],
      'neccessary': ['necessary'],
      'accomodate': ['accommodate'],
      'acheive': ['achieve'],
      'arguement': ['argument'],
      'beleive': ['believe'],
      'calender': ['calendar'],
      'concious': ['conscious'],
      'enviroment': ['environment'],
      'goverment': ['government'],
      'independant': ['independent'],
      'occassion': ['occasion'],
      'posession': ['possession'],
      'prefered': ['preferred'],
      'publically': ['publicly'],
      'reccomend': ['recommend'],
      'refered': ['referred'],
      'religous': ['religious'],
      'rythm': ['rhythm'],
      'succesful': ['successful'],
      'tommorow': ['tomorrow'],
      'truely': ['truly'],
      'writting': ['writing']
    }

    // Check exact match in patterns
    if (patterns[lower]) {
      return patterns[lower]
    }

    // Generate suggestions based on common mistakes
    // Double letters
    if (word.length > 3) {
      for (let i = 0; i < word.length - 1; i++) {
        if (word[i] === word[i + 1]) {
          const suggestion = word.slice(0, i) + word.slice(i + 1)
          suggestions.push(suggestion)
        }
      }
    }

    // Missing letters in common positions
    const commonDoubles = ['ll', 'ss', 'tt', 'pp', 'mm', 'nn', 'ff', 'rr', 'cc', 'dd']
    for (const double of commonDoubles) {
      const single = double[0]
      if (word.includes(single) && !word.includes(double)) {
        const suggestion = word.replace(single, double)
        suggestions.push(suggestion)
      }
    }

    return suggestions.slice(0, 3) // Giới hạn 3 gợi ý
  }

  const handleAutoGenerate = async () => {
    if (!formData.word.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập từ vựng trước",
        variant: "destructive"
      })
      return
    }

    try {
      setGenerating(true)
      const result = await personalVocabularyApi.autoGenerateWord(formData.word)
      
      // Fill form với data từ AI
      setFormData({
        ...formData,
        definition: result.word.definition || "",
        example: result.word.example || "",
        phonetic: result.word.phonetic || "",
        notes: result.word.notes || ""
      })
      
      // Lưu audio URLs
      setAudioUK(result.audioUK || "")
      setAudioUS(result.audioUS || "")
      
      // Lưu ID của từ vừa tạo
      setGeneratedWordId(result.word._id)
      
      // Hiển thị preview
      setShowPreview(true)
      
      toast({
        title: "Thành công",
        description: "Đã tạo thông tin từ vựng tự động"
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo từ vựng tự động",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.word.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập từ vựng",
        variant: "destructive"
      })
      return
    }

    if (!formData.definition.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập định nghĩa",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      if (generatedWordId) {
        // Nếu đã tạo từ AI, cập nhật thông tin
        await personalVocabularyApi.updateWord(generatedWordId, formData)
        toast({
          title: "Thành công",
          description: `Đã cập nhật "${formData.word}" trong bộ từ cá nhân`,
        })
      } else {
        // Thêm từ mới
        await personalVocabularyApi.addWord(formData)
        toast({
          title: "Thành công",
          description: `Đã thêm "${formData.word}" vào bộ từ cá nhân`,
        })
      }
      
      // Reset form
      setFormData({
        word: "",
        definition: "",
        example: "",
        translation: "",
        phonetic: "",
        part_of_speech: "other",
        notes: "",
        tags: [],
        source: 'manual'
      })
      setTagInput("")
      setShowPreview(false)
      setAudioUK("")
      setAudioUS("")
      setGeneratedWordId(null)
      
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm từ vựng",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags?.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tag]
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Thêm từ vào bộ từ cá nhân
          </DialogTitle>
          <DialogDescription>
            Lưu từ vựng mới để ôn tập sau này
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Word */}
            <div className="space-y-2">
              <Label htmlFor="word">
                Từ vựng <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="word"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    placeholder="Nhập từ vựng"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAutoGenerate}
                    disabled={generating || !formData.word.trim()}
                    variant="outline"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        ✨ AI
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Spell Check Suggestions */}
                {suggestions.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                    <p className="text-xs text-yellow-800 mb-1">
                      💡 Ý bạn là:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, word: suggestion })
                            setSuggestions([])
                          }}
                          className="px-2 py-1 text-xs bg-white border border-yellow-300 rounded hover:bg-yellow-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {checkingSpell && (
                  <p className="text-xs text-gray-500 italic">
                    Đang kiểm tra chính tả...
                  </p>
                )}
              </div>
            </div>

            {/* Phonetic */}
            <div className="space-y-2">
              <Label htmlFor="phonetic">Phiên âm</Label>
              <Input
                id="phonetic"
                value={formData.phonetic}
                onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                placeholder="/wɜːrd/"
              />
            </div>
          </div>

          {/* AI Generated Preview */}
          {showPreview && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-800">✨ Thông tin từ AI</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Audio UK */}
                {audioUK && (
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">🇬🇧 UK Pronunciation</Label>
                    <audio controls className="w-full h-8">
                      <source src={audioUK} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
                
                {/* Audio US */}
                {audioUS && (
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">🇺🇸 US Pronunciation</Label>
                    <audio controls className="w-full h-8">
                      <source src={audioUS} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
              </div>

              {formData.notes && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Collocations:</Label>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {formData.notes}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 italic">
                💡 Bạn có thể chỉnh sửa các trường bên dưới trước khi lưu
              </p>
            </div>
          )}

          {/* Part of Speech */}
          <div className="space-y-2">
            <Label htmlFor="part_of_speech">Loại từ</Label>
            <Select
              value={formData.part_of_speech}
              onValueChange={(value) => setFormData({ ...formData, part_of_speech: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PART_OF_SPEECH_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Definition */}
          <div className="space-y-2">
            <Label htmlFor="definition">
              Định nghĩa (tiếng Anh) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              placeholder="A unit of language..."
              rows={2}
              required
            />
          </div>

          {/* Translation */}
          <div className="space-y-2">
            <Label htmlFor="translation">Nghĩa tiếng Việt</Label>
            <Input
              id="translation"
              value={formData.translation}
              onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
              placeholder="Từ, từ vựng"
            />
          </div>

          {/* Example */}
          <div className="space-y-2">
            <Label htmlFor="example">Câu ví dụ</Label>
            <Textarea
              id="example"
              value={formData.example}
              onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              placeholder="This is an example sentence"
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú cá nhân</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú của bạn về từ này..."
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="toeic, business, daily..."
              />
              <Button type="button" onClick={addTag} variant="outline">
                Thêm
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {generatedWordId ? "Cập nhật" : "Lưu từ vựng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
