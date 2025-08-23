import { Link, useLocation } from 'react-router-dom'

export default function AdminMenu() {
  const loc = useLocation()

  const isActive = (path: string) => loc.pathname === path || loc.pathname.startsWith(path + '/')

  return (
    <nav className="bg-white border-b border-gray-200 mb-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 py-3">
          <Link
            to="/admin"
            className={`px-3 py-1 rounded-md text-sm font-medium ${isActive('/admin') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            Quản lý Khóa học
          </Link>

          <Link
            to="/tests"
            className={`px-3 py-1 rounded-md text-sm font-medium ${isActive('/tests') ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
            Quản lý Đề
          </Link>

          {/* future menu items can be added here */}
        </div>
      </div>
    </nav>
  )
}
