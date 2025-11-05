import { useState, useEffect } from 'react'
import { Plus, Trash2, BookOpen, ToggleLeft, ToggleRight, Calendar, CheckCircle, Clock, Search, Filter, User, Loader2, Edit } from 'lucide-react'
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
import { adminCourseApi, type CreateCourseRequest, type UpdateCourseRequest } from '../../api/adminCourseApi'
import { useToast } from '../../hooks/use-toast'

type CourseItem = {
  _id: string
  title: string
  description?: string
  short_description?: string
  thumbnail?: string
  level?: string
  skill_groups?: string[]
  price: number
  original_price: number
  is_free: boolean
  is_published: boolean
  total_enrollments: number
  average_rating: number
  total_reviews: number
  order: number
  createdAt?: string
  updatedAt?: string
}

export default function CourseManagementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState({
    level: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  })
  
  // Dialog states
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)
  
  // Form state
  const [form, setForm] = useState<CreateCourseRequest | UpdateCourseRequest>({
    title: '',
    description: '',
    short_description: '',
    thumbnail: '',
    level: 'beginner',
    skill_groups: [],
    price: 0,
    original_price: 0,
    is_free: true,
    order: 1
  })
  
  // Load courses from API
  useEffect(() => {
    loadCourses()
  }, [])
  
  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await adminCourseApi.getAllCourses({ limit: 100 })
      setCourses(response.data.data || response.data || [])
    } catch (error: any) {
      console.error('Failed to load courses:', error)
      toast({
        title: 'Lỗi tải dữ liệu',
        description: error.response?.data?.message || 'Không thể tải danh sách khóa học',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createCourse = async () => {
    try {
      await adminCourseApi.createCourse(form as CreateCourseRequest)
      
      toast({
        title: 'Tạo khóa học thành công',
        description: `Khóa học "${form.title}" đã được tạo.`,
      })
      
      setShowCreate(false)
      resetForm()
      await loadCourses()
    } catch (error: any) {
      console.error('Failed to create course:', error)
      toast({
        title: 'Lỗi tạo khóa học',
        description: error.response?.data?.message || 'Không thể tạo khóa học',
        variant: 'destructive',
      })
    }
  }

  const updateCourse = async () => {
    if (!editingCourse) return
    
    try {
      await adminCourseApi.updateCourse(editingCourse._id, form as UpdateCourseRequest)
      
      toast({
        title: 'Cập nhật khóa học thành công',
        description: `Khóa học "${form.title}" đã được cập nhật.`,
      })
      
      setShowEdit(false)
      setEditingCourse(null)
      resetForm()
      await loadCourses()
    } catch (error: any) {
      console.error('Failed to update course:', error)
      toast({
        title: 'Lỗi cập nhật khóa học',
        description: error.response?.data?.message || 'Không thể cập nhật khóa học',
        variant: 'destructive',
      })
    }
  }

  const deleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"?`)) return
    
    try {
      await adminCourseApi.deleteCourse(courseId)
      toast({
        title: 'Xóa khóa học thành công',
        description: 'Khóa học đã được xóa',
      })
      await loadCourses()
    } catch (error: any) {
      console.error('Failed to delete course:', error)
      toast({
        title: 'Lỗi xóa khóa học',
        description: error.response?.data?.message || 'Không thể xóa khóa học',
        variant: 'destructive',
      })
    }
  }

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    try {
      await adminCourseApi.publishCourse(courseId, !currentStatus)
      toast({
        title: 'Cập nhật trạng thái',
        description: `Khóa học đã ${!currentStatus ? 'xuất bản' : 'ẩn'}`,
      })
      await loadCourses()
    } catch (error: any) {
      console.error('Failed to toggle course status:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: error.response?.data?.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      short_description: '',
      thumbnail: '',
      level: 'beginner',
      skill_groups: [],
      price: 0,
      original_price: 0,
      is_free: true,
      order: 1
    })
  }

  const openEditDialog = (course: CourseItem) => {
    setEditingCourse(course)
    setForm({
      title: course.title,
      description: course.description || '',
      short_description: course.short_description || '',
      thumbnail: course.thumbnail || '',
      level: (course.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      skill_groups: course.skill_groups || [],
      price: course.price,
      original_price: course.original_price,
      is_free: course.is_free,
      order: course.order
    })
    setShowEdit(true)
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = !filters.level || filters.level === 'all' || course.level === filters.level
    const matchesStatus = !filters.status || filters.status === 'all' || 
      (filters.status === 'published' && course.is_published) ||
      (filters.status === 'unpublished' && !course.is_published)
    
    let matchesDateRange = true
    if (filters.dateFrom || filters.dateTo) {
      const courseDate = new Date(course.createdAt || '')
      if (filters.dateFrom) {
        matchesDateRange = matchesDateRange && courseDate >= new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        matchesDateRange = matchesDateRange && courseDate <= new Date(filters.dateTo)
      }
    }

    return matchesSearch && matchesLevel && matchesStatus && matchesDateRange
  })

  const clearFilters = () => {
    setFilters({
      level: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    })
    setSearchTerm('')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const CourseFormDialog = ({ mode }: { mode: 'create' | 'edit' }) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Tạo khóa học mới' : 'Chỉnh sửa khóa học'}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Tiêu đề khóa học *</Label>
          <Input 
            id="title"
            placeholder="Ví dụ: TOEIC LR Cơ Bản 450+" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="short_description">Mô tả ngắn</Label>
          <Input 
            id="short_description"
            placeholder="Mô tả ngắn gọn cho thẻ khóa học" 
            value={form.short_description || ''} 
            onChange={(e) => setForm({ ...form, short_description: e.target.value })} 
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Mô tả chi tiết</Label>
          <Textarea 
            id="description"
            placeholder="Mô tả đầy đủ về khóa học, nội dung, mục tiêu..." 
            value={form.description || ''} 
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="level">Trình độ</Label>
            <Select value={form.level} onValueChange={(value) => setForm({ ...form, level: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trình độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Cơ bản</SelectItem>
                <SelectItem value="intermediate">Trung cấp</SelectItem>
                <SelectItem value="advanced">Cao cấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="order">Thứ tự hiển thị</Label>
            <Input 
              id="order"
              type="number" 
              placeholder="1" 
              value={form.order || ''} 
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })} 
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="thumbnail">Thumbnail URL</Label>
          <Input 
            id="thumbnail"
            placeholder="https://example.com/image.jpg" 
            value={form.thumbnail || ''} 
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="price">Giá bán (VNĐ)</Label>
            <Input 
              id="price"
              type="number" 
              placeholder="990000" 
              value={form.price || ''} 
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="original_price">Giá gốc (VNĐ)</Label>
            <Input 
              id="original_price"
              type="number" 
              placeholder="1490000" 
              value={form.original_price || ''} 
              onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) || 0 })} 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox"
            id="is_free"
            checked={form.is_free}
            onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
            className="w-4 h-4"
          />
          <Label htmlFor="is_free">Khóa học miễn phí</Label>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => mode === 'create' ? setShowCreate(false) : setShowEdit(false)}>
          Hủy
        </Button>
        <Button onClick={mode === 'create' ? createCourse : updateCourse} disabled={!form.title}>
          {mode === 'create' ? 'Tạo' : 'Cập nhật'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quản lý Khóa học</h1>
              <p className="text-gray-600">Tạo, sửa và xóa khóa học cho hệ thống</p>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo khóa học mới
                </Button>
              </DialogTrigger>
              <CourseFormDialog mode="create" />
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
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
                {(filters.level || filters.dateFrom || filters.dateTo || filters.status) && (
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                    Có lọc
                  </Badge>
                )}
              </Button>
            </div>
            
            {showAdvancedFilter && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="grid gap-2">
                    <Label htmlFor="filter-level">Trình độ</Label>
                    <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trình độ</SelectItem>
                        <SelectItem value="beginner">Cơ bản</SelectItem>
                        <SelectItem value="intermediate">Trung cấp</SelectItem>
                        <SelectItem value="advanced">Cao cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="filter-status">Trạng thái</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="published">Đã xuất bản</SelectItem>
                        <SelectItem value="unpublished">Chưa xuất bản</SelectItem>
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
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="outline" onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="published">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
              <TabsTrigger value="unpublished">Chưa xuất bản</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <>
                <TabsContent value="published">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.filter(c => c.is_published).map(course => (
                      <Card key={course._id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader onClick={() => navigate(`/admin/courses/${course._id}`)}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đã xuất bản
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(course);
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCourseStatus(course._id, course.is_published);
                                }}
                                title="Ẩn khóa học"
                              >
                                <ToggleLeft className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCourse(course._id, course.title);
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {course.thumbnail && (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent onClick={() => navigate(`/admin/courses/${course._id}`)}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {course.level === 'beginner' ? 'Cơ bản' : course.level === 'intermediate' ? 'Trung cấp' : 'Cao cấp'}
                              </Badge>
                              {course.is_free ? (
                                <Badge className="bg-green-500 text-xs">Miễn phí</Badge>
                              ) : (
                                <Badge className="bg-blue-500 text-xs">{formatPrice(course.price)}</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{course.total_enrollments || 0} học viên</span>
                              <span>⭐ {course.average_rating?.toFixed(1) || '5.0'}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>Admin</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unpublished">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.filter(c => !c.is_published).map(course => (
                      <Card key={course._id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader onClick={() => navigate(`/admin/courses/${course._id}`)}>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Chưa xuất bản
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(course);
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCourseStatus(course._id, course.is_published);
                                }}
                                title="Xuất bản"
                              >
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCourse(course._id, course.title);
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          {course.thumbnail && (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                          )}
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            {course.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent onClick={() => navigate(`/admin/courses/${course._id}`)}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {course.level === 'beginner' ? 'Cơ bản' : course.level === 'intermediate' ? 'Trung cấp' : 'Cao cấp'}
                              </Badge>
                              {course.is_free ? (
                                <Badge className="bg-green-500 text-xs">Miễn phí</Badge>
                              ) : (
                                <Badge className="bg-blue-500 text-xs">{formatPrice(course.price)}</Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{course.total_enrollments || 0} học viên</span>
                              <span>⭐ {course.average_rating?.toFixed(1) || '5.0'}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>Admin</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
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
      
      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <CourseFormDialog mode="edit" />
      </Dialog>
    </div>
  )
}
