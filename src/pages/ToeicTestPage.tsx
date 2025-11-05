"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  Flag,
  Menu,
  X,
  Pause,
  Play
} from "lucide-react"
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { testApi, type Question, type TestAttempt } from "@/api/testApi"
import AudioPlayer from "@/components/AudioPlayer"

export default function ToeicTestPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Lấy parts từ URL query parameter
  const selectedPartsParam = searchParams.get('parts')
  const selectedParts = selectedPartsParam 
    ? selectedPartsParam.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
    : null // null = làm full test (all 7 parts)
  
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [selectedPart, setSelectedPart] = useState(1)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showQuestionPanel, setShowQuestionPanel] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(7200) // 120 minutes in seconds
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  
  // API data
  const [loading, setLoading] = useState(true)
  const [testInfo, setTestInfo] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  
  // Group mapping: để biết question nào thuộc group nào
  const [questionGroups, setQuestionGroups] = useState<Map<number, Question>>(new Map())
  
  // Audio player state
  const [showFullTestAudio, setShowFullTestAudio] = useState(false)

  // Debug log only once on mount
  useEffect(() => {
    console.log('Test ID:', testId)
  }, [testId])

  // Fetch test data and start attempt
  useEffect(() => {
    if (testId) {
      initializeTest()
    }
  }, [testId])

  const initializeTest = async () => {
    try {
      setLoading(true)
      
      // Lấy thông tin test và câu hỏi
      const testData = await testApi.getTestWithQuestions(testId!)
      setTestInfo(testData.test)
      
      // Flatten questions from all parts
      // Group questions cần được expand thành individual questions
      if (testData.parts) {
        const allQuestions: Question[] = []
        const groupMap = new Map<number, Question>()
        
        // Lọc parts nếu có selectedParts
        const partsToUse = selectedParts 
          ? testData.parts.filter(part => selectedParts.includes(part.partNumber))
          : testData.parts // Không filter = lấy tất cả
        
        console.log('Selected parts:', selectedParts || 'All parts')
        console.log('Parts to use:', partsToUse.map(p => p.partNumber))
        
        partsToUse.forEach(part => {
          part.questions.forEach(q => {
            if (q.type === 'group' && q.subQuestions && q.subQuestions.length > 0) {
              // Group question: thêm từng sub-question vào list
              q.subQuestions.forEach((subQ: Question) => {
                allQuestions.push(subQ)
                // Map sub-question number -> parent group
                groupMap.set(subQ.questionNumber, q)
              })
            } else {
              // Single question: thêm trực tiếp
              allQuestions.push(q)
            }
          })
        })
        
        // Sort by question number
        allQuestions.sort((a, b) => a.questionNumber - b.questionNumber)
        
        console.log(`Loaded ${allQuestions.length} questions from parts:`, partsToUse.map(p => p.partNumber).join(', '))
        
        setQuestions(allQuestions)
        setQuestionGroups(groupMap)
      }
      
      // Bắt đầu attempt
      const attemptData = await testApi.startTest({ test_id: testId! })
      setAttempt(attemptData.attempt)
      
      // Set time limit with fallback
      const timeLimit = attemptData.attempt.time_limit || 120 // Default 120 minutes
      console.log('⏱️ Setting time limit:', timeLimit, 'minutes =', timeLimit * 60, 'seconds')
      setTimeLeft(timeLimit * 60) // Convert to seconds
      
      // Load existing answers if resuming
      if (attemptData.attempt.answers && attemptData.attempt.answers.length > 0) {
        const existingAnswers: Record<number, string> = {}
        attemptData.attempt.answers.forEach((ans, index) => {
          existingAnswers[index + 1] = ans.selected_answer
        })
        setAnswers(existingAnswers)
      }
      
    } catch (error) {
      console.error('Error initializing test:', error)
    } finally {
      setLoading(false)
    }
  }

  // Timer countdown
  useEffect(() => {
    if (!isPaused && timeLeft > 0 && !loading) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPaused, timeLeft, loading])

  // Mock data
  const defaultTestInfo = {
    title: "ETS 2020 Practice Test 1",
    totalQuestions: 200,
    parts: [
      { partNumber: 1, name: "Photographs", questions: 6, range: [1, 6] },
      { partNumber: 2, name: "Question-Response", questions: 25, range: [7, 31] },
      { partNumber: 3, name: "Conversations", questions: 39, range: [32, 70] },
      { partNumber: 4, name: "Short Talks", questions: 30, range: [71, 100] },
      { partNumber: 5, name: "Incomplete Sentences", questions: 30, range: [101, 130] },
      { partNumber: 6, name: "Text Completion", questions: 16, range: [131, 146] },
      { partNumber: 7, name: "Reading Comprehension", questions: 54, range: [147, 200] }
    ]
  }

  const currentTestInfo = testInfo && questions.length > 0 ? {
    title: testInfo.title,
    totalQuestions: questions.length,
    parts: (() => {
      // Tính toán parts động dựa trên questions
      const partMap = new Map<number, { partNumber: number, name: string, questions: number[], range: [number, number] }>()
      
      questions.forEach(q => {
        if (!partMap.has(q.part)) {
          const partNames = [
            "Photographs",
            "Question-Response", 
            "Conversations",
            "Short Talks",
            "Incomplete Sentences",
            "Text Completion",
            "Reading Comprehension"
          ]
          
          partMap.set(q.part, {
            partNumber: q.part,
            name: partNames[q.part - 1] || `Part ${q.part}`,
            questions: [],
            range: [Infinity, -Infinity] as [number, number]
          })
        }
        
        const partData = partMap.get(q.part)!
        partData.questions.push(q.questionNumber)
        partData.range[0] = Math.min(partData.range[0], q.questionNumber)
        partData.range[1] = Math.max(partData.range[1], q.questionNumber)
      })
      
      return Array.from(partMap.values())
        .map(p => ({
          partNumber: p.partNumber,
          name: p.name,
          questions: p.questions, // Keep as array of question numbers
          questionCount: p.questions.length, // Add separate count field
          range: p.range
        }))
        .sort((a, b) => a.partNumber - b.partNumber)
    })()
  } : defaultTestInfo

  const getCurrentPartName = () => {
    const part = currentTestInfo.parts.find((p: any) => p.partNumber === selectedPart)
    return part?.name || ''
  }
  
  // Get current question data - find by questionNumber instead of index
  const currentQuestionData = questions.find(q => q.questionNumber === currentQuestion) || {
    questionNumber: currentQuestion,
    part: selectedPart,
    type: "single" as const,
    _id: "",
    questionText: "Loading...",
    options: { A: "", B: "", C: "", D: "" }
  }
  
  // Get group data if question belongs to a group
  const currentGroupData = questionGroups.get(currentQuestion)
  
  // Check if this is the first question in the group (to show context/audio)
  const isFirstInGroup = currentGroupData && currentGroupData.subQuestions && 
    currentGroupData.subQuestions[0]?.questionNumber === currentQuestion
  
  // Get all questions in current group
  const currentGroupQuestions = currentGroupData?.subQuestions || []

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = async (option: string) => {
    setSelectedAnswer(option)
    setAnswers({ ...answers, [currentQuestion]: option })
    
    // Submit answer to backend
    // Find question by questionNumber instead of index
    const question = questions.find(q => q.questionNumber === currentQuestion)
    
    if (attempt && question) {
      try {
        await testApi.submitAnswer({
          attempt_id: attempt._id,
          question_id: question._id,
          selected_answer: option,
          time_spent: 0 // TODO: Track actual time spent
        })
        console.log(`✅ Submitted answer for question ${currentQuestion}:`, option)
      } catch (error) {
        console.error('Error submitting answer:', error)
      }
    } else {
      console.warn(`⚠️ Cannot submit: attempt=${!!attempt}, question=${!!question}, currentQuestion=${currentQuestion}`)
    }
  }

  const handleNextQuestion = async () => {
    const currentGroup = questionGroups.get(currentQuestion)
    let nextQ: number
    
    if (currentGroup && currentGroup.subQuestions) {
      // Nếu đang ở trong group, nhảy đến group tiếp theo
      const lastQuestionInGroup = currentGroup.subQuestions[currentGroup.subQuestions.length - 1]?.questionNumber
      nextQ = lastQuestionInGroup + 1
    } else {
      // Single question, chỉ cần +1
      nextQ = currentQuestion + 1
    }
    
    if (nextQ <= (currentTestInfo.totalQuestions || 200)) {
      setCurrentQuestion(nextQ)
      setSelectedAnswer(answers[nextQ] || null)
      
      // Auto change part
      const nextPart = currentTestInfo.parts.find((p: any) => 
        nextQ >= p.range[0] && nextQ <= p.range[1]
      )
      if (nextPart && nextPart.partNumber !== selectedPart) {
        setSelectedPart(nextPart.partNumber)
        // Update current part in backend
        if (attempt) {
          try {
            await testApi.updateCurrentPart({
              attempt_id: attempt._id,
              part_number: nextPart.partNumber
            })
          } catch (error) {
            console.error('Error updating current part:', error)
          }
        }
      }
    }
  }

  const handlePrevQuestion = () => {
    const currentGroup = questionGroups.get(currentQuestion)
    let prevQ: number
    
    if (currentGroup && currentGroup.subQuestions) {
      // Nếu đang ở trong group, nhảy về group trước đó
      const firstQuestionInGroup = currentGroup.subQuestions[0]?.questionNumber
      prevQ = firstQuestionInGroup - 1
    } else {
      // Single question, chỉ cần -1
      prevQ = currentQuestion - 1
    }
    
    if (prevQ >= 1) {
      // Kiểm tra xem prevQ có thuộc group không
      const prevGroup = questionGroups.get(prevQ)
      if (prevGroup && prevGroup.subQuestions) {
        // Nhảy về câu đầu tiên của group đó
        prevQ = prevGroup.subQuestions[0]?.questionNumber
      }
      
      setCurrentQuestion(prevQ)
      setSelectedAnswer(answers[prevQ] || null)
      
      // Auto change part
      const prevPart = currentTestInfo.parts.find((p: any) => 
        prevQ >= p.range[0] && prevQ <= p.range[1]
      )
      if (prevPart) setSelectedPart(prevPart.partNumber)
    }
  }

  const handleQuestionClick = (questionNum: number) => {
    setCurrentQuestion(questionNum)
    setSelectedAnswer(answers[questionNum] || null)
    
    // Auto change part
    const part = currentTestInfo.parts.find((p: any) => 
      questionNum >= p.range[0] && questionNum <= p.range[1]
    )
    if (part) setSelectedPart(part.partNumber)
  }

  const handleSubmitTest = async () => {
    if (!attempt) return
    
    try {
      // Debug: check all values
      console.log('🔍 Debug values:', {
        'attempt.time_limit': attempt.time_limit,
        'timeLeft': timeLeft,
        'timeLeft type': typeof timeLeft,
        'timeLeft isNaN': isNaN(timeLeft)
      })
      
      // Calculate time used in minutes (total time - remaining time)
      const timeLimitSeconds = (attempt.time_limit || 120) * 60 // Default 120 minutes if undefined
      const timeLeftValid = typeof timeLeft === 'number' && !isNaN(timeLeft) ? timeLeft : 0
      const timeUsedSeconds = Math.max(0, timeLimitSeconds - timeLeftValid)
      const timeUsedMinutes = Math.max(1, Math.round(timeUsedSeconds / 60)) // Ensure at least 1 minute
      
      console.log('✅ Submitting test:', {
        attempt_id: attempt._id,
        time_used: timeUsedMinutes,
        calculation: {
          time_limit_seconds: timeLimitSeconds,
          timeLeft_seconds: timeLeftValid,
          time_used_seconds: timeUsedSeconds,
          time_used_minutes: timeUsedMinutes
        }
      })
      
      const payload = {
        attempt_id: attempt._id,
        time_used: timeUsedMinutes
      }
      
      console.log('📤 Payload sending to API:', JSON.stringify(payload))
      
      await testApi.completeTest(payload)
      
      // Check if this is placement test
      const isPlacementTest = testInfo?.title?.includes('Placement Test') || 
                              testInfo?.title?.includes('Đánh giá trình độ')
      
      // Navigate to appropriate result page
      if (isPlacementTest) {
        navigate(`/placement-test/result?attemptId=${attempt._id}`)
      } else {
        navigate(`/practice/test/${testId}/result?attemptId=${attempt._id}`)
      }
    } catch (error: any) {
      console.error('❌ Error submitting test:', error)
      console.error('Error response:', error.response?.data)
    }
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/practice">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Quay lại
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">{currentTestInfo.title || 'Loading...'}</h1>
                  {selectedParts && selectedParts.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Parts: {selectedParts.join(', ')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Part {selectedPart}: {getCurrentPartName()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <div className="flex items-center space-x-2">
                  <Clock className={`h-5 w-5 ${timeLeft < 600 ? 'text-red-500' : 'text-gray-600'}`} />
                  <span className={`font-mono text-lg font-bold ${timeLeft < 600 ? 'text-red-500' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="text-center">
                <div className="text-sm font-medium">
                  {getAnsweredCount()}/{currentTestInfo.totalQuestions || 200}
                </div>
                <div className="text-xs text-gray-600">Đã làm</div>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={() => setShowSubmitDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Flag className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>

              {/* Toggle Panel */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionPanel(!showQuestionPanel)}
              >
                {showQuestionPanel ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto">
        <div className="flex">
          {/* Question Content Area */}
          <div className={`flex-1 transition-all duration-300 ${showQuestionPanel ? 'mr-80' : ''}`}>
            <div className="p-8">
              <Card className="p-8 min-h-[600px]">
                {/* Part Badge */}
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {currentGroupData ? (
                      <>
                        Group {currentGroupData.groupNumber} - Questions {currentGroupQuestions[0]?.questionNumber}-{currentGroupQuestions[currentGroupQuestions.length - 1]?.questionNumber} 
                        <span className="ml-2 text-muted-foreground">(Current: {currentQuestion})</span>
                      </>
                    ) : (
                      <>Question {currentQuestion} of {currentTestInfo.totalQuestions || 200}</>
                    )}
                  </Badge>
                  {/* Toggle Full Test Audio for Listening Parts */}
                  {selectedPart <= 4 && testInfo?.audioUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFullTestAudio(!showFullTestAudio)}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {showFullTestAudio ? 'Ẩn audio toàn bài' : 'Audio toàn bài'}
                    </Button>
                  )}
                </div>

                {/* Full Test Audio Player (for entire test) */}
                {showFullTestAudio && testInfo?.audioUrl && selectedPart <= 4 && (
                  <div className="mb-6">
                    <AudioPlayer
                      audioUrl={testInfo.audioUrl}
                      title={`${testInfo.title} - Full Audio`}
                      autoPlay={false}
                    />
                  </div>
                )}

                {/* Group Audio - Hiển thị khi là câu đầu tiên trong group */}
                {currentGroupData && isFirstInGroup && currentGroupData.audio && (
                  <div className="mb-6">
                    <AudioPlayer
                      audioUrl={currentGroupData.audio}
                      title={`Group ${currentGroupData.groupNumber} Audio`}
                      autoPlay={false}
                      compact={false}
                    />
                  </div>
                )}

                {/* Individual Question Audio - Chỉ cho single questions */}
                {!currentGroupData && currentQuestionData.audio && (
                  <div className="mb-6">
                    <AudioPlayer
                      audioUrl={currentQuestionData.audio}
                      title={`Question ${currentQuestion}`}
                      autoPlay={false}
                      compact={true}
                    />
                  </div>
                )}

                {/* Question Image (Part 1) */}
                {currentQuestionData.image && (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={currentQuestionData.image} 
                      alt="Question" 
                      className="max-w-md rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Context/Passage for Group Questions - Chỉ hiển thị cho câu đầu tiên */}
                {currentGroupData && isFirstInGroup && currentGroupData.contextHtml && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-blue-600">
                      Group {currentGroupData.groupNumber} - Context
                    </h4>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentGroupData.contextHtml }}
                    />
                  </div>
                )}

                {/* Fallback: Nếu không có contextHtml nhưng có passage */}
                {currentGroupData && isFirstInGroup && !currentGroupData.contextHtml && currentGroupData.passage && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold mb-3 text-blue-600">
                      Group {currentGroupData.groupNumber} - Passage
                    </h4>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {currentGroupData.passage}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Single question passage (Part 6, 7) */}
                {!currentGroupData && currentQuestionData.passage && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {currentQuestionData.passage}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Single question contextHtml */}
                {!currentGroupData && currentQuestionData.contextHtml && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentQuestionData.contextHtml }}
                    />
                  </div>
                )}

                {/* Question Text - Chỉ hiển thị cho single questions */}
                {!currentGroupData && currentQuestionData.questionText && (
                  <div className="mb-6">
                    <p className="text-lg font-medium">
                      {currentQuestion}. {currentQuestionData.questionText}
                    </p>
                  </div>
                )}

                {/* Answer Options - Chỉ hiển thị cho single questions */}
                {!currentGroupData && currentQuestionData.options && (
                  <div className="space-y-3">
                    {Object.entries(currentQuestionData.options).map(([option, text]) => (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedAnswer === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                            selectedAnswer === option
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300'
                          }`}>
                            {option}
                          </div>
                          <span className="text-base">{text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Group Questions - Hiển thị tất cả câu trong group */}
                {currentGroupData && currentGroupQuestions.length > 0 && (
                  <div className="mt-8 space-y-8">
                    {currentGroupQuestions.map((subQ: Question, index: number) => {
                      const isCurrentSubQ = subQ.questionNumber === currentQuestion
                      return (
                        <div 
                          key={subQ._id || index} 
                          className={`border-2 rounded-lg p-6 transition-all ${
                            isCurrentSubQ 
                              ? 'border-blue-500 bg-blue-50/30' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          {/* Sub Question Text */}
                          {subQ.questionText && (
                            <div className="mb-4">
                              <p className="text-lg font-medium flex items-center gap-2">
                                <span className={isCurrentSubQ ? 'text-blue-600' : ''}>
                                  {subQ.questionNumber}. {subQ.questionText}
                                </span>
                                {isCurrentSubQ && (
                                  <Badge variant="default" className="ml-2">Current</Badge>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Sub Question Options */}
                          <div className="space-y-3">
                            {Object.entries(subQ.options).map(([option, text]) => {
                              const isSelected = answers[subQ.questionNumber] === option
                              return (
                                <button
                                  key={option}
                                  onClick={async () => {
                                    // Update current question nếu click vào câu khác
                                    if (subQ.questionNumber !== currentQuestion) {
                                      setCurrentQuestion(subQ.questionNumber)
                                    }
                                    
                                    // Update answers
                                    setAnswers({ ...answers, [subQ.questionNumber]: option })
                                    setSelectedAnswer(option)
                                    
                                    // Submit to backend
                                    if (attempt && subQ._id) {
                                      try {
                                        await testApi.submitAnswer({
                                          attempt_id: attempt._id,
                                          question_id: subQ._id,
                                          selected_answer: option,
                                          time_spent: 0
                                        })
                                        console.log(`✅ Submitted answer for question ${subQ.questionNumber}:`, option)
                                      } catch (error) {
                                        console.error('Error submitting answer:', error)
                                      }
                                    } else {
                                      console.warn(`⚠️ Cannot submit group question: attempt=${!!attempt}, subQ._id=${!!subQ._id}`)
                                    }
                                  }}
                                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : 'border-gray-300'
                                    }`}>
                                      {option}
                                    </div>
                                    <span className="text-base">{text}</span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Câu trước
                  </Button>

                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestion === (currentTestInfo.totalQuestions || 200)}
                  >
                    Câu tiếp
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Question Navigation Panel */}
          {showQuestionPanel && (
            <div className="w-80 bg-white border-l fixed right-0 top-[73px] bottom-0 overflow-y-auto">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-4">Danh sách câu hỏi</h3>

                {/* Part Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentTestInfo.parts.map((part: any) => (
                    <Button
                      key={part.partNumber}
                      variant={selectedPart === part.partNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedPart(part.partNumber)
                        setCurrentQuestion(part.range[0])
                        setSelectedAnswer(answers[part.range[0]] || null)
                      }}
                    >
                      P{part.partNumber}
                    </Button>
                  ))}
                </div>

                {/* Question Grid */}
                {currentTestInfo.parts.map((part: any) => (
                  selectedPart === part.partNumber && (
                    <div key={part.partNumber}>
                      <h4 className="font-medium text-sm mb-3 text-gray-600">
                        Part {part.partNumber}: {part.name} ({part.questionCount} câu)
                      </h4>
                      <div className="grid grid-cols-5 gap-2 mb-6">
                        {part.questions.map((questionNum: number) => {
                          const isAnswered = answers[questionNum]
                          const isCurrent = questionNum === currentQuestion

                          return (
                            <button
                              key={questionNum}
                              onClick={() => handleQuestionClick(questionNum)}
                              className={`
                                h-10 rounded-md font-medium text-sm transition-all
                                ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                ${isAnswered 
                                  ? 'bg-green-500 text-white hover:bg-green-600' 
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }
                              `}
                            >
                              {questionNum}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                ))}

                {/* Legend */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span>Đã trả lời</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-gray-100 rounded"></div>
                    <span>Chưa trả lời</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-white border-2 border-blue-500 rounded"></div>
                    <span>Câu hiện tại</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 my-4">
                <p>Bạn đã hoàn thành {getAnsweredCount()}/{currentTestInfo.totalQuestions || 200} câu hỏi.</p>
                <p>Còn lại {(currentTestInfo.totalQuestions || 200) - getAnsweredCount()} câu chưa làm.</p>
                <p className="font-medium text-gray-900">
                  Bạn có chắc chắn muốn nộp bài không?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmitTest}
            >
              Nộp bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
