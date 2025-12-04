import { useState, useEffect } from 'react'
import { Plus, Trash2, MapPin, ToggleLeft, ToggleRight, Calendar, CheckCircle, Clock, Search, Filter, User, Loader2, Edit, BookOpen } from 'lucide-react'
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
import { adminRoadmapApi, type RoadmapItem, type CreateRoadmapRequest, type UpdateRoadmapRequest } from '../../api/adminRoadmapApi'
import { useToast } from '../../hooks/use-toast'

export default function RoadmapManagementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState({
    targetScore: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  })
  
  // Dialog states
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingRoadmap, setEditingRoadmap] = useState<RoadmapItem | null>(null)
  
  // Form state
  const [form, setForm] = useState<CreateRoadmapRequest | UpdateRoadmapRequest>({
    title: '',
    description: '',
    skill_groups: [],
    target_score: 450,
    courses: [],
    price: 0,
    discount_percentage: 0,
    is_published: false
  })
  
  // Load roadmaps from API
  useEffect(() => {
    loadRoadmaps()
  }, [])
  
  const loadRoadmaps = async () => {
    try {
      setLoading(true)
      const response = await adminRoadmapApi.getAllRoadmaps({ limit: 100 })
      setRoadmaps(response.data?.data || [])
    } catch (error: any) {
      console.error('Failed to load roadmaps:', error)
      toast({
        title: 'Lỗi tải dữ liệu',
        description: error.response?.data?.message || 'Không thể tải danh sách lộ trình',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createRoadmap = async () => {
    try {
      await adminRoadmapApi.createRoadmap(form as CreateRoadmapRequest)
      
      toast({
        title: 'Tạo lộ trình thành công',
        description: `Lộ trình "${form.title}" đã được tạo.`,
      })
      
      setShowCreate(false)
      resetForm()
      await loadRoadmaps()
    } catch (error: any) {
      console.error('Failed to create roadmap:', error)
      toast({
        title: 'Lỗi tạo lộ trình',
        description: error.response?.data?.message || 'Không thể tạo lộ trình',
        variant: 'destructive',
      })
    }
  }

  const updateRoadmap = async () => {
    if (!editingRoadmap) return
    
    try {
      await adminRoadmapApi.updateRoadmap(editingRoadmap._id, form as UpdateRoadmapRequest)
      
      toast({
        title: 'Cập nhật lộ trình thành công',
        description: `Lộ trình "${form.title}" đã được cập nhật.`,
      })
      
      setShowEdit(false)
      setEditingRoadmap(null)
      resetForm()
      await loadRoadmaps()
    } catch (error: any) {
      console.error('Failed to update roadmap:', error)
      toast({
        title: 'Lỗi cập nhật lộ trình',
        description: error.response?.data?.message || 'Không thể cập nhật lộ trình',
        variant: 'destructive',
      })
    }
  }

  const deleteRoadmap = async (roadmapId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa lộ trình "${title}"?`)) return
    
    try {
      await adminRoadmapApi.deleteRoadmap(roadmapId)
      toast({
        title: 'Xóa lộ trình thành công',
        description: 'Lộ trình đã được xóa',
      })
      await loadRoadmaps()
    } catch (error: any) {
      console.error('Failed to delete roadmap:', error)
      toast({
        title: 'Lỗi xóa lộ trình',
        description: error.response?.data?.message || 'Không thể xóa lộ trình',
        variant: 'destructive',
      })
    }
  }

  const toggleRoadmapStatus = async (roadmapId: string, currentStatus: boolean) => {
    try {
      await adminRoadmapApi.publishRoadmap(roadmapId, !currentStatus)
      toast({
        title: 'Cập nhật trạng thái',
        description: `Lộ trình đã ${!currentStatus ? 'xuất bản' : 'ẩn'}`,
      })
      await loadRoadmaps()
    } catch (error: any) {
      console.error('Failed to toggle roadmap status:', error)
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
      skill_groups: [],
      target_score: 450,
      courses: [],
      price: 0,
      discount_percentage: 0,
      is_published: false
    })
  }

  const openEditDialog = (roadmap: RoadmapItem) => {
    setEditingRoadmap(roadmap)
    setForm({
      title: roadmap.title,
      description: roadmap.description || '',
      skill_groups: roadmap.skill_groups || [],
      target_score: roadmap.target_score,
      courses: roadmap.courses || [],
      price: roadmap.price,
      discount_percentage: roadmap.discount_percentage || 0,
      is_published: roadmap.is_published
    })
    setShowEdit(true)
  }

  // Filter roadmaps
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTargetScore = !filters.targetScore || roadmap.target_score.toString().includes(filters.targetScore)
    const matchesStatus = !filters.status || filters.status === 'all' || 
      (filters.status === 'published' && roadmap.is_published) ||
      (filters.status === 'unpublished' && !roadmap.is_published)
    
    let matchesDateRange = true
    if (filters.dateFrom || filters.dateTo) {
      const roadmapDate = new Date(roadmap.createdAt || '')
      if (filters.dateFrom) {
        matchesDateRange = matchesDateRange && roadmapDate >= new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        matchesDateRange = matchesDateRange && roadmapDate <= new Date(filters.dateTo)
      }
    }

    return matchesSearch && matchesTargetScore && matchesStatus && matchesDateRange
  })

  const clearFilters = () => {
    setFilters({
      targetScore: '',
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

  const calculateFinalPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quản lý Lộ trình Học</h1>
              <p className="text-gray-600">Tạo, sửa và quản lý lộ trình học cho hệ thống</p>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo lộ trình mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo lộ trình mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Tiêu đề lộ trình *</Label>
                    <Input 
                      id="title"
                      placeholder="Ví dụ: Lộ Trình Cơ Bản 2 Kỹ Năng - Listening & Reading 450+" 
                      value={form.title} 
                      onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả chi tiết</Label>
                    <Textarea 
                      id="description"
                      placeholder="Mô tả đầy đủ về lộ trình, nội dung, mục tiêu..." 
                      value={form.description || ''} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="target_score">Điểm mục tiêu *</Label>
                    <Input 
                      id="target_score"
                      type="number" 
                      placeholder="450" 
                      value={form.target_score || ''} 
                      onChange={(e) => setForm({ ...form, target_score: Number(e.target.value) || 0 })} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Giá bán (VNĐ)</Label>
                      <Input 
                        id="price"
                        type="number" 
                        placeholder="1290000" 
                        value={form.price || ''} 
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} 
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discount_percentage">Giảm giá (%)</Label>
                      <Input 
                        id="discount_percentage"
                        type="number" 
                        placeholder="20" 
                        min="0"
                        max="100"
                        value={form.discount_percentage || ''} 
                        onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) || 0 })} 
                      />
                    </div>
                  </div>
                  
                  {form.price && form.price > 0 && form.discount_percentage && form.discount_percentage > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Giá sau giảm:</strong> {formatPrice(calculateFinalPrice(form.price, form.discount_percentage))}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id="is_published"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_published">Xuất bản lộ trình</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    Hủy
                  </Button>
                  <Button onClick={createRoadmap} disabled={!form.title}>
                    Tạo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm lộ trình theo tên hoặc mô tả..."
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
                {(filters.targetScore || filters.dateFrom || filters.dateTo || filters.status) && (
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
                    <Label htmlFor="filter-target-score">Điểm mục tiêu</Label>
                    <Input
                      id="filter-target-score"
                      type="number"
                      placeholder="VD: 450, 650..."
                      value={filters.targetScore}
                      onChange={(e) => setFilters({...filters, targetScore: e.target.value})}
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
                    {filteredRoadmaps.filter(r => r.is_published).map(roadmap => (
                      <Card key={roadmap._id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader onClick={() => navigate(`/admin/roadmaps/${roadmap._id}`)}>
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
                                  openEditDialog(roadmap);
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
                                  toggleRoadmapStatus(roadmap._id, roadmap.is_published);
                                }}
                                title="Ẩn lộ trình"
                              >
                                <ToggleLeft className="w-4 h-4 text-yellow-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteRoadmap(roadmap._id, roadmap.title);
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            {roadmap.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{roadmap.description}</CardDescription>
                        </CardHeader>
                        <CardContent onClick={() => navigate(`/admin/roadmaps/${roadmap._id}`)}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                🎯 Target: {roadmap.target_score}+
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {roadmap.courses?.length || 0} khóa học
                              </Badge>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Giá:</span>
                                <div className="flex flex-col items-end">
                                  {roadmap.discount_percentage > 0 ? (
                                    <>
                                      <span className="text-xs text-gray-400 line-through">{formatPrice(roadmap.price)}</span>
                                      <span className="font-bold text-blue-600">
                                        {formatPrice(calculateFinalPrice(roadmap.price, roadmap.discount_percentage))}
                                      </span>
                                      <Badge className="bg-red-500 text-xs mt-1">-{roadmap.discount_percentage}%</Badge>
                                    </>
                                  ) : (
                                    <span className="font-bold text-blue-600">{formatPrice(roadmap.price)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{roadmap.total_enrollments || 0} học viên</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>Admin</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{roadmap.createdAt ? new Date(roadmap.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredRoadmaps.filter(r => r.is_published).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Chưa có lộ trình nào được xuất bản
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="unpublished">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRoadmaps.filter(r => !r.is_published).map(roadmap => (
                      <Card key={roadmap._id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader onClick={() => navigate(`/admin/roadmaps/${roadmap._id}`)}>
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
                                  openEditDialog(roadmap);
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
                                  toggleRoadmapStatus(roadmap._id, roadmap.is_published);
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
                                  deleteRoadmap(roadmap._id, roadmap.title);
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            {roadmap.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">{roadmap.description}</CardDescription>
                        </CardHeader>
                        <CardContent onClick={() => navigate(`/admin/roadmaps/${roadmap._id}`)}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                🎯 Target: {roadmap.target_score}+
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {roadmap.courses?.length || 0} khóa học
                              </Badge>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Giá:</span>
                                <div className="flex flex-col items-end">
                                  {roadmap.discount_percentage > 0 ? (
                                    <>
                                      <span className="text-xs text-gray-400 line-through">{formatPrice(roadmap.price)}</span>
                                      <span className="font-bold text-blue-600">
                                        {formatPrice(calculateFinalPrice(roadmap.price, roadmap.discount_percentage))}
                                      </span>
                                      <Badge className="bg-red-500 text-xs mt-1">-{roadmap.discount_percentage}%</Badge>
                                    </>
                                  ) : (
                                    <span className="font-bold text-blue-600">{formatPrice(roadmap.price)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{roadmap.total_enrollments || 0} học viên</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>Admin</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{roadmap.createdAt ? new Date(roadmap.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredRoadmaps.filter(r => !r.is_published).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      Chưa có lộ trình nào chưa xuất bản
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lộ trình</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Tiêu đề lộ trình *</Label>
              <Input 
                id="edit-title"
                placeholder="Ví dụ: Lộ Trình Cơ Bản 2 Kỹ Năng - Listening & Reading 450+" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Mô tả chi tiết</Label>
              <Textarea 
                id="edit-description"
                placeholder="Mô tả đầy đủ về lộ trình, nội dung, mục tiêu..." 
                value={form.description || ''} 
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-target_score">Điểm mục tiêu *</Label>
              <Input 
                id="edit-target_score"
                type="number" 
                placeholder="450" 
                value={form.target_score || ''} 
                onChange={(e) => setForm({ ...form, target_score: Number(e.target.value) || 0 })} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Giá bán (VNĐ)</Label>
                <Input 
                  id="edit-price"
                  type="number" 
                  placeholder="1290000" 
                  value={form.price || ''} 
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-discount_percentage">Giảm giá (%)</Label>
                <Input 
                  id="edit-discount_percentage"
                  type="number" 
                  placeholder="20" 
                  min="0"
                  max="100"
                  value={form.discount_percentage || ''} 
                  onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) || 0 })} 
                />
              </div>
            </div>
            
            {form.price && form.price > 0 && form.discount_percentage && form.discount_percentage > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Giá sau giảm:</strong> {formatPrice(calculateFinalPrice(form.price, form.discount_percentage))}
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id="edit-is_published"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-is_published">Xuất bản lộ trình</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Hủy
            </Button>
            <Button onClick={updateRoadmap} disabled={!form.title}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
