"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  ChevronLeft,
  Play,
  BookOpen,
  Headphones
} from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { testApi } from "@/api/testApi"

export default function TestByPartPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [selectedParts, setSelectedParts] = useState<number[]>([])
  const [testInfo, setTestInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (testId) {
      fetchTestInfo()
    }
  }, [testId])

  const fetchTestInfo = async () => {
    try {
      setLoading(true)
      const data = await testApi.getTestById(testId!)
      setTestInfo(data)
    } catch (error) {
      console.error('Error fetching test:', error)
    } finally {
      setLoading(false)
    }
  }

  const defaultTestInfo = {
    title: "ETS 2020 Practice Test 1",
    year: 2020,
    source: "ETS",
    parts: [
      { partNumber: 1, questionIds: Array(6).fill('') },
      { partNumber: 2, questionIds: Array(25).fill('') },
      { partNumber: 3, questionIds: Array(39).fill('') },
      { partNumber: 4, questionIds: Array(30).fill('') },
      { partNumber: 5, questionIds: Array(30).fill('') },
      { partNumber: 6, questionIds: Array(16).fill('') },
      { partNumber: 7, questionIds: Array(54).fill('') }
    ]
  }

  const partDetails = [
    { part: 1, name: "Photographs", questions: 6, time: 3, type: "listening" },
    { part: 2, name: "Question-Response", questions: 25, time: 9, type: "listening" },
    { part: 3, name: "Conversations", questions: 39, time: 17, type: "listening" },
    { part: 4, name: "Short Talks", questions: 30, time: 13, type: "listening" },
    { part: 5, name: "Incomplete Sentences", questions: 30, time: 13, type: "reading" },
    { part: 6, name: "Text Completion", questions: 16, time: 8, type: "reading" },
    { part: 7, name: "Reading Comprehension", questions: 54, time: 54, type: "reading" }
  ]

  const currentTestInfo = testInfo || defaultTestInfo

  const togglePart = (partNum: number) => {
    if (selectedParts.includes(partNum)) {
      setSelectedParts(selectedParts.filter(p => p !== partNum))
    } else {
      setSelectedParts([...selectedParts, partNum])
    }
  }

  const getTotalQuestions = () => {
    return partDetails
      .filter((p: any) => selectedParts.includes(p.part))
      .reduce((sum: number, p: any) => sum + p.questions, 0)
  }

  const getTotalTime = () => {
    return partDetails
      .filter((p: any) => selectedParts.includes(p.part))
      .reduce((sum: number, p: any) => sum + p.time, 0)
  }

  const handleStartTest = () => {
    if (selectedParts.length > 0) {
      navigate(`/practice/test/${testId}/full?parts=${selectedParts.join(',')}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đề thi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Link to="/practice" className="text-gray-500 hover:text-blue-600">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Quay lại
              </Button>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Chọn Part</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentTestInfo.title}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline">{currentTestInfo.year}</Badge>
            <Badge variant="secondary">{currentTestInfo.source}</Badge>
          </div>
          <p className="text-gray-600 mt-4">
            Chọn các Part bạn muốn luyện tập
          </p>
        </div>

        {/* Parts Selection */}
        <div className="space-y-4 mb-8">
          {/* Listening Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Headphones className="h-5 w-5 text-blue-500" />
                <span>Listening Comprehension</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {partDetails.filter((p: any) => p.type === "listening").map((part: any) => (
                  <button
                    key={part.part}
                    onClick={() => togglePart(part.part)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedParts.includes(part.part)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">
                          Part {part.part}: {part.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {part.questions} câu hỏi • {part.time} phút
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedParts.includes(part.part)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedParts.includes(part.part) && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reading Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span>Reading Comprehension</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {partDetails.filter((p: any) => p.type === "reading").map((part: any) => (
                  <button
                    key={part.part}
                    onClick={() => togglePart(part.part)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedParts.includes(part.part)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">
                          Part {part.part}: {part.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {part.questions} câu hỏi • {part.time} phút
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedParts.includes(part.part)
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedParts.includes(part.part) && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary and Start */}
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div>
                  <div className="text-sm text-gray-600">Parts đã chọn</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedParts.length > 0 ? selectedParts.sort((a, b) => a - b).join(', ') : '—'}
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <div className="text-sm text-gray-600">Tổng số câu</div>
                  <div className="text-2xl font-bold">{getTotalQuestions()}</div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Thời gian</div>
                    <div className="text-2xl font-bold">{getTotalTime()} phút</div>
                  </div>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={handleStartTest}
                disabled={selectedParts.length === 0}
                className="px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Bắt đầu luyện tập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
