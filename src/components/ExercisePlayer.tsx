"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  FileText, Clock, CheckCircle, XCircle, RotateCcw, 
  ArrowRight, ArrowLeft, Flag, Target 
} from "lucide-react"

interface Question {
  id: number
  type: 'multiple-choice' | 'listening' | 'reading'
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  audio?: string
  image?: string
}

interface ExercisePlayerProps {
  lesson: {
    id: number
    title: string
    questions: number
    completed?: boolean
  }
  onComplete?: (score: number) => void
}

// Mock questions data
const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    question: 'What is the man going to do this weekend?',
    options: [
      'Go to the movies',
      'Visit his family',
      'Work on a project',
      'Travel to another city'
    ],
    correctAnswer: 1,
    explanation: 'In the conversation, the man clearly states he plans to visit his family this weekend.',
    audio: '/audio/question1.mp3'
  },
  {
    id: 2,
    type: 'reading',
    question: 'Choose the best word to complete the sentence: The company will _____ a new product next month.',
    options: [
      'lunch',
      'launch',
      'lunch',
      'lounge'
    ],
    correctAnswer: 1,
    explanation: '"Launch" means to introduce or start something new, which fits the context of introducing a new product.'
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: 'According to the passage, what is the main benefit of remote work?',
    options: [
      'Higher salary',
      'Better work-life balance',
      'More vacation time',
      'Free meals'
    ],
    correctAnswer: 1,
    explanation: 'The passage emphasizes that remote work primarily helps employees achieve better work-life balance.'
  }
]

export default function ExercisePlayer({ lesson, onComplete }: ExercisePlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(lesson.questions * 90) // 1.5 minutes per question
  const [isStarted, setIsStarted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const questions = mockQuestions.slice(0, lesson.questions)

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResults) {
      handleFinish()
    }
  }, [timeLeft, isStarted, showResults])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowExplanation(false)
    }
  }

  const handleFinish = () => {
    const score = calculateScore()
    setShowResults(true)
    onComplete?.(score)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const restart = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setTimeLeft(lesson.questions * 90)
    setIsStarted(false)
    setShowExplanation(false)
  }

  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileText className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          <CardDescription>
            Chuẩn bị làm bài tập với {lesson.questions} câu hỏi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold">{lesson.questions} câu hỏi</p>
              <p className="text-sm text-gray-600">Trắc nghiệm</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold">{Math.ceil(lesson.questions * 1.5)} phút</p>
              <p className="text-sm text-gray-600">Thời gian làm bài</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Đọc kỹ câu hỏi trước khi chọn đáp án</li>
              <li>• Có thể quay lại câu hỏi trước đó để kiểm tra</li>
              <li>• Thời gian sẽ được tính ngược khi bắt đầu</li>
              <li>• Bài sẽ tự động nộp khi hết thời gian</li>
            </ul>
          </div>

          <Button 
            onClick={() => setIsStarted(true)} 
            className="w-full" 
            size="lg"
          >
            Bắt đầu làm bài
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const correctAnswers = Object.keys(answers).filter(
      key => answers[parseInt(key)] === questions.find(q => q.id === parseInt(key))?.correctAnswer
    ).length

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Target className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Kết quả bài tập</CardTitle>
          <CardDescription>Bạn đã hoàn thành bài tập</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-lg text-gray-600">
              {correctAnswers}/{questions.length} câu đúng
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-600">{correctAnswers}</p>
              <p className="text-sm text-gray-600">Câu đúng</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="font-semibold text-red-600">{questions.length - correctAnswers}</p>
              <p className="text-sm text-gray-600">Câu sai</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Xem lại đáp án:</h4>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id]
              const isCorrect = userAnswer === question.correctAnswer
              
              return (
                <div key={question.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium">Câu {index + 1}</span>
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{question.question}</p>
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">Đáp án đúng: </span>
                    <span className="font-medium text-green-600">
                      {question.options[question.correctAnswer]}
                    </span>
                    {userAnswer !== undefined && userAnswer !== question.correctAnswer && (
                      <>
                        <br />
                        <span className="text-gray-500">Bạn chọn: </span>
                        <span className="font-medium text-red-600">
                          {question.options[userAnswer]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex space-x-3">
            <Button onClick={restart} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Làm lại
            </Button>
            <Button className="flex-1">
              Tiếp tục học
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with progress and timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Câu {currentQuestion + 1} / {questions.length}
              </span>
              <Badge variant="outline">
                {currentQ.type === 'listening' ? 'Nghe' : 
                 currentQ.type === 'reading' ? 'Đọc' : 'Trắc nghiệm'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className={timeLeft < 60 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQ.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.audio && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <audio controls className="w-full">
                <source src={currentQ.audio} type="audio/mpeg" />
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          )}

          <RadioGroup
            value={answers[currentQ.id]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showExplanation && currentQ.explanation && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Giải thích:</h4>
              <p className="text-yellow-700">{currentQ.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Câu trước
        </Button>

        <div className="flex items-center space-x-2">
          {currentQ.explanation && (
            <Button
              variant="ghost"
              onClick={() => setShowExplanation(!showExplanation)}
              size="sm"
            >
              {showExplanation ? 'Ẩn' : 'Xem'} giải thích
            </Button>
          )}
          
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
              <Flag className="mr-2 h-4 w-4" />
              Nộp bài
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Câu tiếp
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
