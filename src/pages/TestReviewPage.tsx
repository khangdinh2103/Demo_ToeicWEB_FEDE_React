import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { testApi } from '@/api/testApi'
import type { TestAttempt, TestWithQuestions, Question, TestAnswer } from '@/api/testApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, Volume2, Image as ImageIcon, FileText as FileTextIcon } from 'lucide-react'
import AudioPlayer from '@/components/AudioPlayer'

const TestReviewPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>()
  const [searchParams] = useSearchParams()
  const attemptId = searchParams.get('attemptId')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [testData, setTestData] = useState<TestWithQuestions | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Flatten all questions from all parts
  const allQuestions: Question[] = testData?.parts?.flatMap((p: any) => p.questions) || []

  // Create a flattened list for navigator including sub-questions
  const allQuestionsForNav: Question[] = []
  allQuestions.forEach(q => {
    if (q.subQuestions && q.subQuestions.length > 0) {
      // For group questions, add all sub-questions
      q.subQuestions.forEach(subQ => {
        allQuestionsForNav.push(subQ)
      })
    } else {
      // For single questions, add the question itself
      allQuestionsForNav.push(q)
    }
  })

  // Create a map of answers by question_id
  const answersMap = new Map<string, TestAnswer>()
  attempt?.answers.forEach(ans => {
    answersMap.set(ans.question_id, ans)
  })

  useEffect(() => {
    if (attemptId && testId) {
      fetchReviewData()
    } else {
      setError('Không tìm thấy thông tin bài thi')
      setLoading(false)
    }
  }, [attemptId, testId])

  const fetchReviewData = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Fetching review data...')
      console.log('📝 Test ID:', testId)
      console.log('📋 Attempt ID:', attemptId)
      
      // Fetch attempt data and test data with answers in parallel
      const [attemptData, testDataResponse] = await Promise.all([
        testApi.getAttemptResult(attemptId!),
        testApi.getTestWithAnswers(testId!)  // Changed to getTestWithAnswers để có answer và explanation
      ])
      
      console.log('✅ Attempt data:', attemptData)
      console.log('✅ Test data with answers:', testDataResponse)
      
      // Log chi tiết câu hỏi đầu tiên
      if (testDataResponse.parts && testDataResponse.parts.length > 0) {
        const firstQuestion = testDataResponse.parts[0].questions[0]
        console.log('📌 First question sample:', {
          questionNumber: firstQuestion.questionNumber,
          hasAnswer: !!firstQuestion.answer,
          hasExplanation: !!firstQuestion.explanation,
          hasTranscript: !!firstQuestion.transcript,
          answer: firstQuestion.answer,
          explanationPreview: firstQuestion.explanation?.substring(0, 100),
          transcriptPreview: firstQuestion.transcript?.substring(0, 100)
        })
      }
      
      setAttempt(attemptData)
      setTestData(testDataResponse)
    } catch (error) {
      console.error('❌ Error fetching review data:', error)
      setError('Không thể tải dữ liệu xem lại bài thi')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = allQuestionsForNav[currentQuestionIndex]
  
  // Get user's answer for current question
  const getUserAnswer = (questionId: string): TestAnswer | undefined => {
    return answersMap.get(questionId)
  }

  const handleNext = () => {
    if (currentQuestionIndex < allQuestionsForNav.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu xem lại...</p>
        </div>
      </div>
    )
  }

  if (error || !attempt || !testData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Lỗi</h2>
            <p className="text-gray-600 mb-4">{error || 'Không thể tải dữ liệu'}</p>
            <Button onClick={() => navigate('/practice')}>
              Quay lại trang luyện tập
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (allQuestionsForNav.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Không có câu hỏi nào để xem lại</p>
            <Button onClick={() => navigate(`/practice/test/${testId}/result?attemptId=${attemptId}`)} className="mt-4">
              Quay lại kết quả
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format transcript để hiển thị đẹp hơn
  const formatTranscript = (transcript: string): string => {
    if (!transcript) return ''
    
    // Tách speaker (M-Au, W-Br, etc.) ra khỏi phần còn lại
    const speakerMatch = transcript.match(/^([MW]-[A-Za-z]+)(.*)/)
    if (!speakerMatch) return transcript
    
    const speaker = speakerMatch[1]
    let content = speakerMatch[2]
    
    // Thay thế (A), (B), (C), (D) bằng xuống dòng
    content = content
      .replace(/\(A\)/g, '\n(A)')
      .replace(/\(B\)/g, '\n(B)')
      .replace(/\(C\)/g, '\n(C)')
      .replace(/\(D\)/g, '\n(D)')
    
    return `${speaker}${content}`
  }

  const renderQuestion = (question: Question) => {
    const userAnswer = getUserAnswer(question._id)
    const isCorrect = userAnswer?.is_correct ?? false
    const selectedAnswer = userAnswer?.selected_answer || ''

    // Debug log
    console.log(`Question ${question.questionNumber}:`, {
      hasExplanation: !!question.explanation,
      explanation: question.explanation,
      hasTranscript: !!question.transcript,
      transcript: question.transcript?.substring(0, 50)
    })

    // Convert options object to array
    const optionsArray = ['A', 'B', 'C', 'D'].map(key => ({
      letter: key,
      text: question.options[key as keyof typeof question.options]
    }))

    return (
      <div key={question._id} className="mb-6">
        {/* Audio nếu có */}
        {question.audio && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700">Audio:</span>
            </div>
            <AudioPlayer audioUrl={question.audio} />
          </div>
        )}

        {/* Image nếu có (Part 1) */}
        {question.image && (
          <div className="mb-4">
            <img
              src={question.image}
              alt={`Question ${question.questionNumber}`}
              className="max-w-full h-auto rounded-lg border shadow-sm"
            />
          </div>
        )}

        {/* Transcript ngay sau image (Part 1, 2) */}
        {question.transcript && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <FileTextIcon className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">📝 Transcript / Bản ghi âm:</span>
            </div>
            <p className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed font-mono">
              {formatTranscript(question.transcript)}
            </p>
          </div>
        )}

        {/* Passage nếu có (single question trong Part 6, 7) */}
        {question.passage && (
          <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <FileTextIcon className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-900">Đoạn văn:</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{question.passage}</p>
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <Badge variant="outline" className="mt-1">
            Câu {question.questionNumber}
          </Badge>
          <div className="flex-1">
            {question.questionText && (
              <p className="text-gray-900 font-medium mb-3">{question.questionText}</p>
            )}
            <div className="space-y-2">
              {optionsArray.map(({ letter, text }) => {
                const isUserSelected = selectedAnswer === letter
                const isCorrectAnswer = question.answer === letter

                return (
                  <div
                    key={letter}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : isUserSelected && !isCorrect
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700 min-w-[24px]">
                        {letter}.
                      </span>
                      <span className={`flex-1 ${
                        isCorrectAnswer ? 'font-medium text-green-900' :
                        isUserSelected && !isCorrect ? 'text-red-900' :
                        'text-gray-900'
                      }`}>
                        {text}
                      </span>
                      {isCorrectAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {isUserSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Show user's answer status */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Đáp án đúng:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    {question.answer}
                  </Badge>
                </div>
                {userAnswer && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Bạn chọn:</span>
                    <Badge variant={isCorrect ? 'default' : 'destructive'}>
                      {selectedAnswer}
                    </Badge>
                    {isCorrect ? (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Chính xác
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Sai
                      </span>
                    )}
                  </div>
                )}
              </div>
              {!userAnswer && (
                <Badge variant="secondary">Chưa trả lời</Badge>
              )}
            </div>

            {/* Explanation */}
            {question.explanation ? (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Giải thích:</p>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{question.explanation}</p>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-xs text-gray-500 italic">Chưa có giải thích cho câu hỏi này</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderGroupQuestions = (question: Question) => {
    return (
      <div className="space-y-6">
        {/* Audio for group */}
        {question.audio && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700">Audio:</span>
            </div>
            <AudioPlayer audioUrl={question.audio} />
          </div>
        )}

        {/* Images for group */}
        {question.image && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-700">Hình ảnh:</span>
            </div>
            <img
              src={question.image}
              alt={`Question ${question.questionNumber}`}
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}

        {/* Transcript ngay sau audio/image (Part 3, 4) */}
        {question.transcript && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <FileTextIcon className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-900">📝 Transcript / Bản ghi âm:</span>
            </div>
            <p className="text-sm text-purple-800 whitespace-pre-wrap leading-relaxed font-mono">
              {formatTranscript(question.transcript)}
            </p>
          </div>
        )}

        {/* Context HTML for reading passages */}
        {question.contextHtml && (
          <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <FileTextIcon className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-900">Đoạn văn / Passage:</span>
            </div>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: question.contextHtml }}
            />
          </div>
        )}

        {/* Sub questions */}
        {question.subQuestions?.map((subQ) => (
          <div key={subQ._id}>
            {renderQuestion({
              ...subQ,
              type: 'single',
              part: question.part
            } as Question)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/practice/test/${testId}/result?attemptId=${attemptId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại kết quả
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{testData.test.title}</h1>
                <p className="text-sm text-gray-600">
                  Xem lại đáp án - Điểm: {attempt.total_score}/990
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base px-3 py-1">
                {attempt.correct_answers}/{attempt.answers.length} câu đúng
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Danh sách câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {allQuestionsForNav.map((q, idx) => {
                    const userAnswer = getUserAnswer(q._id)
                    const isCorrect = userAnswer?.is_correct ?? false
                    const isAnswered = !!userAnswer

                    return (
                      <button
                        key={q._id}
                        onClick={() => handleQuestionSelect(idx)}
                        className={`
                          h-10 rounded-lg font-semibold text-sm transition-all
                          ${idx === currentQuestionIndex ? 'ring-2 ring-blue-500' : ''}
                          ${!isAnswered ? 'bg-gray-200 text-gray-600' :
                            isCorrect ? 'bg-green-500 text-white' :
                            'bg-red-500 text-white'}
                        `}
                      >
                        {q.questionNumber}
                      </button>
                    )
                  })}
                </div>
                
                {/* Legend */}
                <div className="pt-4 border-t space-y-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Chú thích:</div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500"></div>
                    <span className="text-xs text-gray-600">Đúng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-500"></div>
                    <span className="text-xs text-gray-600">Sai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-200"></div>
                    <span className="text-xs text-gray-600">Chưa trả lời</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Câu {currentQuestion.questionNumber} - Part {currentQuestion.part}
                  </CardTitle>
                  <Badge variant={
                    getUserAnswer(currentQuestion._id)?.is_correct
                      ? 'default'
                      : 'destructive'
                  }>
                    {getUserAnswer(currentQuestion._id)?.is_correct ? 'Đúng' : 'Sai'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentQuestion.type === 'group' && currentQuestion.subQuestions
                  ? renderGroupQuestions(currentQuestion)
                  : renderQuestion(currentQuestion)}

                {/* Navigation */}
                <div className="flex justify-between mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Câu trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    {currentQuestionIndex + 1} / {allQuestionsForNav.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentQuestionIndex === allQuestionsForNav.length - 1}
                  >
                    Câu sau →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestReviewPage
