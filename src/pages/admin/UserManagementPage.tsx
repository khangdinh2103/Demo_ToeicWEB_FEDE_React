import { useState, useEffect } from 'react'
import AdminMenu from '../../components/AdminMenu'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Loader2
} from 'lucide-react'
import adminUserApi, { type User, type UserStats, type CreateUserData } from '../../api/adminUserApi'
import { useToast } from '../../hooks/use-toast'
import { Label } from '../../components/ui/label'
import { formatLastLogin } from '../../utils/dateUtils'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
  
  const [newUser, setNewUser] = useState<Partial<CreateUserData>>({
    name: '',
    phone: '',
    password: '',
    role: 'student',
    gender: 'male'
  })

  const [editUser, setEditUser] = useState<Partial<User>>({
    name: '',
    phone: '',
    address: '',
    country: ''
  })

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminUserApi.getUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
        page,
        limit: 20
      })
      
      setUsers(response.users)
      setTotalPages(response.pagination.totalPages)
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.response?.data?.message || 'Không thể tải danh sách người dùng',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await adminUserApi.getUserStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Load data on mount and when filters change
  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter, page])

  // Load stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.phone || !newUser.password || !newUser.gender) {
      toast({
        title: '⚠️ Cảnh báo',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      })
      return
    }

    try {
      await adminUserApi.createUser(newUser as CreateUserData)
      
      toast({
        title: '✅ Thành công',
        description: 'Tạo người dùng mới thành công'
      })
      
      setNewUser({ name: '', phone: '', password: '', role: 'student', gender: 'male' })
      setShowAddDialog(false)
      fetchUsers()
      fetchStats()
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.response?.data?.message || 'Không thể tạo người dùng',
        variant: 'destructive'
      })
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUser({
      name: user.name,
      phone: user.phone,
      address: user.address,
      country: user.country,
      isActive: user.isActive
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser || !editUser.name) return

    try {
      // If isActive changed, also update status separately to ensure it's saved
      const updateData: any = { ...editUser }
      
      await adminUserApi.updateUser(editingUser._id, updateData)
      
      // If status changed, also call updateUserStatus to be sure
      if (editUser.isActive !== undefined && editUser.isActive !== editingUser.isActive) {
        await adminUserApi.updateUserStatus(editingUser._id, editUser.isActive)
      }
      
      toast({
        title: '✅ Thành công',
        description: 'Cập nhật thông tin người dùng thành công'
      })
      
      setEditingUser(null)
      setEditUser({ name: '', phone: '', address: '', country: '' })
      setShowEditDialog(false)
      fetchUsers()
      fetchStats()
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật người dùng',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return

    try {
      await adminUserApi.deleteUser(userId)
      
      toast({
        title: '✅ Thành công',
        description: 'Xóa người dùng thành công'
      })
      
      fetchUsers()
      fetchStats()
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.response?.data?.message || 'Không thể xóa người dùng',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await adminUserApi.updateUserStatus(userId, isActive)
      
      toast({
        title: '✅ Thành công',
        description: 'Cập nhật trạng thái người dùng thành công'
      })
      
      fetchUsers()
      fetchStats()
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive'
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'teacher': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return <GraduationCap className="w-4 h-4" />
      case 'student': return <BookOpen className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý giảng viên và học viên trong hệ thống</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Học viên</p>
                <p className="text-2xl font-bold">{stats?.students || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Giảng viên</p>
                <p className="text-2xl font-bold">{stats?.teachers || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoạt động</p>
                <p className="text-2xl font-bold">{stats?.active || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="student">Học viên</SelectItem>
                  <SelectItem value="teacher">Giảng viên</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => setShowAddDialog(true)}>
              <Users className="w-4 h-4 mr-2" />
              Tạo tài khoản
            </Button>
          </div>
        </div>

        {/* Create User Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>
                Tạo tài khoản học viên hoặc giảng viên mới
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="create-name">Họ và tên *</Label>
                <Input
                  id="create-name"
                  value={newUser.name || ''}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div>
                <Label htmlFor="create-phone">Số điện thoại *</Label>
                <Input
                  id="create-phone"
                  value={newUser.phone || ''}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="0123456789"
                />
              </div>
              
              <div>
                <Label htmlFor="create-password">Mật khẩu *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={newUser.password || ''}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                />
              </div>
              
              <div>
                <Label htmlFor="create-gender">Giới tính *</Label>
                <Select value={newUser.gender} onValueChange={(value) => setNewUser({ ...newUser, gender: value as 'male' | 'female' | 'other' })}>
                  <SelectTrigger id="create-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="create-role">Vai trò *</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as 'student' | 'teacher' })}>
                  <SelectTrigger id="create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Học viên</SelectItem>
                    <SelectItem value="teacher">Giảng viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="create-dob">Ngày sinh</Label>
                <Input
                  id="create-dob"
                  type="date"
                  value={newUser.date_of_birth || ''}
                  onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="create-address">Địa chỉ</Label>
                <Input
                  id="create-address"
                  value={newUser.address || ''}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              
              <div>
                <Label htmlFor="create-country">Quốc gia</Label>
                <Input
                  id="create-country"
                  value={newUser.country || ''}
                  onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                  placeholder="Việt Nam"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddUser}>
                Tạo tài khoản
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin người dùng
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Họ và tên *</Label>
                <Input
                  id="edit-name"
                  value={editUser.name || ''}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input
                  id="edit-phone"
                  value={editUser.phone || ''}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  placeholder="0123456789"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-address">Địa chỉ</Label>
                <Input
                  id="edit-address"
                  value={editUser.address || ''}
                  onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-country">Quốc gia</Label>
                <Input
                  id="edit-country"
                  value={editUser.country || ''}
                  onChange={(e) => setEditUser({ ...editUser, country: e.target.value })}
                  placeholder="Việt Nam"
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Trạng thái tài khoản</Label>
                <Select 
                  value={editUser.isActive !== undefined ? (editUser.isActive ? 'active' : 'inactive') : 'active'} 
                  onValueChange={(value) => setEditUser({ ...editUser, isActive: value === 'active' })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Hoạt động
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        Vô hiệu hóa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Tài khoản bị vô hiệu hóa sẽ không thể đăng nhập
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveEdit}>
                Cập nhật
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Users Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Người dùng</th>
                  <th className="text-left p-4 font-medium text-gray-600">Vai trò</th>
                  <th className="text-left p-4 font-medium text-gray-600">Trạng thái</th>
                  <th className="text-left p-4 font-medium text-gray-600">Thống kê</th>
                  <th className="text-left p-4 font-medium text-gray-600">Ngày tham gia</th>
                  <th className="text-left p-4 font-medium text-gray-600">Đăng nhập cuối</th>
                  <th className="text-center p-4 font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                      <p className="text-gray-500 mt-2">Đang tải...</p>
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 w-fit`}>
                        {getRoleIcon(user.role)}
                        {user.role === 'teacher' ? 'Giảng viên' : user.role === 'student' ? 'Học viên' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleStatusChange(user._id, !user.isActive)}
                      >
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </Button>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {user.role === 'student' && (
                          <p className="text-gray-600">{user.coursesEnrolled || 0} khóa học</p>
                        )}
                        {user.role === 'teacher' && (
                          <p className="text-gray-600">{user.coursesTeaching || 0} khóa dạy</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {formatLastLogin(user.last_login)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!loading && users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy người dùng nào</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
