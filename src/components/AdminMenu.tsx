import { Link, useLocation } from 'react-router-dom'
import { BookOpen, FileText, Users, Settings, BarChart3, Database, GraduationCap } from 'lucide-react'

export default function AdminMenu() {
  const loc = useLocation()

  const isActive = (path: string) => {
    // Exact match for /admin (home page)
    if (path === '/admin') {
      return loc.pathname === '/admin'
    }
    // For other paths, check exact match or starts with path + '/'
    return loc.pathname === path || loc.pathname.startsWith(path + '/')
  }

  const menuItems = [
    {
      path: '/admin',
      label: 'Tổng quan',
      icon: BarChart3
    },
    {
      path: '/admin/courses',
      label: 'Quản lý Khóa học',
      icon: BookOpen
    },
    {
      path: '/admin/tests',
      label: 'Quản lý Đề',
      icon: FileText
    },
    {
      path: '/admin/question-bank',
      label: 'Ngân hàng Câu hỏi',
      icon: Database
    },
    {
      path: '/admin/practice',
      label: 'Quản lý Ôn luyện',
      icon: GraduationCap
    },
    {
      path: '/admin/users',
      label: 'Quản lý Người dùng',
      icon: Users
    },
    {
      path: '/admin/analytics',
      label: 'Thống kê',
      icon: BarChart3
    },
    {
      path: '/admin/settings',
      label: 'Cài đặt',
      icon: Settings
    }
  ]

  return (
    <nav className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">TOEIC Learning System</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path) 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2025 TOEIC Learning
        </div>
      </div>
    </nav>
  )
}
