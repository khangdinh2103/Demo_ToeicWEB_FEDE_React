"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Star, Users, Play, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { courseApi, type Course } from "@/api/courseApi"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await courseApi.getCourses({
        page: 1,
        limit: 20,
        is_published: true
      })
      setCourses(response.data.data)
    } catch (err: any) {
      console.error("Error fetching courses:", err)
      setError(err.response?.data?.message || "Không thể tải danh sách khóa học")
    } finally {
      setLoading(false)
    }
  }

  const getSkillLabel = (skills: string[]) => {
    const labels: { [key: string]: string } = {
      listening: "Nghe",
      reading: "Đọc",
      speaking: "Nói",
      writing: "Viết",
      vocabulary: "Từ vựng",
      grammar: "Ngữ pháp"
    }
    return skills.map(s => labels[s] || s).join(" + ")
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b -mx-4 sm:-mx-6 lg:-mx-8">
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
      <section className="py-12">
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
      <section className="mb-8">
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
      <section className="pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchCourses}>Thử lại</Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 mb-4">Chưa có khóa học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Card key={course._id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={course.thumbnail || "/placeholder.svg?height=200&width=300"}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      {getSkillLabel(course.skill_groups)}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({course.total_reviews})</span>
                        </div>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {course.total_enrollments.toLocaleString()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Nhiều bài học
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Online
                        </div>
                      </div>

                      <div className="space-y-2">
                        {course.skill_groups.slice(0, 2).map((skill, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                            Luyện {skill === "listening" ? "Nghe" : skill === "writing" ? "Viết" : skill}
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                              {course.is_free ? (
                                <span className="text-2xl font-bold text-green-600">
                                  Miễn phí
                                </span>
                              ) : (
                                <div>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {(course.price || 0).toLocaleString('vi-VN')}đ
                                  </span>
                                  {course.original_price && course.original_price > (course.price || 0) && (
                                    <span className="text-sm text-gray-400 line-through ml-2">
                                      {course.original_price.toLocaleString('vi-VN')}đ
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Link to={`/courses/${course._id}`}>
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 -mx-4 sm:-mx-6 lg:-mx-8">
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
