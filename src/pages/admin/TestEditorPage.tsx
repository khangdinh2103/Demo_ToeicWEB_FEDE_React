import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminMenu from '../../components/AdminMenu'
import SectionEditModal from '../../components/SectionEditModal'
import { Trash2, Upload, FileText, Volume2, Image, Plus, FileVideo, Headphones, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { useToast } from '../../hooks/use-toast'
import adminTestApi from '../../api/adminTestApi'

type Choice = { id: number; text: string; isCorrect?: boolean; explanation?: string }
type Question = {
  id: number;
  text: string;
  choices: Choice[];
}
type Section = { 
  id: number; 
  kind: string; 
  title: string; 
  partName?: string;
  partNumber?: number;
  src?: string; 
  choices?: Choice[]; // For single question
  questions?: Question[]; // For multiple questions sharing same media
  explanation?: string;
  audioFile?: File | null;
  imageFile?: File | null;
}
type TestItem = { id: number; title: string; description: string; status: string; questions: number; sections?: Section[] }

export default function TestEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [current, setCurrent] = useState<TestItem | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null)
  const [bulkText, setBulkText] = useState('')
  const [selectedPart, setSelectedPart] = useState<number>(1)
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState(false)
  const [showBulkTextDialog, setShowBulkTextDialog] = useState(false)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0)
  const [availableParts, setAvailableParts] = useState<number[]>([1, 2, 3, 4, 5, 6, 7])
  const [showAddPartDialog, setShowAddPartDialog] = useState(false)
  const [newPartNumber, setNewPartNumber] = useState<string>('')
  const [originalSections, setOriginalSections] = useState<Section[]>([]) // Store original data for comparison
  
  // Test metadata editing
  const [showTestInfoDialog, setShowTestInfoDialog] = useState(false)
  const [editedTestInfo, setEditedTestInfo] = useState({
    title: '',
    year: undefined as number | undefined,
    source: '',
    time_limit: 120,
    passing_score: 495,
    audioUrl: ''
  })
  const [uploadingTestAudio, setUploadingTestAudio] = useState(false)

  // Question types for selection
  const questionTypes = [
    { id: 'audio', name: 'Câu hỏi Audio đơn', icon: Headphones, description: 'Nghe audio và trả lời 1 câu hỏi' },
    { id: 'audio_group', name: 'Nhóm câu hỏi Audio', icon: Volume2, description: 'Nghe audio và trả lời nhiều câu hỏi (Part 3, 4)' },
    { id: 'image', name: 'Câu hỏi Hình ảnh đơn', icon: Image, description: 'Nhìn hình ảnh và trả lời 1 câu hỏi' },
    { id: 'image_group', name: 'Nhóm câu hỏi Hình ảnh', icon: Image, description: 'Nhìn hình ảnh và trả lời nhiều câu hỏi' },
    { id: 'reading', name: 'Câu hỏi Đọc hiểu', icon: FileText, description: 'Đọc đoạn văn và trả lời câu hỏi' },
    { id: 'mcq', name: 'Trắc nghiệm thường', icon: FileVideo, description: 'Câu hỏi trắc nghiệm không có media' }
  ]

  // Load test data from API when id changes
  useEffect(() => {
    if (!id) return
    
    const loadTestData = async () => {
      try {
        setLoading(true)
        
        // Load test with questions AND ANSWERS from API (for admin)
        const testWithAnswers = await adminTestApi.getTestWithAnswers(id)
        
        console.log('📦 Test with answers:', testWithAnswers)
        
        // Convert API response to TestItem format
        const sections: Section[] = []
        let sectionIdCounter = Date.now()
        
        // Convert each part's questions to sections
        if (testWithAnswers.parts && testWithAnswers.parts.length > 0) {
          testWithAnswers.parts.forEach((part: any) => {
            if (!part.questions || part.questions.length === 0) return
            
            part.questions.forEach((question: any) => {
              sectionIdCounter++
              
              // Determine question kind based on question type and content
              let kind = 'mcq'
              if (question.audio) kind = question.subQuestions ? 'audio_group' : 'audio'
              else if (question.image) kind = question.subQuestions ? 'image_group' : 'image'
              else if (question.contextHtml) kind = 'reading'
              
              console.log('🔍 Question:', {
                _id: question._id,
                kind,
                audio: question.audio,
                image: question.image,
                hasSubQuestions: !!question.subQuestions,
                options: question.options, // 👈 Debug options
                answer: question.answer
              })
              
              // Convert to Section format
              const section: Section = {
                id: sectionIdCounter,
                kind: kind,
                title: question.questionText || question.contextHtml || '',
                partName: `Part ${part.partNumber}`,
                partNumber: part.partNumber,
                src: question.audio || question.image, // URL for audio or image
                explanation: question.explanation || '', // Explanation only
              }
              
              // Store question _id and questionNumber for updating later
              ;(section as any).questionId = question._id
              ;(section as any).questionNumber = question.questionNumber
              
              // Store audio and image URLs separately to support questions with both
              if (question.audio) {
                ;(section as any).audioUrl = question.audio
              }
              if (question.image) {
                ;(section as any).imageUrl = question.image
              }
              
              // Add transcript separately
              if (question.transcript) {
                section.explanation = question.explanation || ''
                // Store transcript in a custom field (we'll add this to Section type)
                ;(section as any).transcript = question.transcript
              }
              
              // Handle subQuestions (group questions)
              if (question.subQuestions && question.subQuestions.length > 0) {
                section.questions = question.subQuestions.map((sq: any, idx: number) => {
                  const correctAnswer = sq.answer // answer từ backend (A, B, C, D)
                  
                  // Handle options as either array or object {A: '...', B: '...', C: '...', D: '...'}
                  let optionsArray: string[] = []
                  if (Array.isArray(sq.options) && sq.options.length > 0) {
                    optionsArray = sq.options
                  } else if (sq.options && typeof sq.options === 'object') {
                    // Convert object to array: {A: 'on', B: 'for', C: 'to', D: 'under'} → ['on', 'for', 'to', 'under']
                    optionsArray = ['A', 'B', 'C', 'D'].map(key => sq.options[key]).filter(Boolean)
                  }
                  
                  const subQuestion: Question = {
                    id: sectionIdCounter * 100 + idx,
                    text: sq.questionText || '',
                    choices: optionsArray.length > 0 ? optionsArray.map((opt: string, optIdx: number) => {
                      const optionLetter = String.fromCharCode(65 + optIdx) // A, B, C, D
                      return {
                        id: sectionIdCounter * 1000 + idx * 10 + optIdx,
                        text: opt,
                        isCorrect: correctAnswer === optionLetter, // So sánh với đáp án đúng
                        explanation: sq.explanation || '' // Add explanation cho từng câu
                      }
                    }) : [
                      { id: sectionIdCounter * 1000 + idx * 10, text: 'A', isCorrect: correctAnswer === 'A', explanation: sq.explanation || '' },
                      { id: sectionIdCounter * 1000 + idx * 10 + 1, text: 'B', isCorrect: correctAnswer === 'B', explanation: sq.explanation || '' },
                      { id: sectionIdCounter * 1000 + idx * 10 + 2, text: 'C', isCorrect: correctAnswer === 'C', explanation: sq.explanation || '' },
                      { id: sectionIdCounter * 1000 + idx * 10 + 3, text: 'D', isCorrect: correctAnswer === 'D', explanation: sq.explanation || '' }
                    ]
                  }
                  
                  // Store subQuestion _id and questionNumber for updating later
                  ;(subQuestion as any).questionId = sq._id
                  ;(subQuestion as any).questionNumber = sq.questionNumber
                  
                  return subQuestion
                })
              } else {
                // Single question
                const correctAnswer = question.answer // answer từ backend (A, B, C, D)
                
                // Handle options as either array or object {A: '...', B: '...', C: '...', D: '...'}
                let optionsArray: string[] = []
                if (Array.isArray(question.options) && question.options.length > 0) {
                  optionsArray = question.options
                } else if (question.options && typeof question.options === 'object') {
                  // Convert object to array: {A: 'on', B: 'for', C: 'to', D: 'under'} → ['on', 'for', 'to', 'under']
                  optionsArray = ['A', 'B', 'C', 'D'].map(key => question.options[key]).filter(Boolean)
                }
                
                section.choices = optionsArray.length > 0 ? optionsArray.map((opt: string, idx: number) => {
                  const optionLetter = String.fromCharCode(65 + idx) // A, B, C, D
                  return {
                    id: sectionIdCounter * 10 + idx,
                    text: opt,
                    isCorrect: correctAnswer === optionLetter, // So sánh với đáp án đúng
                    explanation: question.explanation || ''
                  }
                }) : [
                  { id: sectionIdCounter * 10, text: 'A', isCorrect: correctAnswer === 'A', explanation: question.explanation || '' },
                  { id: sectionIdCounter * 10 + 1, text: 'B', isCorrect: correctAnswer === 'B', explanation: question.explanation || '' },
                  { id: sectionIdCounter * 10 + 2, text: 'C', isCorrect: correctAnswer === 'C', explanation: question.explanation || '' },
                  { id: sectionIdCounter * 10 + 3, text: 'D', isCorrect: correctAnswer === 'D', explanation: question.explanation || '' }
                ]
              }
              
              sections.push(section)
            })
          })
        }
        
        const convertedTest: TestItem = {
          id: parseInt(testWithAnswers.test._id.slice(-8), 16),
          title: testWithAnswers.test.title,
          description: `${testWithAnswers.test.year || ''} - ${testWithAnswers.test.source || ''}`.trim(),
          status: 'active', // Assume published if we can load questions
          questions: testWithAnswers.totalQuestions || sections.length,
          sections: sections
        }
        
        setCurrent(convertedTest)
        setOriginalSections(JSON.parse(JSON.stringify(sections))) // Deep copy for comparison
        
        // Load available parts from test.parts array
        if (testWithAnswers.test.parts && testWithAnswers.test.parts.length > 0) {
          const partNumbers = testWithAnswers.test.parts.map((p: any) => p.partNumber).sort((a: number, b: number) => a - b)
          setAvailableParts(partNumbers)
        }
        
        toast({
          title: "Tải thành công",
          description: `Đã tải đề thi: ${testWithAnswers.test.title} (${sections.length} câu hỏi với đáp án)`,
        })
      } catch (error: any) {
        console.error('Failed to load test:', error)
        
        // If test is not published, try loading from localStorage as fallback
        if (error.response?.status === 403) {
          toast({
            variant: "destructive",
            title: "Đề thi chưa xuất bản",
            description: "Đang tải từ bản lưu nháp...",
          })
          
          try {
            // Fallback: load metadata and sections from localStorage
            const testData = await adminTestApi.getTestById(id)
            const localStorageKey = `test_${id}_sections`
            const savedSections = localStorage.getItem(localStorageKey)
            const sections: Section[] = savedSections ? JSON.parse(savedSections) : []
            
            const convertedTest: TestItem = {
              id: parseInt(testData._id.slice(-8), 16),
              title: testData.title,
              description: `${testData.year || ''} - ${testData.source || ''}`.trim(),
              status: testData.is_published ? 'active' : 'pending',
              questions: 0,
              sections: sections
            }
            
            setCurrent(convertedTest)
            toast({
              title: "Tải từ bản nháp",
              description: `Đề thi chưa xuất bản, đã tải ${sections.length} câu hỏi từ bản lưu nháp`,
            })
          } catch (fallbackError: any) {
            console.error('Fallback also failed:', fallbackError)
            toast({
              variant: "destructive",
              title: "Lỗi",
              description: "Không thể tải đề thi",
            })
            navigate('/admin/tests')
          }
        } else {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: error.response?.data?.message || "Không thể tải đề thi",
          })
          navigate('/admin/tests')
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadTestData()
  }, [id, navigate, toast])

  const saveLocal = (updatedSections: Section[]) => {
    if (!current || !id) return
    
    // Save sections to localStorage with test-specific key
    const localStorageKey = `test_${id}_sections`
    localStorage.setItem(localStorageKey, JSON.stringify(updatedSections))
    
    // Update current state
    setCurrent({
      ...current,
      sections: updatedSections,
      questions: updatedSections.reduce((total, section) => {
        // Bỏ qua nếu section chỉ là part header (không có nội dung câu hỏi)
        if (!section.title?.trim() && !section.choices?.length && !section.questions?.length) {
          return total
        }
        
        // Chỉ tính nếu section có câu hỏi thực sự
        if (section.questions && section.questions.length > 0) {
          // Nhóm câu hỏi: kiểm tra từng câu hỏi có choices và nội dung
          const validQuestions = section.questions.filter(q => 
            q.choices && q.choices.length > 0 && 
            q.text && q.text.trim().length > 0
          )
          return total + validQuestions.length
        } else if (section.choices && section.choices.length > 0 && section.title?.trim()) {
          // Câu hỏi đơn: kiểm tra có choices với nội dung và có title
          const validChoices = section.choices.filter(c => c.text && c.text.trim().length > 0)
          return validChoices.length > 0 ? total + 1 : total
        } else {
          // Section rỗng hoặc chỉ là part header
          return total
        }
      }, 0)
    })
  }

  // Helper function to check if a section has been modified
  const isSectionModified = (section: Section, originalSection: Section | undefined): boolean => {
    if (!originalSection) return true // New section = modified
    
    // Check if it's a group question
    if (section.questions && section.questions.length > 0) {
      // Compare each subQuestion
      if (!originalSection.questions || section.questions.length !== originalSection.questions.length) {
        return true
      }
      
      for (let i = 0; i < section.questions.length; i++) {
        const q = section.questions[i]
        const origQ = originalSection.questions[i]
        
        // Compare question text
        if (q.text !== origQ.text) return true
        
        // Compare choices
        if (q.choices?.length !== origQ.choices?.length) return true
        for (let j = 0; j < (q.choices || []).length; j++) {
          if (q.choices![j].text !== origQ.choices![j].text) return true
          if (q.choices![j].isCorrect !== origQ.choices![j].isCorrect) return true
        }
      }
    } else {
      // Single question - compare title, audio, image, transcript, explanation, choices
      if (section.title !== originalSection.title) return true
      if ((section as any).audioUrl !== (originalSection as any).audioUrl) return true
      if ((section as any).imageUrl !== (originalSection as any).imageUrl) return true
      if ((section as any).transcript !== (originalSection as any).transcript) return true
      if (section.explanation !== originalSection.explanation) return true
      
      // Compare choices
      if (section.choices?.length !== originalSection.choices?.length) return true
      for (let i = 0; i < (section.choices || []).length; i++) {
        if (section.choices![i].text !== originalSection.choices![i].text) return true
        if (section.choices![i].isCorrect !== originalSection.choices![i].isCorrect) return true
      }
    }
    
    return false // No changes detected
  }

  // Save draft for current question to local state (not API yet)
  const saveDraftCurrentQuestion = () => {
    if (!current || !selectedSection) return
    
    const sections = current.sections || []
    const sectionIndex = sections.findIndex(s => s.id === selectedSection.id)
    
    if (sectionIndex === -1) return
    
    // Update the section in the array
    const updatedSections = [...sections]
    updatedSections[sectionIndex] = selectedSection
    
    setCurrent({
      ...current,
      sections: updatedSections
    })
    
    console.log('💾 Draft saved for section:', selectedSection.id)
  }

  // Handle question selection with auto-save
  const handleSelectQuestion = (section: Section, questionIndex: number = 0) => {
    // Save current question before switching
    saveDraftCurrentQuestion()
    
    // Switch to new question
    setSelectedSection(section)
    setSelectedQuestionIndex(questionIndex)
  }

  // Open test info dialog and load current data
  const openTestInfoDialog = async () => {
    if (!id) return
    
    try {
      const testData = await adminTestApi.getTestWithAnswers(id)
      setEditedTestInfo({
        title: testData.test.title || '',
        year: testData.test.year,
        source: testData.test.source || '',
        time_limit: testData.test.time_limit || 120,
        passing_score: testData.test.passing_score || 495,
        audioUrl: testData.test.audioUrl || ''
      })
      setShowTestInfoDialog(true)
    } catch (error) {
      console.error('Failed to load test info:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin đề thi",
        variant: "destructive"
      })
    }
  }

  // Upload test audio file
  const handleUploadTestAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingTestAudio(true)
      const result = await adminTestApi.uploadMediaFile(file, 'audio')
      setEditedTestInfo(prev => ({ ...prev, audioUrl: result.url }))
      toast({
        title: "✅ Thành công",
        description: "Đã upload file audio",
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "❌ Lỗi upload",
        description: error.response?.data?.message || "Không thể upload file",
        variant: "destructive",
      })
    } finally {
      setUploadingTestAudio(false)
    }
  }

  // Save test info
  const saveTestInfo = async () => {
    if (!id || !editedTestInfo.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên đề thi",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      await adminTestApi.updateTest(id, {
        title: editedTestInfo.title,
        year: editedTestInfo.year,
        source: editedTestInfo.source,
        time_limit: editedTestInfo.time_limit,
        passing_score: editedTestInfo.passing_score,
        audioUrl: editedTestInfo.audioUrl
      })
      
      // Update local state
      if (current) {
        setCurrent({
          ...current,
          title: editedTestInfo.title,
          description: `${editedTestInfo.year || ''} - ${editedTestInfo.source || ''}`.trim()
        })
      }
      
      toast({
        title: "✅ Thành công",
        description: "Đã cập nhật thông tin đề thi",
      })
      setShowTestInfoDialog(false)
    } catch (error: any) {
      console.error('Update test error:', error)
      toast({
        title: "❌ Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật đề thi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAllModifiedQuestions = async () => {
    // Auto-save current question first
    saveDraftCurrentQuestion()
    
    if (!current || !id) {
      toast({
        title: "Không có dữ liệu",
        description: "Không tìm thấy đề thi để lưu",
        variant: "destructive",
      })
      return
    }

    const allSections = current.sections || []
    if (allSections.length === 0) {
      toast({
        title: "Không có câu hỏi",
        description: "Đề thi chưa có câu hỏi nào",
      })
      return
    }

    // Filter only modified sections
    const modifiedSectionsList = allSections.filter((section, index) => {
      const originalSection = originalSections[index]
      return isSectionModified(section, originalSection)
    })

    if (modifiedSectionsList.length === 0) {
      toast({
        title: "Không có thay đổi",
        description: "Không có câu hỏi nào được chỉnh sửa",
      })
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    try {
      console.log('💾 Saving', modifiedSectionsList.length, 'modified sections...')

      for (const section of modifiedSectionsList) {
        try {
          // Check if this is a group question
          if (section.questions && section.questions.length > 0) {
            // Save each subQuestion
            for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
              const subQuestion = section.questions[qIndex]
              const questionId = (subQuestion as any).questionId

              const questionData: any = {
                questionText: subQuestion.text,
              }

              const choices = subQuestion.choices
              if (choices && choices.length > 0) {
                questionData.options = {}
                questionData.answer = ''
                
                choices.forEach((choice, index) => {
                  const letter = String.fromCharCode(65 + index)
                  questionData.options[letter] = choice.text
                  if (choice.isCorrect) {
                    questionData.answer = letter
                  }
                })
              }

              if (questionId) {
                // Update existing question
                await adminTestApi.updateQuestion(id, questionId, questionData)
              } else {
                // Create new question
                questionData.part = section.partNumber || selectedPart
                questionData.questionNumber = (subQuestion as any).questionNumber || qIndex + 1
                const result = await adminTestApi.createQuestion(id, questionData)
                // Store questionId for future updates
                ;(subQuestion as any).questionId = result.questionId
              }
              successCount++
            }
          } else {
            // Single question
            const questionId = (section as any).questionId

            const questionData: any = {
              questionText: section.title,
              audio: (section as any).audioUrl || undefined,
              image: (section as any).imageUrl || undefined,
              transcript: (section as any).transcript || undefined,
              explanation: section.explanation || undefined,
            }

            const choices = section.choices
            if (choices && choices.length > 0) {
              questionData.options = {}
              questionData.answer = ''
              
              choices.forEach((choice, index) => {
                const letter = String.fromCharCode(65 + index)
                questionData.options[letter] = choice.text
                if (choice.isCorrect) {
                  questionData.answer = letter
                }
              })
            }

            if (questionId) {
              // Update existing question
              await adminTestApi.updateQuestion(id, questionId, questionData)
            } else {
              // Create new question
              questionData.part = section.partNumber || selectedPart
              questionData.questionNumber = (section as any).questionNumber || 1
              const result = await adminTestApi.createQuestion(id, questionData)
              // Store questionId for future updates
              ;(section as any).questionId = result.questionId
            }
            successCount++
          }
        } catch (error: any) {
          errorCount++
          const questionNum = (section as any).questionNumber || '?'
          errors.push(`Câu ${questionNum}: ${error.response?.data?.message || error.message}`)
          console.error('❌ Error saving section:', section, error)
        }
      }

      // Show result toast
      if (errorCount === 0) {
        toast({
          title: "✅ Lưu thành công!",
          description: `Đã lưu ${successCount} câu hỏi vào database`,
        })
        // Update original sections after successful save
        setOriginalSections(JSON.parse(JSON.stringify(current.sections)))
      } else {
        toast({
          title: `⚠️ Lưu một phần`,
          description: `Thành công: ${successCount} câu. Lỗi: ${errorCount} câu.${errors.length > 0 ? ' ' + errors.slice(0, 2).join(', ') : ''}`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('❌ Error in saveAllModifiedQuestions:', error)
      toast({
        title: "❌ Lỗi",
        description: "Không thể lưu câu hỏi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addSection = (sec: Section) => {
    if (!current) return
    const newSections = [...(current.sections || []), sec]
    saveLocal(newSections)
  }

  const deleteSelectedSection = () => {
    if (!current || !selectedSection) return
    
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')
    if (!isConfirmed) return
    
    const newSections = (current.sections || []).filter(s => s.id !== selectedSection.id)
    saveLocal(newSections)
    setSelectedSection(null)
    setSelectedQuestionIndex(0)
  }

  const deleteSection = (sectionId: number) => {
    if (!current) return
    const newSections = (current.sections || []).filter(s => s.id !== sectionId)
    saveLocal(newSections)
    if (selectedSection && selectedSection.id === sectionId) setSelectedSection(null)
  }

  const addNewPart = () => {
    const partNumber = parseInt(newPartNumber)
    if (isNaN(partNumber) || partNumber <= 0) {
      alert('Vui lòng nhập số Part hợp lệ (số nguyên dương)')
      return
    }
    
    if (availableParts.includes(partNumber)) {
      alert(`Part ${partNumber} đã tồn tại!`)
      return
    }
    
    const newParts = [...availableParts, partNumber].sort((a, b) => a - b)
    setAvailableParts(newParts)
    setSelectedPart(partNumber)
    setNewPartNumber('')
    setShowAddPartDialog(false)
  }

  const deletePart = (partNumber: number) => {
    if (!current) return
    
    const partSections = (current.sections || []).filter(s => s.partNumber === partNumber)
    if (partSections.length > 0) {
      const isConfirmed = window.confirm(`Part ${partNumber} có ${partSections.length} câu hỏi. Bạn có chắc chắn muốn xóa Part này và tất cả câu hỏi trong đó không?`)
      if (!isConfirmed) return
      
      // Delete all sections in this part
      const newSections = (current.sections || []).filter(s => s.partNumber !== partNumber)
      saveLocal(newSections)
    }
    
    // Remove part from available parts
    const newParts = availableParts.filter(p => p !== partNumber)
    setAvailableParts(newParts)
    
    // Select first available part or add default if none left
    if (newParts.length > 0) {
      setSelectedPart(newParts[0])
    } else {
      setAvailableParts([1])
      setSelectedPart(1)
    }
    
    // Clear selection if it was in deleted part
    if (selectedSection && selectedSection.partNumber === partNumber) {
      setSelectedSection(null)
    }
  }

  const createQuestionFromType = (questionType: string) => {
    if (!current) return
    
    // Calculate next question number for this part
    const partSections = (current.sections || []).filter(s => s.partNumber === selectedPart)
    let nextQuestionNumber = 1
    
    // Count existing questions in this part
    partSections.forEach(section => {
      if (section.questions && section.questions.length > 0) {
        nextQuestionNumber += section.questions.length
      } else if (section.choices && section.choices.length > 0) {
        nextQuestionNumber += 1
      }
    })
    
    const isGroupType = questionType.includes('_group')
    
    if (isGroupType) {
      // For group questions (start with 2 questions, can add more)
      const newSection: Section = {
        id: Date.now(),
        kind: questionType,
        title: `Nhóm câu hỏi ${questionType}`,
        partName: getPartName(questionType),
        partNumber: selectedPart,
        questions: [
          {
            id: Date.now() + 1,
            text: 'Câu hỏi 1',
            choices: [
              { id: Date.now() + 11, text: 'Đáp án A', isCorrect: false },
              { id: Date.now() + 12, text: 'Đáp án B', isCorrect: false },
              { id: Date.now() + 13, text: 'Đáp án C', isCorrect: true },
              { id: Date.now() + 14, text: 'Đáp án D', isCorrect: false }
            ]
          },
          {
            id: Date.now() + 2,
            text: 'Câu hỏi 2',
            choices: [
              { id: Date.now() + 21, text: 'Đáp án A', isCorrect: true },
              { id: Date.now() + 22, text: 'Đáp án B', isCorrect: false },
              { id: Date.now() + 23, text: 'Đáp án C', isCorrect: false },
              { id: Date.now() + 24, text: 'Đáp án D', isCorrect: false }
            ]
          }
        ]
      }
      // Add questionNumber to each sub-question
      newSection.questions?.forEach((q, idx) => {
        ;(q as any).questionNumber = nextQuestionNumber + idx
      })
      addSection(newSection)
    } else {
      // For single questions
      const newSection: Section = {
        id: Date.now(),
        kind: questionType,
        title: `Câu hỏi ${questionType}`,
        partName: getPartName(questionType),
        partNumber: selectedPart,
        choices: [
          { id: Date.now() + 1, text: 'Đáp án A', isCorrect: false },
          { id: Date.now() + 2, text: 'Đáp án B', isCorrect: false },
          { id: Date.now() + 3, text: 'Đáp án C', isCorrect: true },
          { id: Date.now() + 4, text: 'Đáp án D', isCorrect: false }
        ]
      }
      // Add questionNumber
      ;(newSection as any).questionNumber = nextQuestionNumber
      addSection(newSection)
    }
    
    setShowQuestionTypeDialog(false)
    
    // Auto-select the newly created section
    setTimeout(() => {
      const updatedTests = JSON.parse(localStorage.getItem('tests_v1') || '[]')
      const updatedCurrent = updatedTests.find((t: TestItem) => String(t.id) === id)
      if (updatedCurrent && updatedCurrent.sections) {
        const latestSection = updatedCurrent.sections[updatedCurrent.sections.length - 1]
        setSelectedSection(latestSection)
      }
    }, 100)
  }

  const getPartName = (questionType: string): string => {
    const partNames: { [key: string]: string } = {
      'audio': 'Part 1 - Listening',
      'audio_group': 'Part 3/4 - Conversations/Talks',
      'image': 'Part 2 - Picture Description', 
      'image_group': 'Part 1 - Photographs Group',
      'reading': 'Part 7 - Reading Comprehension',
      'mcq': 'Part 5 - Grammar'
    }
    return partNames[questionType] || 'Multiple Choice'
  }

  const handleSectionSave = (updatedSection: Section) => {
    if (!current) return
    const newSections = (current.sections || []).map(s => 
      s.id === updatedSection.id ? updatedSection : s
    )
    saveLocal(newSections)
    setEditModalOpen(false)
    setSectionToEdit(null)
  }

  const detectSectionType = (text: string): string => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('audio') || lowerText.includes('listening') || lowerText.includes('nghe')) {
      return 'audio'
    }
    if (lowerText.includes('image') || lowerText.includes('picture') || lowerText.includes('hình') || lowerText.includes('ảnh')) {
      return 'image'
    }
    if (lowerText.includes('reading') || lowerText.includes('đọc') || lowerText.includes('text')) {
      return 'reading'
    }
    return 'mcq'
  }

  const parseQuestionFromText = (text: string, baseId: number, qIdx: number): Section | null => {
    // Remove question number prefix if exists
    const cleanText = text.replace(/^\s*\d+\.\s*/, '').trim()
    
    // Split into stem and choices
    const parts = cleanText.split(/\s+(?=\*?[A-Z]\.)/g)
    let stem = ''
    let choiceTexts: string[] = []
    
    // If first part doesn't start with A., it's the stem
    if (parts.length > 0 && !/^\*?[A-Z]\./.test(parts[0])) {
      stem = parts[0].trim()
      choiceTexts = parts.slice(1)
    } else {
      choiceTexts = parts
    }
    
    // Parse choices
    const choices: Choice[] = choiceTexts.map((choiceText, idx) => {
      const match = choiceText.match(/^(\*?)([A-Z])\.\s*(.*)$/)
      if (match) {
        const isCorrect = match[1] === '*'
        const text = match[3].trim()
        return {
          id: baseId + qIdx * 10 + idx,
          text,
          isCorrect
        }
      }
      // Fallback
      return {
        id: baseId + qIdx * 10 + idx,
        text: choiceText.replace(/^\*/, '').trim(),
        isCorrect: choiceText.startsWith('*')
      }
    })
    
    if (choices.length === 0) return null
    
    const sectionType = detectSectionType(stem || text)
    
    return {
      id: baseId + qIdx,
      kind: sectionType,
      title: stem || `Question ${qIdx}`,
      choices,
      partName: sectionType === 'audio' ? 'Listening' : sectionType === 'image' ? 'Picture Description' : sectionType === 'reading' ? 'Reading Comprehension' : 'Multiple Choice'
    }
  }

  const parseBulkAndAdd = () => {
    if (!current || !bulkText.trim()) return
    
    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const newSections: Section[] = []
    let baseId = Date.now()
    let qIdx = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Check if this line contains a question (has number prefix or choices)
      const hasNumber = /^\d+\./.test(line)
      const hasChoices = /\s+\*?[A-Z]\./.test(line)
      
      if (hasNumber || hasChoices) {
        qIdx++
        
        // If it's a multi-line question, collect all related lines
        let fullQuestion = line
        let j = i + 1
        
        // Look ahead for choice lines (lines starting with A., B., etc.)
        while (j < lines.length && /^\*?[A-Z]\./.test(lines[j])) {
          fullQuestion += ' ' + lines[j]
          j++
        }
        
        const section = parseQuestionFromText(fullQuestion, baseId, qIdx)
        if (section) {
          newSections.push(section)
        }
        
        // Skip the lines we've already processed
        i = j - 1
      }
    }
    
    if (newSections.length === 0) {
      alert('Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra định dạng:\n1. Question text A. choice1 B. choice2 *C. correct_choice D. choice4')
      return
    }
    
    const newAllSections = [...(current.sections || []), ...newSections]
    saveLocal(newAllSections)
    setBulkText('')
    alert(`Đã thêm ${newSections.length} section(s) thành công!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 
                  className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onDoubleClick={openTestInfoDialog}
                  title="Double-click để chỉnh sửa thông tin đề thi"
                >
                  {current ? `Chỉnh sửa: ${current.title}` : 'Tạo đề thi'}
                </h1>
                <p className="text-gray-600">Quản lý câu hỏi và nội dung bài thi TOEIC</p>
              </div>
              {current && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">
                      {(() => {
                        // Tính tổng số câu hỏi thực tế từ sections (không tính part tabs)
                        const sections = current.sections || []
                        
                        const count = sections.reduce((total, section) => {
                          // Bỏ qua nếu section chỉ là part header (không có nội dung câu hỏi)
                          if (!section.title?.trim() && !section.choices?.length && !section.questions?.length) {
                            return total
                          }
                          
                          // Chỉ tính nếu section có câu hỏi thực sự
                          if (section.questions && section.questions.length > 0) {
                            // Nhóm câu hỏi: kiểm tra từng câu hỏi có choices và nội dung
                            const validQuestions = section.questions.filter(q => 
                              q.choices && q.choices.length > 0 && 
                              q.text && q.text.trim().length > 0
                            )
                            return total + validQuestions.length
                          } else if (section.choices && section.choices.length > 0 && section.title?.trim()) {
                            // Câu hỏi đơn: kiểm tra có choices với nội dung và có title
                            const validChoices = section.choices.filter(c => c.text && c.text.trim().length > 0)
                            return validChoices.length > 0 ? total + 1 : total
                          } else {
                            // Section rỗng hoặc chỉ là part header
                            return total
                          }
                        }, 0)
                        
                        return count
                      })()}
                    </span> câu hỏi
                  </div>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    onClick={saveAllModifiedQuestions}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {loading ? 'Đang lưu...' : (() => {
                      // Count modified sections
                      const modifiedCount = (current?.sections || []).filter((section, index) => {
                        const originalSection = originalSections[index]
                        return isSectionModified(section, originalSection)
                      }).length
                      
                      return modifiedCount > 0 ? `Lưu đề (${modifiedCount} thay đổi)` : 'Lưu đề'
                    })()}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-10 gap-6">
            {/* Cột trái - 4 phần */}
            <div className="col-span-4 space-y-6">
              {/* Danh sách phần thi */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Danh sách phần thi</h3>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : current ? (
                  <div className="space-y-3">
                    {/* Phần tabs */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {availableParts.map(partNumber => (
                        <div key={partNumber} className="relative group">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={selectedPart === partNumber ? "bg-blue-500 text-white border-blue-500" : ""}
                            onClick={() => setSelectedPart(partNumber)}
                          >
                            Part {partNumber}
                          </Button>
                          {availableParts.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePart(partNumber)
                              }}
                              title={`Xóa Part ${partNumber}`}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Nút thêm Part */}
                      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-dashed border-gray-400 text-gray-600 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Thêm Part
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Thêm Part mới</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Số Part</label>
                              <Input
                                type="number"
                                value={newPartNumber}
                                onChange={(e) => setNewPartNumber(e.target.value)}
                                placeholder="Nhập số Part (VD: 5, 6, 7...)"
                                className="w-full"
                                min="1"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Nhập số nguyên dương (1, 2, 3,...)
                              </p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setShowAddPartDialog(false)
                                  setNewPartNumber('')
                                }}
                              >
                                Hủy
                              </Button>
                              <Button onClick={addNewPart}>
                                Thêm Part
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {/* Danh sách câu hỏi của Part được chọn */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {/* Không hiển thị gì ở đây - câu hỏi sẽ hiện ở phần Danh mục câu hỏi */}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Đang tải dữ liệu đề thi...</p>
                  </div>
                )}
              </Card>

              {/* Danh mục câu hỏi */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4">Danh mục câu hỏi</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Dialog open={showQuestionTypeDialog} onOpenChange={setShowQuestionTypeDialog}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Thêm câu hỏi
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Chọn loại câu hỏi</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          {questionTypes.map(type => {
                            const IconComponent = type.icon
                            return (
                              <Card 
                                key={type.id} 
                                className="p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                onClick={() => createQuestionFromType(type.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <IconComponent className="w-6 h-6 text-blue-600" />
                                  <div>
                                    <h4 className="font-medium">{type.name}</h4>
                                    <p className="text-sm text-gray-600">{type.description}</p>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showBulkTextDialog} onOpenChange={setShowBulkTextDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Thêm bằng văn bản
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Nhập câu hỏi bằng văn bản</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            value={bulkText}
                            onChange={(e:any) => setBulkText(e.target.value)}
                            className="min-h-60"
                            placeholder="Nhập câu hỏi..."
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowBulkTextDialog(false)}>
                              Hủy
                            </Button>
                            <Button onClick={() => { parseBulkAndAdd(); setShowBulkTextDialog(false); }}>
                              Thêm
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Upload className="w-4 h-4" />
                      Sắp xếp câu hỏi
                    </Button>
                  </div>
                  
                  {selectedSection && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={deleteSelectedSection}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa câu hỏi đang chọn
                    </Button>
                  )}

                  {/* Danh sách câu hỏi theo dạng số */}
                  {current && (current.sections || []).filter(s => s.partNumber === selectedPart).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Danh sách câu hỏi:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const partSections = (current.sections || []).filter(section => {
                            // Chỉ hiển thị section thuộc part này và có nội dung
                            if (section.partNumber !== selectedPart) return false
                            
                            // Kiểm tra section có nội dung thực sự
                            if (section.questions && section.questions.length > 0) return true
                            if (section.choices && section.choices.length > 0) return true
                            
                            return false // Section rỗng không hiển thị
                          })
                          
                          return partSections.map((section) => {
                            // Nếu là nhóm câu hỏi (có questions array), hiển thị các nút cho từng câu hỏi
                            if (section.questions && section.questions.length > 0) {
                              const isGroupSelected = selectedSection?.id === section.id
                              const groupButtons = (
                                <div 
                                  key={`group-${section.id}`} 
                                  className={`flex gap-1 p-1 rounded-lg border-2 ${
                                    isGroupSelected 
                                      ? 'border-blue-400 bg-blue-50' 
                                      : 'border-gray-200 bg-gray-50'
                                  } transition-all duration-200`}
                                >
                                  {section.questions.map((question, questionIndex) => {
                                    // Use questionNumber from backend data
                                    const questionNum = (question as any).questionNumber || (questionIndex + 1)
                                    return (
                                      <div key={`${section.id}-${question.id}`} className="relative group">
                                        <Button
                                          variant={isGroupSelected ? "default" : "outline"}
                                          size="sm"
                                          className={`w-10 h-10 p-0 ${
                                            isGroupSelected
                                              ? "bg-blue-500 text-white" 
                                              : "border-gray-300 hover:bg-blue-50"
                                          } relative`}
                                          onClick={() => {
                                            handleSelectQuestion(section, questionIndex)
                                          }}
                                          title={
                                            selectedSection?.id === section.id && selectedQuestionIndex === questionIndex
                                              ? `Đang chỉnh sửa câu hỏi ${questionNum} (Nhóm)`
                                              : isGroupSelected
                                              ? `Câu hỏi ${questionNum} (Nhóm đang chọn)`
                                              : `Câu hỏi ${questionNum} (Nhóm)`
                                          }
                                        >
                                          {questionNum}
                                        </Button>
                                        {/* Nút xóa nhóm chỉ hiện ở câu hỏi đầu tiên */}
                                        {questionIndex === 0 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa nhóm câu hỏi này không? (Sẽ xóa ${section.questions?.length || 0} câu hỏi)`)
                                              if (isConfirmed) {
                                                deleteSection(section.id)
                                              }
                                            }}
                                          >
                                            ×
                                          </Button>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                              return groupButtons
                            } else if (section.choices && section.choices.length > 0) {
                              // Câu hỏi đơn có choices - use questionNumber from backend
                              const questionNum = (section as any).questionNumber || 1
                              return (
                                <div key={section.id} className="relative group">
                                  <Button
                                    variant={selectedSection?.id === section.id ? "default" : "outline"}
                                    size="sm"
                                    className={`w-10 h-10 p-0 ${
                                      selectedSection?.id === section.id 
                                        ? "bg-blue-500 text-white" 
                                        : "border-gray-300 hover:bg-blue-50"
                                    }`}
                                    onClick={() => {
                                      handleSelectQuestion(section, 0)
                                    }}
                                  >
                                    {questionNum}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${questionNum} không?`)
                                      if (isConfirmed) {
                                        deleteSection(section.id)
                                      }
                                    }}
                                  >
                                    ×
                                  </Button>
                                </div>
                              )
                            }
                            return null // Không return gì cho section rỗng
                          }).filter(Boolean) // Loại bỏ null values
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Cột phải - 6 phần */}
            <div className="col-span-6 space-y-6">
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-4">Chỉnh sửa câu hỏi</h3>
                
                {selectedSection ? (
                  <div className="space-y-4">
                    <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-700">Loại câu hỏi</span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {questionTypes.find(t => t.id === selectedSection.kind)?.name || selectedSection.kind}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Chủ đề học tập</label>
                      <Input 
                        value={selectedSection.partName || ''}
                        onChange={(e) => setSelectedSection({ ...selectedSection, partName: e.target.value })}
                        placeholder="Nhập chủ đề học tập"
                        className="bg-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ví dụ: Listening, Reading Comprehension, Grammar,...
                      </p>
                    </div>

                    {/* Image upload cho câu hỏi hình ảnh */}
                    {(selectedSection.kind === 'image' || selectedSection.kind === 'image_group') && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Hình ảnh</label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setSelectedSection({ ...selectedSection, imageFile: file, src: URL.createObjectURL(file) })
                                }
                              }}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image-upload')?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              {selectedSection.imageFile ? 'Thay đổi Hình ảnh' : 'Tải lên Hình ảnh'}
                            </Button>
                            {selectedSection.imageFile && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSection({ ...selectedSection, imageFile: null, src: undefined })}
                                className="text-red-500"
                              >
                                Xóa
                              </Button>
                            )}
                          </div>
                          {selectedSection.imageFile && selectedSection.src && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">{selectedSection.imageFile.name}</span>
                              </div>
                              <div className="mt-2">
                                <img 
                                  src={selectedSection.src} 
                                  alt="Uploaded" 
                                  className="max-w-full max-h-48 rounded-lg border"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Phần chọn câu hỏi nếu là nhóm câu hỏi */}
                    {selectedSection.questions && selectedSection.questions.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Quản lý câu hỏi trong nhóm ({selectedSection.questions.length} câu)</label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newQuestion: Question = {
                                  id: Date.now(),
                                  text: `Câu hỏi ${selectedSection.questions!.length + 1}`,
                                  choices: [
                                    { id: Date.now() + 1, text: 'Đáp án A', isCorrect: false },
                                    { id: Date.now() + 2, text: 'Đáp án B', isCorrect: false },
                                    { id: Date.now() + 3, text: 'Đáp án C', isCorrect: true },
                                    { id: Date.now() + 4, text: 'Đáp án D', isCorrect: false }
                                  ]
                                }
                                setSelectedSection({
                                  ...selectedSection,
                                  questions: [...selectedSection.questions!, newQuestion]
                                })
                                setSelectedQuestionIndex(selectedSection.questions!.length)
                              }}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Thêm câu hỏi
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentQuestion = selectedSection.questions![selectedQuestionIndex]
                                const newQuestion: Question = {
                                  id: Date.now(),
                                  text: currentQuestion.text + ' (Sao chép)',
                                  choices: currentQuestion.choices.map(choice => ({
                                    id: Date.now() + Math.random(),
                                    text: choice.text,
                                    isCorrect: choice.isCorrect
                                  }))
                                }
                                setSelectedSection({
                                  ...selectedSection,
                                  questions: [...selectedSection.questions!, newQuestion]
                                })
                                setSelectedQuestionIndex(selectedSection.questions!.length)
                              }}
                              className="flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              Sao chép câu này
                            </Button>
                            {selectedSection.questions.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa câu hỏi ${selectedQuestionIndex + 1} khỏi nhóm không?`)
                                  if (isConfirmed) {
                                    const newQuestions = selectedSection.questions!.filter((_, index) => index !== selectedQuestionIndex)
                                    setSelectedSection({
                                      ...selectedSection,
                                      questions: newQuestions
                                    })
                                    // Điều chỉnh selectedQuestionIndex nếu cần
                                    if (selectedQuestionIndex >= newQuestions.length) {
                                      setSelectedQuestionIndex(Math.max(0, newQuestions.length - 1))
                                    }
                                  }
                                }}
                                className="flex items-center gap-1 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                                Xóa câu hỏi này
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {selectedSection.questions.map((question, index) => (
                            <div key={question.id} className="relative group">
                              <Button
                                variant={selectedQuestionIndex === index ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  // Save current before switching
                                  saveDraftCurrentQuestion()
                                  setSelectedQuestionIndex(index)
                                }}
                                className={`${selectedQuestionIndex === index ? "bg-blue-500 text-white" : ""} relative`}
                              >
                                Câu {index + 1}
                              </Button>
                              {/* Nút di chuyển lên */}
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-blue-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const newQuestions = [...selectedSection.questions!]
                                    const temp = newQuestions[index]
                                    newQuestions[index] = newQuestions[index - 1]
                                    newQuestions[index - 1] = temp
                                    setSelectedSection({ ...selectedSection, questions: newQuestions })
                                    setSelectedQuestionIndex(index - 1)
                                  }}
                                  title="Di chuyển lên"
                                >
                                  ↑
                                </Button>
                              )}
                              {/* Nút di chuyển xuống */}
                              {index < (selectedSection.questions?.length || 0) - 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute -bottom-1 -right-1 w-4 h-4 p-0 bg-green-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const newQuestions = [...selectedSection.questions!]
                                    const temp = newQuestions[index]
                                    newQuestions[index] = newQuestions[index + 1]
                                    newQuestions[index + 1] = temp
                                    setSelectedSection({ ...selectedSection, questions: newQuestions })
                                    setSelectedQuestionIndex(index + 1)
                                  }}
                                  title="Di chuyển xuống"
                                >
                                  ↓
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {selectedSection.questions ? `Soạn câu hỏi ${selectedQuestionIndex + 1}` : 'Soạn câu hỏi'}
                      </label>
                      <Textarea
                        value={
                          selectedSection.questions 
                            ? selectedSection.questions[selectedQuestionIndex]?.text || ''
                            : selectedSection.title || ''
                        }
                        onChange={(e) => {
                          if (selectedSection.questions) {
                            const newQuestions = [...selectedSection.questions]
                            newQuestions[selectedQuestionIndex] = {
                              ...newQuestions[selectedQuestionIndex],
                              text: e.target.value
                            }
                            setSelectedSection({ ...selectedSection, questions: newQuestions })
                          } else {
                            setSelectedSection({ ...selectedSection, title: e.target.value })
                          }
                        }}
                        className="border rounded-lg p-3 bg-white min-h-[60px]"
                        placeholder="Nhập nội dung câu hỏi..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Câu trả lời</label>
                      <div className="space-y-3">
                        {(selectedSection.questions 
                          ? selectedSection.questions[selectedQuestionIndex]?.choices 
                          : selectedSection.choices
                        )?.map((choice, index) => (
                          <div key={choice.id} className={`border-2 rounded-lg p-4 ${choice.isCorrect ? 'bg-green-50 border-green-400' : 'bg-white border-gray-300'} transition-all`}>
                            <div className="flex items-start gap-3">
                              {/* Ô chữ cái A, B, C, D */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                                choice.isCorrect 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              
                              {/* Nội dung đáp án */}
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={choice.text}
                                  onChange={(e) => {
                                    if (selectedSection.questions) {
                                      // For group questions
                                      const newQuestions = [...selectedSection.questions]
                                      const newChoices = newQuestions[selectedQuestionIndex].choices.map(c => 
                                        c.id === choice.id ? { ...c, text: e.target.value } : c
                                      )
                                      newQuestions[selectedQuestionIndex] = {
                                        ...newQuestions[selectedQuestionIndex],
                                        choices: newChoices
                                      }
                                      setSelectedSection({ ...selectedSection, questions: newQuestions })
                                    } else {
                                      // For single questions
                                      const newChoices = selectedSection.choices?.map(c => 
                                        c.id === choice.id ? { ...c, text: e.target.value } : c
                                      ) || []
                                      setSelectedSection({ ...selectedSection, choices: newChoices })
                                    }
                                  }}
                                  placeholder={`Nhập nội dung đáp án ${String.fromCharCode(65 + index)}`}
                                  className={`text-base border-2 ${choice.isCorrect ? 'font-medium border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                                />
                                
                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-answer-${selectedSection.questions ? selectedQuestionIndex : 'single'}`}
                                      checked={choice.isCorrect}
                                      onChange={() => {
                                        if (selectedSection.questions) {
                                          // For group questions
                                          const newQuestions = [...selectedSection.questions]
                                          const newChoices = newQuestions[selectedQuestionIndex].choices.map(c => 
                                            ({ ...c, isCorrect: c.id === choice.id })
                                          )
                                          newQuestions[selectedQuestionIndex] = {
                                            ...newQuestions[selectedQuestionIndex],
                                            choices: newChoices
                                          }
                                          setSelectedSection({ ...selectedSection, questions: newQuestions })
                                        } else {
                                          // For single questions
                                          const newChoices = selectedSection.choices?.map(c => 
                                            ({ ...c, isCorrect: c.id === choice.id })
                                          ) || []
                                          setSelectedSection({ ...selectedSection, choices: newChoices })
                                        }
                                      }}
                                      className="w-4 h-4 text-green-600"
                                    />
                                    <label className={`text-sm ${choice.isCorrect ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                      {choice.isCorrect ? '✓ Đáp án đúng' : 'Đánh dấu là đúng'}
                                    </label>
                                  </div>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      if (selectedSection.questions) {
                                        // For group questions
                                        const newQuestions = [...selectedSection.questions]
                                        const newChoices = newQuestions[selectedQuestionIndex].choices.filter(c => c.id !== choice.id)
                                        newQuestions[selectedQuestionIndex] = {
                                          ...newQuestions[selectedQuestionIndex],
                                          choices: newChoices
                                        }
                                        setSelectedSection({ ...selectedSection, questions: newQuestions })
                                      } else {
                                        // For single questions
                                        const newChoices = selectedSection.choices?.filter(c => c.id !== choice.id) || []
                                        setSelectedSection({ ...selectedSection, choices: newChoices })
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newChoice = {
                              id: Date.now(),
                              text: '',
                              isCorrect: false
                            }
                            
                            if (selectedSection.questions) {
                              // For group questions
                              const newQuestions = [...selectedSection.questions]
                              newQuestions[selectedQuestionIndex] = {
                                ...newQuestions[selectedQuestionIndex],
                                choices: [...newQuestions[selectedQuestionIndex].choices, newChoice]
                              }
                              setSelectedSection({ ...selectedSection, questions: newQuestions })
                            } else {
                              // For single questions
                              setSelectedSection({ 
                                ...selectedSection, 
                                choices: [...(selectedSection.choices || []), newChoice] 
                              })
                            }
                          }}
                          className="w-full"
                        >
                          + Thêm đáp án
                        </Button>
                      </div>
                    </div>

                    {/* Giải thích đáp án */}
                    {selectedSection.explanation && (
                      <div>
                        <label className="block text-sm font-medium mb-2">� Giải thích đáp án</label>
                        <Textarea
                          value={selectedSection.explanation}
                          onChange={(e) => setSelectedSection({ ...selectedSection, explanation: e.target.value })}
                          className="border rounded-lg p-3 bg-yellow-50 min-h-[100px]"
                          placeholder="Giải thích tại sao đáp án này đúng..."
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          📌 Thông tin này được tải từ API backend. Để chỉnh sửa, cần cập nhật trong database.
                        </p>
                      </div>
                    )}

                    {/* Transcript riêng biệt */}
                    {(selectedSection as any).transcript && (
                      <div>
                        <label className="block text-sm font-medium mb-2">📝 Transcript (Bản ghi âm)</label>
                        <Textarea
                          value={(selectedSection as any).transcript}
                          className="border rounded-lg p-3 bg-blue-50 min-h-[120px]"
                          placeholder="Transcript của audio..."
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          📌 Transcript được tải từ API backend.
                        </p>
                      </div>
                    )}

                    {/* Audio Section - Edit URL or Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">🔊 Audio</label>
                      <div className="space-y-2">
                        {/* Audio URL Input */}
                        <div className="flex gap-2">
                          <Input
                            value={(selectedSection as any).audioUrl || ''}
                            onChange={(e) => setSelectedSection({ 
                              ...selectedSection, 
                              audioUrl: e.target.value 
                            } as any)}
                            placeholder="Nhập URL audio hoặc upload file"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
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
                                    
                                    // Upload to server
                                    const result = await adminTestApi.uploadMediaFile(file, 'audio')
                                    
                                    setSelectedSection({ 
                                      ...selectedSection, 
                                      audioUrl: result.url,
                                      audioFile: file
                                    } as any)
                                    
                                    toast({
                                      title: "✅ Upload thành công!",
                                      description: `${file.name} đã được tải lên server`,
                                    })
                                  } catch (error: any) {
                                    console.error('Upload error:', error)
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
                          {(selectedSection as any).audioUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSection({ 
                                ...selectedSection, 
                                audioUrl: undefined,
                                audioFile: undefined
                              } as any)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Audio Player Preview */}
                        {(selectedSection as any).audioUrl && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <audio controls className="w-full">
                              <source src={(selectedSection as any).audioUrl} />
                              Trình duyệt không hỗ trợ audio.
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Section - Edit URL or Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">🖼️ Hình ảnh</label>
                      <div className="space-y-2">
                        {/* Image URL Input */}
                        <div className="flex gap-2">
                          <Input
                            value={(selectedSection as any).imageUrl || ''}
                            onChange={(e) => setSelectedSection({ 
                              ...selectedSection, 
                              imageUrl: e.target.value 
                            } as any)}
                            placeholder="Nhập URL hình ảnh hoặc upload file"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
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
                                    
                                    // Upload to server
                                    const result = await adminTestApi.uploadMediaFile(file, 'image')
                                    
                                    setSelectedSection({ 
                                      ...selectedSection, 
                                      imageUrl: result.url,
                                      imageFile: file
                                    } as any)
                                    
                                    toast({
                                      title: "✅ Upload thành công!",
                                      description: `${file.name} đã được tải lên server`,
                                    })
                                  } catch (error: any) {
                                    console.error('Upload error:', error)
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
                          {(selectedSection as any).imageUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSection({ 
                                ...selectedSection, 
                                imageUrl: undefined,
                                imageFile: undefined
                              } as any)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Image Preview */}
                        {(selectedSection as any).imageUrl && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="text-center">
                              <img 
                                src={(selectedSection as any).imageUrl} 
                                alt="Question" 
                                className="max-w-full max-h-96 rounded-lg border mx-auto"
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', (selectedSection as any).imageUrl)
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const errorDiv = target.nextElementSibling as HTMLElement
                                  if (errorDiv) errorDiv.style.display = 'block'
                                }}
                                onLoad={() => {
                                  console.log('✅ Image loaded successfully:', (selectedSection as any).imageUrl)
                                }}
                              />
                              <div style={{ display: 'none' }} className="text-red-600 py-4">
                                ❌ Không thể tải hình ảnh. Vui lòng kiểm tra URL.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Context HTML cho Reading questions */}
                    {selectedSection.kind === 'reading' && selectedSection.title && (
                      <div>
                        <label className="block text-sm font-medium mb-2">📄 Context (Reading Passage)</label>
                        <div 
                          className="border rounded-lg p-4 bg-gray-50 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedSection.title }}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={async () => {
                          console.log('🔘 Button clicked!')
                          if (!current || !selectedSection || !id) {
                            console.log('❌ Missing data:', { current: !!current, selectedSection: !!selectedSection, id })
                            return
                          }
                          
                          try {
                            let questionId: string
                            let updateData: any = {}
                            
                            // Check if this is a group question
                            if (selectedSection.questions && selectedSection.questions.length > 0) {
                              // For group questions, get the ID of the specific subQuestion
                              const currentSubQuestion = selectedSection.questions[selectedQuestionIndex]
                              questionId = (currentSubQuestion as any).questionId
                              
                              console.log('📝 SubQuestion ID:', questionId, 'Index:', selectedQuestionIndex)
                              
                              if (!questionId) {
                                toast({
                                  title: "Lỗi",
                                  description: "Không tìm thấy ID câu hỏi con",
                                  variant: "destructive",
                                })
                                return
                              }
                              
                              // Prepare update data for subQuestion
                              updateData = {
                                questionText: currentSubQuestion.text,
                              }
                              
                              // Handle options for subQuestion
                              const choices = currentSubQuestion.choices
                              if (choices && choices.length > 0) {
                                updateData.options = {}
                                updateData.answer = ''
                                
                                choices.forEach((choice, index) => {
                                  const letter = String.fromCharCode(65 + index) // A, B, C, D
                                  updateData.options[letter] = choice.text
                                  if (choice.isCorrect) {
                                    updateData.answer = letter
                                  }
                                })
                              }
                            } else {
                              // For single questions
                              questionId = (selectedSection as any).questionId
                              
                              console.log('📝 Single Question ID:', questionId)
                              
                              if (!questionId) {
                                toast({
                                  title: "Lỗi",
                                  description: "Không tìm thấy ID câu hỏi",
                                  variant: "destructive",
                                })
                                return
                              }

                              // Prepare update data for single question
                              updateData = {
                                questionText: selectedSection.title,
                                audio: (selectedSection as any).audioUrl || undefined,
                                image: (selectedSection as any).imageUrl || undefined,
                                transcript: (selectedSection as any).transcript || undefined,
                                explanation: selectedSection.explanation || undefined,
                              }

                              // Handle options for single question
                              const choices = selectedSection.choices
                              if (choices && choices.length > 0) {
                                updateData.options = {}
                                updateData.answer = ''
                                
                                choices.forEach((choice, index) => {
                                  const letter = String.fromCharCode(65 + index) // A, B, C, D
                                  updateData.options[letter] = choice.text
                                  if (choice.isCorrect) {
                                    updateData.answer = letter
                                  }
                                })
                              }
                            }

                            console.log('📤 Sending update:', { testId: id, questionId, updateData })

                            // Call API to update question
                            const result = await adminTestApi.updateQuestion(id, questionId, updateData)
                            console.log('✅ API Response:', result)

                            // Also save to localStorage
                            const newSections = (current.sections || []).map(s => s.id === selectedSection.id ? selectedSection : s)
                            saveLocal(newSections)

                            toast({
                              title: "✅ Đã lưu",
                              description: selectedSection.questions 
                                ? `Câu hỏi ${selectedQuestionIndex + 1} đã được cập nhật thành công!`
                                : "Câu hỏi đã được cập nhật thành công!",
                            })
                          } catch (error: any) {
                            console.error('❌ Error updating question:', error)
                            console.error('Error details:', error.response?.data)
                            toast({
                              title: "❌ Lỗi",
                              description: error.response?.data?.message || "Không thể cập nhật câu hỏi",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        💾 Lưu câu hỏi vào Database
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (!current || !selectedSection) return
                          const newSections = (current.sections || []).map(s => s.id === selectedSection.id ? selectedSection : s)
                          saveLocal(newSections)
                          setSelectedSection(null)
                        }}
                      >
                        Lưu nháp
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (!current || !selectedSection) return
                          const newSections = (current.sections || []).map(s => s.id === selectedSection.id ? selectedSection : s)
                          saveLocal(newSections)
                          setSelectedSection(null)
                          setShowQuestionTypeDialog(true)
                        }}
                      >
                        Lưu nháp và Tiếp tục tạo mới
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={deleteSelectedSection}
                        className="ml-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa câu hỏi này
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-2">Chọn một câu hỏi để chỉnh sửa</p>
                    <p className="text-sm">Bấm vào số câu hỏi bên trái hoặc tạo câu hỏi mới</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Section Edit Modal */}
      {sectionToEdit && (
        <SectionEditModal
          section={sectionToEdit}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSectionToEdit(null)
          }}
          onSave={handleSectionSave}
        />
      )}

      {/* Test Info Edit Dialog */}
      <Dialog open={showTestInfoDialog} onOpenChange={setShowTestInfoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin đề thi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên đề thi *</label>
              <Input
                value={editedTestInfo.title}
                onChange={(e) => setEditedTestInfo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ví dụ: ETS 2024 Test 1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Năm phát hành</label>
                <Input
                  type="number"
                  value={editedTestInfo.year || ''}
                  onChange={(e) => setEditedTestInfo(prev => ({ 
                    ...prev, 
                    year: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nguồn</label>
                <Input
                  value={editedTestInfo.source}
                  onChange={(e) => setEditedTestInfo(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="ETS, Hackers..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thời gian (phút)</label>
                <Input
                  type="number"
                  value={editedTestInfo.time_limit}
                  onChange={(e) => setEditedTestInfo(prev => ({ 
                    ...prev, 
                    time_limit: Number(e.target.value) || 120 
                  }))}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Điểm đạt</label>
                <Input
                  type="number"
                  value={editedTestInfo.passing_score}
                  onChange={(e) => setEditedTestInfo(prev => ({ 
                    ...prev, 
                    passing_score: Number(e.target.value) || 495 
                  }))}
                  placeholder="495"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">URL Audio cả đề</label>
              <div className="space-y-2">
                <Input
                  value={editedTestInfo.audioUrl}
                  onChange={(e) => setEditedTestInfo(prev => ({ ...prev, audioUrl: e.target.value }))}
                  placeholder="https://... hoặc upload file"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex items-center gap-2"
                      disabled={uploadingTestAudio}
                      asChild
                    >
                      <span>
                        {uploadingTestAudio ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingTestAudio ? 'Đang upload...' : 'Upload file audio'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleUploadTestAudio}
                      disabled={uploadingTestAudio}
                    />
                  </label>
                  {editedTestInfo.audioUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(editedTestInfo.audioUrl, '_blank')}
                    >
                      <Headphones className="w-4 h-4 mr-1" />
                      Nghe thử
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTestInfoDialog(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={saveTestInfo}
                disabled={loading || !editedTestInfo.title.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thông tin'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
