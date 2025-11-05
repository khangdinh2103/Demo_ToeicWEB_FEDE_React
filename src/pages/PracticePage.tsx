"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Play, 
  RotateCcw, 
  BookMarked,
  Video
} from "lucide-react"
import { Link } from "react-router-dom"
import VocabularyPractice from "@/components/VocabularyPractice"
import DictationPractice from "@/components/DictationPractice"
import { testApi, type Test } from "@/api/testApi"

export default function PracticePage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedYears, setSelectedYears] = useState<number[]>([2020])
  const [selectedSources, setSelectedSources] = useState<string[]>(['ETS'])
  const [totalTests, setTotalTests] = useState(0)

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
            <VocabularyPractice />
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
                  <p className="text-sm text-gray-600">
                    {loading ? 'Đang tải...' : `Tìm thấy ${totalTests} đề thi`}
                  </p>
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
