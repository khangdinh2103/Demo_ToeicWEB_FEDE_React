"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Star, Users, Play } from "lucide-react"
import { Link } from "react-router-dom"

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "TOEIC Cơ Bản",
      target: "300-450 điểm",
      price: "299,000đ",
      originalPrice: "399,000đ",
      lessons: 24,
      duration: "2 tháng",
      students: 1234,
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      description: "Khóa học dành cho người mới bắt đầu với TOEIC",
      features: ["Video bài giảng chi tiết", "Bài tập thực hành", "Test mini hàng tuần", "Hỗ trợ AI 24/7"]
    },
    {
      id: 2,
      title: "TOEIC Trung Cấp",
      target: "450-650 điểm",
      price: "499,000đ",
      originalPrice: "699,000đ",
      lessons: 36,
      duration: "3 tháng",
      students: 987,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      description: "Nâng cao kỹ năng và chiến lược làm bài",
      features: ["Chiến lược làm bài nâng cao", "Luyện từng phần chi tiết", "Mock test hàng tuần", "Chấm bài tự động"]
    },
    {
      id: 3,
      title: "TOEIC Nâng Cao",
      target: "650-850 điểm",
      price: "699,000đ",
      originalPrice: "999,000đ",
      lessons: 48,
      duration: "4 tháng",
      students: 756,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      description: "Đạt điểm cao với các kỹ thuật chuyên sâu",
      features: ["Techniques nâng cao", "Full test thường xuyên", "Phân tích chi tiết", "Mentor 1-1"]
    },
    {
      id: 4,
      title: "TOEIC 900+",
      target: "850+ điểm",
      price: "899,000đ",
      originalPrice: "1,299,000đ",
      lessons: 60,
      duration: "6 tháng",
      students: 432,
      rating: 5.0,
      image: "/placeholder.svg?height=200&width=300",
      description: "Khóa học elite cho điểm số tối đa",
      features: ["Chiến lược tối ưu", "Real test conditions", "Expert mentoring", "Đảm bảo kết quả"]
    }
  ]

  const [selectedCategory, setSelectedCategory] = useState("all")

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
              <Link to="/courses" className="text-blue-600 font-medium">
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
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Khóa học</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Khóa Học TOEIC Chuyên Nghiệp
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Lựa chọn khóa học phù hợp với trình độ hiện tại của bạn để đạt điểm số mục tiêu
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              Tất cả khóa học
            </Button>
            <Button
              variant={selectedCategory === "beginner" ? "default" : "outline"}
              onClick={() => setSelectedCategory("beginner")}
            >
              Cơ bản
            </Button>
            <Button
              variant={selectedCategory === "intermediate" ? "default" : "outline"}
              onClick={() => setSelectedCategory("intermediate")}
            >
              Trung cấp
            </Button>
            <Button
              variant={selectedCategory === "advanced" ? "default" : "outline"}
              onClick={() => setSelectedCategory("advanced")}
            >
              Nâng cao
            </Button>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    {course.target}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-sm text-gray-500">({course.students})</span>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {course.lessons} bài
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.students}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {course.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {course.originalPrice}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Link to={`/courses/${course.id}`}>
                          <Button variant="outline" className="w-full">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </Button>
                        </Link>
                        <Button className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          Đăng ký ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Chưa chắc chắn khóa học nào phù hợp?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Làm bài test đầu vào để nhận được gợi ý khóa học phù hợp nhất
          </p>
          <Link to="/placement-test">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Làm Test Đầu Vào Miễn Phí
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
