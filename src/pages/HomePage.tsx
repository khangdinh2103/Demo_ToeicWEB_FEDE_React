import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Brain, Mic, PenTool, Target, Award, ArrowRight, Users, Star } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { courseApi, type Course } from "@/api/courseApi"

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedCourses()
  }, [])

  const loadFeaturedCourses = async () => {
    try {
      setLoading(true)
      const response = await courseApi.getCourses({
        limit: 100,
        is_published: true
      })
      
      const allCourses = response.data.data
      
      // Lấy đại 3 khóa học đầu tiên
      const featured = allCourses.slice(0, 3)
      
      setFeaturedCourses(featured)
    } catch (error) {
      console.error("Error loading featured courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getLevelInfo = (course: Course) => {
    const title = course.title.toLowerCase()
    
    // Phân loại theo title
    if (title.includes('starter') || title.includes('0 đến 450') || title.includes('từ 0')) {
      return { level: 'Cơ bản', target: '0-450', color: 'bg-green-100 text-green-700 border-green-300' }
    } else if (title.includes('basics') || title.includes('căn bản') || title.includes('grammar basics')) {
      return { level: 'Cơ bản', target: '450+', color: 'bg-green-100 text-green-700 border-green-300' }
    } else if (title.includes('intermediate') || title.includes('550') || title.includes('650') || title.includes('trung cấp')) {
      return { level: 'Trung cấp', target: '550-650', color: 'bg-blue-100 text-blue-700 border-blue-300' }
    } else if (title.includes('master') || title.includes('mastery') || title.includes('cao cấp') || title.includes('chinh phục')) {
      return { level: 'Nâng cao', target: '800+', color: 'bg-purple-100 text-purple-700 border-purple-300' }
    }
    return { level: 'Tất cả', target: 'Linh hoạt', color: 'bg-gray-100 text-gray-700 border-gray-300' }
  }
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Khóa Học Tiêu Biểu</h2>
            <p className="text-gray-600 text-lg">
              Chọn khóa học phù hợp với trình độ của bạn
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => {
                const levelInfo = getLevelInfo(course)
                
                return (
                  <Card 
                    key={course._id} 
                    className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-2"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-blue-400" />
                        </div>
                      )}
                      
                      {/* Level Badge */}
                      <Badge className={`absolute top-3 left-3 ${levelInfo.color} border-2 font-semibold text-sm px-3 py-1`}>
                        {levelInfo.level}
                      </Badge>

                      {/* Target Badge */}
                      <Badge className="absolute top-3 right-3 bg-orange-500 text-white font-semibold">
                        Mục tiêu: {levelInfo.target}
                      </Badge>

                      {/* Free/Paid Badge */}
                      {course.is_free ? (
                        <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
                          Miễn phí
                        </Badge>
                      ) : (
                        <Badge className="absolute bottom-3 left-3 bg-blue-600 text-white">
                          Trả phí
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description?.replace(/\[LEVEL:.*?\]/g, '').replace(/\[TARGET:.*?\]/g, '').trim()}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                          <Users className="h-4 w-4 text-gray-600 mb-1" />
                          <span className="font-semibold text-gray-900">{course.total_enrollments || 0}</span>
                          <span className="text-xs text-gray-500">Học viên</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-500 mb-1" />
                          <span className="font-semibold text-gray-900">{course.average_rating?.toFixed(1) || "5.0"}</span>
                          <span className="text-xs text-gray-500">Đánh giá</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-600 mb-1" />
                          <span className="font-semibold text-gray-900">{course.total_reviews || 0}</span>
                          <span className="text-xs text-gray-500">Đánh giá</span>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        {course.is_free ? (
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-green-600">Miễn phí</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatPrice(course.price)}
                            </span>
                            {course.original_price > course.price && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(course.original_price)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Xem chi tiết
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có khóa học nào</p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/courses">
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                  Xem tất cả khóa học
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
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
