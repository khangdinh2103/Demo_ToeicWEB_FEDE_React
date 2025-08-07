import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Brain, Mic, PenTool, Target, Award, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const features = [
    {
      icon: Target,
      title: "Test Đầu Vào",
      description: "Đánh giá trình độ và nhận đề xuất khóa học phù hợp",
    },
    {
      icon: BookOpen,
      title: "Khóa Học Theo Trình Độ",
      description: "Các khóa học từ cơ bản đến nâng cao với video và bài tập",
    },
    {
      icon: Brain,
      title: "AI Chatbot",
      description: "Hỗ trợ từ vựng và ngữ pháp 24/7",
    },
    {
      icon: PenTool,
      title: "Luyện Writing AI",
      description: "AI sửa ngữ pháp và cải thiện kỹ năng viết",
    },
    {
      icon: Mic,
      title: "Luyện Speaking AI",
      description: "Thực hành nói với AI và nhận phản hồi",
    },
    {
      icon: Award,
      title: "Luyện Đề TOEIC",
      description: "Luyện theo part hoặc full test với chấm điểm tự động",
    },
  ]

  const courses = [
    {
      title: "TOEIC Cơ Bản",
      target: "300-450 điểm",
      price: "299,000đ",
      lessons: 24,
      duration: "2 tháng",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "TOEIC Trung Cấp",
      target: "450-650 điểm", 
      price: "499,000đ",
      lessons: 36,
      duration: "3 tháng",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "TOEIC Nâng Cao",
      target: "650-850 điểm",
      price: "699,000đ",
      lessons: 48,
      duration: "4 tháng",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">STAREDU</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link to="/courses" className="text-gray-700 hover:text-blue-600">
                Khóa học
              </Link>
              <Link to="/practice" className="text-gray-700 hover:text-blue-600">
                Luyện tập
              </Link>
              <Link to="/ai-tools" className="text-gray-700 hover:text-blue-600">
                AI Tools
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Đăng nhập</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Đăng ký</Button>
                  </Link>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                  Đăng xuất
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Học TOEIC Thông Minh Với
            <span className="text-blue-600"> AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Nền tảng học TOEIC hiện đại nhất với AI hỗ trợ cá nhân hóa, 
            giúp bạn đạt điểm mục tiêu nhanh chóng và hiệu quả.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/placement-test">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Target className="mr-2 h-5 w-5" />
                Bắt đầu test đầu vào
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-5 w-5" />
                Xem khóa học
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Courses Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Khóa Học Phổ Biến</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>Mục tiêu: {course.target}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="secondary">{course.lessons} bài học</Badge>
                    <Badge variant="outline">{course.duration}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                    <Button>
                      Đăng ký ngay
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Sẵn sàng chinh phục TOEIC?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên đã thành công với STAREDU. 
            Bắt đầu hành trình học tập của bạn ngay hôm nay!
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/learning-path">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Tìm lộ trình phù hợp
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/placement-test">
              <Button variant="outline" size="lg">
                Kiểm tra trình độ
              </Button>
            </Link>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">STAREDU</span>
              </div>
              <p className="text-gray-400">
                Nền tảng học TOEIC thông minh với công nghệ AI tiên tiến.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Khóa học</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-white">TOEIC Cơ bản</Link></li>
                <li><Link to="/courses" className="hover:text-white">TOEIC Trung cấp</Link></li>
                <li><Link to="/courses" className="hover:text-white">TOEIC Nâng cao</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Luyện tập</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/practice" className="hover:text-white">Luyện đề</Link></li>
                <li><Link to="/ai-tools" className="hover:text-white">AI Speaking</Link></li>
                <li><Link to="/ai-tools" className="hover:text-white">AI Writing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">Liên hệ</Link></li>
                <li><Link to="#" className="hover:text-white">FAQ</Link></li>
                <li><Link to="#" className="hover:text-white">Chính sách</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 STAREDU. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
