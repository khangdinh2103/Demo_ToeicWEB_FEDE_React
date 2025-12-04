"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BookOpen, 
  Play, 
  RotateCcw, 
  BookMarked,
  Video,
  History,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import VocabularyPractice from "@/components/VocabularyPractice"
import DictationPractice from "@/components/DictationPractice"
import { testApi, type Test, type TestAttempt } from "@/api/testApi"

export default function PracticePage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedYears, setSelectedYears] = useState<number[]>([2020])
  const [selectedSources, setSelectedSources] = useState<string[]>(['ETS'])
  const [totalTests, setTotalTests] = useState(0)
  
  // History states
  const [showHistory, setShowHistory] = useState(false)
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Fetch tests khi filter thay đổi
  useEffect(() => {
    fetchTests()
  }, [selectedYears, selectedSources])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const result = await testApi.getAllTests({
        page: 1,
        limit: 20,
        year: selectedYears.length > 0 ? selectedYears[0] : undefined,
        source: selectedSources.length > 0 ? selectedSources[0] : undefined,
      })
      setTests(result.data)
      setTotalTests(result.total)
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [year]
    )
  }

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [source]
    )
  }

  const resetFilters = () => {
    setSelectedYears([2020])
    setSelectedSources(['ETS'])
  }

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoadingHistory(true)
      
      // Kiểm tra token - sử dụng accessToken thay vì token
      const token = localStorage.getItem('accessToken')
      console.log('🔑 Token check:', token ? 'Token exists' : 'No token found')
      
      if (!token) {
        console.log('❌ User not logged in - no token')
        setIsLoggedIn(false)
        setAttempts([])
        setTotalAttempts(0)
        return
      }
      
      console.log('✅ Token found, fetching history...')
      setIsLoggedIn(true)
      const result = await testApi.getUserAttempts(page, 10)
      console.log('📊 History result:', result)
      setAttempts(result.data)
      setTotalAttempts(result.total)
      setHistoryPage(page)
    } catch (error: any) {
      console.error('❌ Error fetching test history:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error response data:', error.response?.data)
      console.error('❌ Error message:', error.response?.data?.message)
      
      // Check if it's a route order issue (backend needs restart)
      if (error.response?.data?.message?.includes('Cannot cast attempts to ObjectId')) {
        console.error('⚠️ Backend route order issue - server needs restart!')
      }
      
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log('🔐 Error:', error.response?.data?.message)
        // Chỉ set isLoggedIn = false nếu là lỗi authentication thực sự
        if (error.response?.data?.message?.includes('token') || 
            error.response?.data?.message?.includes('authentication') ||
            error.response?.data?.message?.includes('unauthorized')) {
          setIsLoggedIn(false)
        }
        setAttempts([])
        setTotalAttempts(0)
      }
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleOpenHistory = () => {
    setShowHistory(true)
    fetchHistory(1) // Always fetch to check current auth state
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'abandoned': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành'
      case 'in_progress': return 'Đang làm'
      case 'abandoned': return 'Đã hủy'
      default: return status
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Luyện tập</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Luyện Tập TOEIC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Luyện tập theo từng phần hoặc làm full test để cải thiện điểm số TOEIC của bạn
          </p>
        </div>

        <Tabs defaultValue="vocabulary" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vocabulary">
              <BookMarked className="h-4 w-4 mr-2" />
              Từ vựng
            </TabsTrigger>
            <TabsTrigger value="dictation">
              <Video className="h-4 w-4 mr-2" />
              Chép chính tả
            </TabsTrigger>
            <TabsTrigger value="practice-tests">Luyện đề</TabsTrigger>
          </TabsList>

          {/* Vocabulary Practice */}
          <TabsContent value="vocabulary">
            <div className="space-y-6">
              {/* AI Generate Button */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      ✨ Tạo Set Từ Vựng với AI
                    </h3>
                    <p className="text-gray-600">
                      Nhập chủ đề bạn muốn học, AI sẽ tự động tạo bộ từ vựng hoàn chỉnh cho bạn
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => navigate("/practice/create-vocabulary")}
                    className="ml-4"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Tạo Set Mới
                  </Button>
                </div>
              </Card>
              
              <VocabularyPractice />
            </div>
          </TabsContent>

          {/* Dictation Practice */}
          <TabsContent value="dictation">
            <DictationPractice />
          </TabsContent>

          {/* Practice Tests */}
          <TabsContent value="practice-tests">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Filter */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Bộ lọc</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Year Filter */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Năm xuất bản</label>
                      <div className="space-y-2">
                        {[2024, 2023, 2022, 2021, 2020].map(year => (
                          <label key={year} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300" 
                              checked={selectedYears.includes(year)}
                              onChange={() => toggleYear(year)}
                            />
                            <span className="text-sm">{year}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Nguồn đề thi</label>
                      <div className="space-y-2">
                        {['ETS', 'New Economy', 'Hackers', 'Actual Test'].map(source => (
                          <label key={source} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300" 
                              checked={selectedSources.includes(source)}
                              onChange={() => toggleSource(source)}
                            />
                            <span className="text-sm">{source}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Độ khó</label>
                      <div className="space-y-2">
                        {['Dễ', 'Trung bình', 'Khó'].map(level => (
                          <label key={level} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                            <span className="text-sm">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full" variant="outline" onClick={resetFilters}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Đặt lại bộ lọc
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Test List */}
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Danh sách đề thi</h2>
                  <div className="flex items-center gap-4">
                    <Dialog open={showHistory} onOpenChange={setShowHistory}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={handleOpenHistory}>
                          <History className="h-4 w-4 mr-2" />
                          Lịch sử luyện đề
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Lịch sử luyện đề của bạn
                          </DialogTitle>
                          <DialogDescription>
                            Xem lại các lần luyện đề TOEIC của bạn, bao gồm điểm số và thời gian hoàn thành
                          </DialogDescription>
                        </DialogHeader>
                        
                        <ScrollArea className="h-[600px] pr-4">
                          {loadingHistory ? (
                            <div className="text-center py-12">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="mt-4 text-gray-600">Đang tải lịch sử...</p>
                            </div>
                          ) : !isLoggedIn && attempts.length === 0 ? (
                            <div className="text-center py-12">
                              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-2">Vui lòng đăng nhập để xem lịch sử luyện đề</p>
                              <Link to="/login">
                                <Button variant="default" size="sm">
                                  Đăng nhập
                                </Button>
                              </Link>
                            </div>
                          ) : attempts.length === 0 ? (
                            <div className="text-center py-12">
                              <p className="text-gray-600">Bạn chưa làm bài test nào</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {attempts.map((attempt) => (
                                <Card key={attempt._id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h3 className="font-semibold text-lg">
                                            {typeof attempt.test_id === 'object' && attempt.test_id !== null 
                                              ? (attempt.test_id as any).title || 'Đề thi'
                                              : `Test ID: ${attempt.test_id}`}
                                          </h3>
                                          <Badge className={getStatusColor(attempt.status)}>
                                            {getStatusText(attempt.status)}
                                          </Badge>
                                        </div>
                                        {typeof attempt.test_id === 'object' && attempt.test_id !== null && (
                                          <div className="text-sm text-gray-500 mb-2">
                                            {(attempt.test_id as any).source && `${(attempt.test_id as any).source} `}
                                            {(attempt.test_id as any).year && `- ${(attempt.test_id as any).year}`}
                                          </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-gray-600">
                                              <Clock className="h-4 w-4" />
                                              <span>Bắt đầu: {formatDate(attempt.started_at)}</span>
                                            </div>
                                            {attempt.completed_at && (
                                              <div className="flex items-center gap-2 text-gray-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Hoàn thành: {formatDate(attempt.completed_at)}</span>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {attempt.status === 'completed' && (
                                            <div className="space-y-1">
                                              {attempt.time_used !== undefined && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                  <Clock className="h-4 w-4" />
                                                  <span>Thời gian làm bài: {Math.floor(attempt.time_used / 60)} phút {attempt.time_used % 60} giây</span>
                                                </div>
                                              )}
                                              <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                                <span className="font-semibold text-blue-600">
                                                  Tổng điểm: {attempt.total_score || 0}
                                                </span>
                                              </div>
                                              <div className="text-gray-600 text-xs">
                                                Listening: {attempt.listening_score || 0} | Reading: {attempt.reading_score || 0}
                                              </div>
                                              {(attempt.correct_answers !== undefined && attempt.correct_answers > 0) && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                                  <span>{attempt.correct_answers}/{attempt.total_questions} câu đúng</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {attempt.status === 'completed' && (
                                        <Link to={`/practice/test/${typeof attempt.test_id === 'object' && attempt.test_id !== null ? (attempt.test_id as any)._id : attempt.test_id}/review?attemptId=${attempt._id}`}>
                                          <Button size="sm" variant="outline">
                                            Xem chi tiết
                                          </Button>
                                        </Link>
                                      )}
                                      {attempt.status === 'in_progress' && (
                                        <Link to={`/practice/test/${typeof attempt.test_id === 'object' && attempt.test_id !== null ? (attempt.test_id as any)._id : attempt.test_id}/full?attempt=${attempt._id}`}>
                                          <Button size="sm" variant="default">
                                            Tiếp tục
                                          </Button>
                                        </Link>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              
                              {/* Pagination */}
                              {totalAttempts > 10 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={historyPage === 1}
                                    onClick={() => fetchHistory(historyPage - 1)}
                                  >
                                    Trang trước
                                  </Button>
                                  <span className="text-sm text-gray-600">
                                    Trang {historyPage} / {Math.ceil(totalAttempts / 10)}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={historyPage >= Math.ceil(totalAttempts / 10)}
                                    onClick={() => fetchHistory(historyPage + 1)}
                                  >
                                    Trang sau
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    
                    <p className="text-sm text-gray-600">
                      {loading ? 'Đang tải...' : `Tìm thấy ${totalTests} đề thi`}
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải danh sách đề thi...</p>
                  </div>
                ) : tests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Không tìm thấy đề thi nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tests.map(test => (
                      <Card key={test._id} className="hover:shadow-lg transition-all border-2 hover:border-blue-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg mb-1">{test.title}</CardTitle>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Badge variant="outline" className="text-xs">{test.year}</Badge>
                                <Badge variant="secondary" className="text-xs">{test.source}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Link to={`/practice/test/${test._id}/full`}>
                            <Button variant="default" className="w-full justify-start" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Luyện thi trên máy
                            </Button>
                          </Link>
                          <Link to={`/practice/test/${test._id}/by-part`}>
                            <Button variant="outline" className="w-full justify-start" size="sm">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Luyện thi theo Part
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
