"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Star, Play, ArrowLeft, CheckCircle, 
  Video, FileText, Award, Target, Calendar, Download,
  MessageCircle, Trophy, TrendingUp, Globe
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

// Mock data - trong thực tế sẽ fetch từ API
const courseOverviewData = {
  "1": {
    syllabus: [
      {
        week: 1,
        title: "Foundation & Basic Skills",
        topics: [
          "TOEIC test structure overview",
          "Part 1: Photographs strategies", 
          "Basic workplace vocabulary",
          "Simple present & past tenses"
        ]
      },
      {
        week: 2,
        title: "Listening Development",
        topics: [
          "Part 2: Question-Response techniques",
          "Note-taking skills",
          "Common conversation topics",
          "Pronunciation practice"
        ]
      },
      {
        week: 3,
        title: "Reading Foundation", 
        topics: [
          "Part 5: Grammar essentials",
          "Vocabulary building strategies",
          "Time management tips",
          "Reading comprehension basics"
        ]
      },
      {
        week: 4,
        title: "Integrated Practice",
        topics: [
          "Full section practice tests",
          "Error analysis techniques", 
          "Performance tracking",
          "Final review & strategies"
        ]
      }
    ],
    features: [
      {
        icon: Video,
        title: "40+ Video Lessons",
        description: "Comprehensive video lectures covering all TOEIC sections"
      },
      {
        icon: FileText,
        title: "200+ Practice Questions", 
        description: "Extensive question bank with detailed explanations"
      },
      {
        icon: Trophy,
        title: "Weekly Mock Tests",
        description: "Real exam conditions with immediate feedback"
      },
      {
        icon: MessageCircle,
        title: "AI-Powered Support",
        description: "24/7 intelligent tutoring and doubt resolution"
      },
      {
        icon: TrendingUp,
        title: "Progress Tracking",
        description: "Detailed analytics and performance insights"
      },
      {
        icon: Globe,
        title: "Mobile Learning",
        description: "Study anywhere with our mobile-optimized platform"
      }
    ],
    requirements: [
      "Basic English communication skills",
      "Computer or mobile device with internet",
      "Dedication to practice 1-2 hours daily",
      "No prior TOEIC experience required"
    ],
    outcomes: [
      "Achieve target score of 300-450 points",
      "Master all 7 parts of TOEIC test",
      "Build strong foundation in English grammar",
      "Develop effective test-taking strategies",
      "Gain confidence for the actual exam"
    ],
    testimonials: [
      {
        name: "Nguyễn Minh Anh",
        score: "420 points", 
        review: "Course rất hay, giáo viên giảng dễ hiểu. Tôi đã đạt được điểm mục tiêu!",
        avatar: "/placeholder-user.jpg",
        rating: 5
      },
      {
        name: "Trần Văn Bình",
        score: "380 points",
        review: "Nội dung phong phú, bài tập đa dạng. Rất recommend cho người mới bắt đầu.",
        avatar: "/placeholder-user.jpg", 
        rating: 5
      },
      {
        name: "Lê Thị Cúc",
        score: "445 points",
        review: "AI support rất hữu ích, có thể hỏi bất cứ lúc nào. Platform dễ sử dụng.",
        avatar: "/placeholder-user.jpg",
        rating: 4
      }
    ]
  }
}

interface CourseOverviewProps {
  courseId?: string
}

export default function CourseOverview({ courseId }: CourseOverviewProps) {
  const params = useParams()
  const currentCourseId = courseId || (params.id as string)
  const overview = courseOverviewData[currentCourseId as keyof typeof courseOverviewData]

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course overview not found</h1>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Syllabus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Course Syllabus
          </CardTitle>
          <CardDescription>
            Detailed week-by-week breakdown of course content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {overview.syllabus.map((week) => (
              <div key={week.week} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Week {week.week}: {week.title}</h3>
                  <Badge variant="outline">4-5 lessons</Badge>
                </div>
                <ul className="space-y-2">
                  {week.topics.map((topic, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            What You'll Get
          </CardTitle>
          <CardDescription>
            Comprehensive learning experience with modern tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {overview.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {overview.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {overview.outcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <Star className="h-4 w-4 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Student Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            Student Success Stories
          </CardTitle>
          <CardDescription>
            Real feedback from students who achieved their TOEIC goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.testimonials.map((testimonial, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">Score: {testimonial.score}</p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${
                        i < testimonial.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 italic">"{testimonial.review}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your TOEIC Journey?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of successful students who have achieved their target scores with our proven methodology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/courses/${currentCourseId}/learn`}>
              <Button size="lg" className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Start Learning Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download Sample Content
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
