import { useState, useEffect } from 'react'
import { Plus, Trash2, BookOpen, ToggleLeft, ToggleRight, Calendar, CheckCircle, Clock, Search, Filter, User, Loader2, FileJson } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import AdminMenu from '../../components/AdminMenu'
import ImportTestDialog from '../../components/ImportTestDialog'
import { adminTestApi } from '../../api/adminTestApi'
import { useToast } from '../../hooks/use-toast'

type Choice = { id: number; text: string; isCorrect?: boolean; media?: string }

type Section = {
  id: number
  kind: 'audio' | 'image' | 'mcq' | 'mcq_audio' | 'mcq_image'
  title: string
  src?: string // url for audio or image
  choices?: Choice[]
}

type TestItem = {
  _id?: string
  id?: number
  title: string
  description: string
  status: 'active' | 'pending'
  questions: number
  sections?: Section[]
  createdDate?: string
  author?: string
  year?: number
  source?: string
  audioUrl?: string
  time_limit?: number
  passing_score?: number
  is_published?: boolean
}

export default function TestManagerPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Load tests from API
  useEffect(() => {
    loadTests()
  }, [])
  
  const loadTests = async () => {
    try {
      setLoading(true)
      const response = await adminTestApi.getAllTests({ limit: 100 })
      // Convert API format to local format
      const convertedTests: TestItem[] = response.data.map((test: any) => ({
        _id: test._id,
        id: parseInt(test._id.slice(-8), 16), // Fake ID for UI
        title: test.title,
        description: test.source || 'Đề thi TOEIC',
        status: test.is_published ? 'active' : 'pending',
        questions: test.parts?.reduce((sum: number, part: any) => sum + (part.questionIds?.length || 0), 0) || 0,
        sections: [],
        createdDate: test.createdAt ? new Date(test.createdAt).toISOString().split('T')[0] : undefined,
        author: 'Admin',
        year: test.year,
        source: test.source,
        audioUrl: test.audioUrl,
        time_limit: test.time_limit,
        passing_score: test.passing_score,
        is_published: test.is_published,
      }))
      setTests(convertedTests)
    } catch (error: any) {
      console.error('Failed to load tests:', error)
      toast({
        title: 'Lỗi tải dữ liệu',
        description: error.response?.data?.message || 'Không thể tải danh sách đề thi',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState({
    author: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  })
  const [form, setForm] = useState<{ 
    title: string; 
    description: string; 
    year?: number;
    source?: string;
    audioUrl?: string;
    time_limit?: number;
    passing_score?: number;
  }>({ 
    title: '', 
    description: '',
    time_limit: 120,
    passing_score: 495
  })

  const createTest = async () => {
    try {
      const newTest = await adminTestApi.createTest({
        title: form.title || 'Untitled Test',
        year: form.year,
        source: form.source,
        audioUrl: form.audioUrl,
        time_limit: form.time_limit || 120,
        passing_score: form.passing_score || 495,
        parts: [
          { partNumber: 1, questionIds: [] },
          { partNumber: 2, questionIds: [] },
          { partNumber: 3, questionIds: [] },
          { partNumber: 4, questionIds: [] },
          { partNumber: 5, questionIds: [] },
          { partNumber: 6, questionIds: [] },
          { partNumber: 7, questionIds: [] }
        ],
      })
      
      toast({
        title: 'Tạo đề thành công',
        description: `Đề "${newTest.title}" đã được tạo. Chuyển đến trang chỉnh sửa...`,
      })
      
      setShowCreate(false)
      setForm({ title: '', description: '', time_limit: 120, passing_score: 495 })
      
      // Navigate to edit page to add parts and questions
      navigate(`/admin/tests/edit/${newTest._id}`)
    } catch (error: any) {
      console.error('Failed to create test:', error)
      toast({
        title: 'Lỗi tạo đề',
        description: error.response?.data?.message || 'Không thể tạo đề thi',
        variant: 'destructive',
      })
    }
  }

  const deleteTest = async (testId: string) => {
    try {
      await adminTestApi.deleteTest(testId)
      toast({
        title: 'Xóa đề thành công',
        description: 'Đề thi đã được xóa',
      })
      await loadTests()
    } catch (error: any) {
      console.error('Failed to delete test:', error)
      toast({
        title: 'Lỗi xóa đề',
        description: error.response?.data?.message || 'Không thể xóa đề thi',
        variant: 'destructive',
      })
    }
  }

  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      await adminTestApi.publishTest(testId, !currentStatus)
      toast({
        title: 'Cập nhật trạng thái',
        description: `Đề thi đã ${!currentStatus ? 'xuất bản' : 'ẩn'}`,
      })
      await loadTests()
    } catch (error: any) {
      console.error('Failed to toggle test status:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: error.response?.data?.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      })
    }
  }

  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // Filter tests based on search term and advanced filters
  const filteredTests = tests.filter(test => {
    // Basic search filter
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Advanced filters
    const matchesAuthor = !filters.author || test.author?.toLowerCase().includes(filters.author.toLowerCase())
    const matchesStatus = !filters.status || filters.status === 'all' || test.status === filters.status
    
    // Date range filter
    let matchesDateRange = true
    if (filters.dateFrom || filters.dateTo) {
      const testDate = new Date(test.createdDate || '')
      if (filters.dateFrom) {
        matchesDateRange = matchesDateRange && testDate >= new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        matchesDateRange = matchesDateRange && testDate <= new Date(filters.dateTo)
      }
    }

    return matchesSearch && matchesAuthor && matchesStatus && matchesDateRange
  })

  const clearFilters = () => {
    setFilters({
      author: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    })
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Đề</h1>
            <p className="text-gray-600">Tạo, sửa và xóa đề thi cho hệ thống TOEIC</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowImport(true)}
            >
              <FileJson className="w-4 h-4" />
              Import JSON
            </Button>
            
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo đề thi mới
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo đề mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="test-title">Tiêu đề đề thi</Label>
                    <Input 
                      id="test-title"
                      placeholder="Ví dụ: ETS 2024 Test 1" 
                      value={form.title} 
                      onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="test-description">Mô tả</Label>
                    <Textarea 
                      id="test-description"
                      placeholder="Mô tả ngắn gọn về đề thi" 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="test-year">Năm phát hành</Label>
                      <Input 
                        id="test-year"
                        type="number" 
                        placeholder="2024" 
                        value={form.year || ''} 
                        onChange={(e) => setForm({ ...form, year: Number(e.target.value) || undefined })} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="test-source">Nguồn</Label>
                      <Input 
                        id="test-source"
                        placeholder="ETS, Hackers..." 
                        value={form.source || ''} 
                        onChange={(e) => setForm({ ...form, source: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="test-time">Thời gian (phút)</Label>
                      <Input 
                        id="test-time"
                        type="number" 
                        placeholder="120" 
                        value={form.time_limit || ''} 
                        onChange={(e) => setForm({ ...form, time_limit: Number(e.target.value) || undefined })} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="test-passing">Điểm đạt</Label>
                      <Input 
                        id="test-passing"
                        type="number" 
                        placeholder="495" 
                        value={form.passing_score || ''} 
                        onChange={(e) => setForm({ ...form, passing_score: Number(e.target.value) || undefined })} 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="test-audio">Audio URL (tùy chọn)</Label>
                    <Input 
                      id="test-audio"
                      placeholder="https://..." 
                      value={form.audioUrl || ''} 
                      onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
                  <Button onClick={createTest} disabled={!form.title}>Tạo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search bar and Advanced Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm đề thi theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            >
              <Filter className="w-4 h-4" />
              Lọc nâng cao
              {(filters.author || filters.dateFrom || filters.dateTo || (filters.status && filters.status !== 'all')) && (
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                  Có lọc
                </Badge>
              )}
            </Button>
          </div>
          
          {/* Advanced Filter Panel */}
          {showAdvancedFilter && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="filter-author">Tác giả</Label>
                  <Input
                    id="filter-author"
                    placeholder="Nhập tên tác giả..."
                    value={filters.author}
                    onChange={(e) => setFilters({...filters, author: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="filter-status">Trạng thái</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="pending">Chưa xuất bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="filter-date-from">Từ ngày</Label>
                  <Input
                    id="filter-date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="filter-date-to">Đến ngày</Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Hoạt động</TabsTrigger>
            <TabsTrigger value="pending">Chưa xuất bản</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <TabsContent value="active">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTests.filter(t => t.status === 'active').map(t => (
                <Card key={t.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader onClick={() => navigate(`/admin/tests/edit/${t._id}`)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {t.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đang hoạt động
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (t._id) toggleTestStatus(t._id, t.is_published || false);
                          }}
                          title="Chuyển thành chưa xuất bản"
                        >
                          <ToggleLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (t._id) deleteTest(t._id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent onClick={() => navigate(`/admin/tests/edit/${t._id}`)}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {t.questions} câu
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{t.sections?.length || 0} phần</span>
                        <span>Đề thi TOEIC</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{t.author || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{t.createdDate ? new Date(t.createdDate).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTests.filter(t => t.status === 'pending').map(t => (
                <Card key={t.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader onClick={() => navigate(`/admin/tests/edit/${t._id}`)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {t.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Chưa xuất bản
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (t._id) toggleTestStatus(t._id, t.is_published || false);
                          }}
                          title="Chuyển thành hoạt động"
                        >
                          <ToggleRight className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (t._id) deleteTest(t._id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent onClick={() => navigate(`/admin/tests/edit/${t._id}`)}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {t.questions} câu
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{t.sections?.length || 0} phần</span>
                        <span>Đề thi TOEIC</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{t.author || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{t.createdDate ? new Date(t.createdDate).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
              </TabsContent>
            </>
          )}
        </Tabs>
        </div>
      </div>
      
      <ImportTestDialog 
        open={showImport}
        onOpenChange={setShowImport}
      />
    </div>
  )
}
