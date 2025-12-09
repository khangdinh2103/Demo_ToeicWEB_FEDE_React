import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Edit, Trash2, FileText, Video, Brain, ArrowLeft, Upload, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useToast } from '../../hooks/use-toast'
import AdminMenu from '../../components/AdminMenu'
import { adminRoadmapApi } from '../../api/adminRoadmapApi'
import { adminCourseApi } from '../../api/adminCourseApi'
import { adminTeacherApi } from '../../api/adminTeacherApi'

interface Section {
  _id: string
  title: string
  name?: string
  type: 'video' | 'document' | 'mindmap' | 'exercise'
  duration?: string
  duration_minutes?: number
  order: number
}

interface Lesson {
  _id: string
  title: string
  name?: string
  description?: string
  duration?: string
  duration_minutes?: number
  sections?: Section[]
  order: number
}

interface Course {
  _id: string
  title: string
  thumbnail?: string
  skill_groups: string[]
  lessons?: Lesson[]
}

interface Roadmap {
  _id: string
  title: string
  description?: string
  skill_groups: string[]
  target_score: number
  courses: Course[]
  price: number
  discount_percentage: number
  is_published: boolean
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*$/
  const match = url.match(regExp)
  return (match && match[7].length === 11) ? match[7] : null
}

export default function RoadmapBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  
  // Form states
  const [courseForm, setCourseForm] = useState({ 
    title: '', 
    description: '',
    thumbnail: '', 
    skill_groups: [] as string[],
    price: 0,
    original_price: 0,
    is_free: true,
    assigned_teachers: [] as string[]
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [lessonForm, setLessonForm] = useState({ name: '', description: '', duration: '' })
  const [sectionForm, setSectionForm] = useState<{ name: string; type: 'video' | 'document' | 'mindmap' | 'exercise'; duration: string }>({ name: '', type: 'video', duration: '' })
  
  // Existing courses state
  const [allCourses, setAllCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [courseSearchTerm, setCourseSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('')
  const [selectedExistingCourses, setSelectedExistingCourses] = useState<string[]>([])
  
  // Section detail state
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)
  const [sectionDetails, setSectionDetails] = useState<Record<string, {
    video_url?: string;
    article_content?: string;
    mindmap_url?: string;
    test_id?: string;
    duration_minutes?: number;
  }>>({})
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, any>>({})
  const [loadingExercise, setLoadingExercise] = useState<Record<string, boolean>>({})
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editingQuestionData, setEditingQuestionData] = useState<any>(null)
  const [uploadingFile, setUploadingFile] = useState<Record<string, boolean>>({})
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ kind: 'course' | 'lesson' | 'section', id: string, courseId?: string, lessonId?: string } | null>(null)
  
  // Column resize state
  const [columnWidths, setColumnWidths] = useState({ col1: 320, col2: 320 })
  const [isResizing, setIsResizing] = useState<'col1' | 'col2' | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)

  // Load roadmap data
  useEffect(() => {
    if (id) {
      loadRoadmap()
    }
    loadTeachers()
  }, [id])

  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true)
      const response = await adminTeacherApi.getTeacherList({ limit: 100 })
      setTeachers(response.data?.data || [])
    } catch (error) {
      console.error('Error loading teachers:', error)
    } finally {
      setLoadingTeachers(false)
    }
  }

  const loadAllCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await adminCourseApi.getAllCourses({ limit: 1000 })
      setAllCourses(response.data?.data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khóa học',
        variant: 'destructive'
      })
    } finally {
      setLoadingCourses(false)
    }
  }

  const loadRoadmap = async () => {
    try {
      setLoading(true)
      const response = await adminRoadmapApi.getRoadmapById(id!)
      const roadmapData = response.data
      
      // Load full course details with lessons
      if (roadmapData.courses && roadmapData.courses.length > 0) {
        const coursesWithLessons = await Promise.all(
          roadmapData.courses.map(async (course: any) => {
            try {
              const courseDetail = await adminCourseApi.getCourseById(course._id)
              
              // Load lessons for each course
              let lessons: Lesson[] = []
              if (!courseDetail.lessons || courseDetail.lessons.length === 0) {
                try {
                  lessons = await adminCourseApi.getLessonsByCourseId(course._id)
                  
                  // Load sections for each lesson
                  lessons = await Promise.all(
                    lessons.map(async (lesson: any) => {
                      try {
                        const sections = await adminCourseApi.getSectionsByLessonId(lesson._id)
                        return { ...lesson, sections }
                      } catch {
                        return { ...lesson, sections: [] }
                      }
                    })
                  )
                } catch (error) {
                  console.error('Error loading lessons:', error)
                }
              } else {
                lessons = courseDetail.lessons
              }
              
              return {
                _id: course._id,
                title: course.title || courseDetail.title || courseDetail.name,
                thumbnail: course.thumbnail || courseDetail.thumbnail,
                skill_groups: course.skill_groups || courseDetail.skill_groups || [],
                lessons
              }
            } catch (error) {
              console.error(`Error loading course ${course._id}:`, error)
              return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                skill_groups: course.skill_groups || [],
                lessons: []
              }
            }
          })
        )
        
        roadmapData.courses = coursesWithLessons
      }
      
      setRoadmap(roadmapData)
    } catch (error: any) {
      console.error('Error loading roadmap:', error)
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải lộ trình',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setSelectedLesson(null)
  }

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  // Course CRUD operations
  const openEditCourseDialog = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCourse(course)
    setCourseForm({
      title: course.title,
      description: (course as any).description || '',
      thumbnail: course.thumbnail || '',
      skill_groups: course.skill_groups || [],
      price: (course as any).price || 0,
      original_price: (course as any).original_price || 0,
      is_free: (course as any).is_free !== undefined ? (course as any).is_free : true,
      assigned_teachers: (course as any).assigned_teachers || []
    })
    setShowCourseDialog(true)
  }

  const openCreateCourseDialog = () => {
    setEditingCourse(null)
    setCourseForm({ 
      title: '', 
      description: '',
      thumbnail: '', 
      skill_groups: [],
      price: 0,
      original_price: 0,
      is_free: true,
      assigned_teachers: []
    })
    setSelectedExistingCourses([])
    loadAllCourses()
    setShowCourseDialog(true)
  }

  const handleAddExistingCourses = async () => {
    if (!roadmap || selectedExistingCourses.length === 0) return
    
    try {
      // Get current course IDs in roadmap
      const currentCourseIds = roadmap.courses.map(c => c._id)
      
      // Filter out courses already in roadmap
      const newCourseIds = selectedExistingCourses.filter(id => !currentCourseIds.includes(id))
      
      if (newCourseIds.length === 0) {
        toast({
          title: 'Thông báo',
          description: 'Các khóa học đã được thêm vào lộ trình',
          variant: 'default'
        })
        return
      }
      
      // Add courses to roadmap
      const updatedCourseIds = [...currentCourseIds, ...newCourseIds]
      await adminRoadmapApi.updateRoadmap(roadmap._id, {
        courses: updatedCourseIds
      })

      // Reload roadmap to get updated data
      await loadRoadmap()

      toast({
        title: 'Thành công',
        description: `Đã thêm ${newCourseIds.length} khóa học vào lộ trình`
      })

      setSelectedExistingCourses([])
      setShowCourseDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể thêm khóa học',
        variant: 'destructive'
      })
    }
  }

  const handleCreateCourse = async () => {
    if (!roadmap) return
    
    try {
      // Create new course
      const newCourse = await adminCourseApi.createCourse({
        title: courseForm.title,
        description: courseForm.description,
        thumbnail: courseForm.thumbnail,
        skill_groups: courseForm.skill_groups,
        price: courseForm.price,
        original_price: courseForm.original_price,
        is_free: courseForm.is_free,
        assigned_teachers: courseForm.assigned_teachers
      } as any)

      // Add course to roadmap
      const updatedCourseIds = [...roadmap.courses.map(c => c._id), newCourse._id]
      await adminRoadmapApi.updateRoadmap(roadmap._id, {
        courses: updatedCourseIds
      })

      // Reload roadmap to get updated data
      await loadRoadmap()

      toast({
        title: 'Thành công',
        description: 'Đã tạo và thêm khóa học vào lộ trình'
      })

      setCourseForm({ title: '', description: '', thumbnail: '', skill_groups: [], price: 0, original_price: 0, is_free: true, assigned_teachers: [] })
      setShowCourseDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo khóa học',
        variant: 'destructive'
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file ảnh',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      setCourseForm(prev => ({ ...prev, thumbnail: data.url }))
      
      toast({
        title: 'Thành công',
        description: 'Đã tải ảnh lên'
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải ảnh lên. Bạn có thể nhập URL trực tiếp.',
        variant: 'destructive'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse || !roadmap) return
    try {
      const updated = await adminCourseApi.updateCourse(editingCourse._id, {
        title: courseForm.title,
        description: courseForm.description,
        thumbnail: courseForm.thumbnail,
        skill_groups: courseForm.skill_groups,
        price: courseForm.price,
        original_price: courseForm.original_price,
        is_free: courseForm.is_free,
        assigned_teachers: courseForm.assigned_teachers
      } as any)
      
      const updatedRoadmap = {
        ...roadmap,
        courses: roadmap.courses.map(c => 
          c._id === editingCourse._id 
            ? { ...c, ...updated }
            : c
        )
      }
      
      setRoadmap(updatedRoadmap)
      
      if (selectedCourse?._id === editingCourse._id) {
        setSelectedCourse({ ...selectedCourse, ...updated })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật khóa học'
      })
      
      setEditingCourse(null)
      setCourseForm({ title: '', description: '', thumbnail: '', skill_groups: [], price: 0, original_price: 0, is_free: true, assigned_teachers: [] })
      setShowCourseDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật khóa học',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCourse = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!roadmap) return
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này khỏi lộ trình?')) return
    
    try {
      const updatedCourseIds = roadmap.courses.filter(c => c._id !== courseId).map(c => c._id)
      await adminRoadmapApi.updateRoadmap(roadmap._id, {
        courses: updatedCourseIds
      })

      const updatedRoadmap = {
        ...roadmap,
        courses: roadmap.courses.filter(c => c._id !== courseId)
      }
      
      setRoadmap(updatedRoadmap)
      
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(null)
        setSelectedLesson(null)
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa khóa học khỏi lộ trình'
      })
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa khóa học',
        variant: 'destructive'
      })
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, kind: 'course' | 'lesson' | 'section', id: string, courseId?: string, lessonId?: string) => {
    setDraggedItem({ kind, id, courseId, lessonId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetKind: 'course' | 'lesson' | 'section', targetId: string, _targetCourseId?: string, _targetLessonId?: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedItem || !roadmap) return
    if (draggedItem.kind !== targetKind) return
    if (draggedItem.id === targetId) return

    try {
      if (draggedItem.kind === 'course') {
        // Reorder courses
        const currentCourses = roadmap.courses
        const draggedIndex = currentCourses.findIndex(c => c._id === draggedItem.id)
        const targetIndex = currentCourses.findIndex(c => c._id === targetId)
        
        if (draggedIndex === -1 || targetIndex === -1) return

        const reorderedCourses = [...currentCourses]
        const [draggedCourse] = reorderedCourses.splice(draggedIndex, 1)
        reorderedCourses.splice(targetIndex, 0, draggedCourse)

        // Update order in backend
        const courseOrders = reorderedCourses.map((c, idx) => ({
          course_id: c._id,
          order: idx
        }))

        await adminRoadmapApi.reorderCourses(roadmap._id, courseOrders)

        setRoadmap({ ...roadmap, courses: reorderedCourses })
        
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thứ tự khóa học'
        })
      } else if (draggedItem.kind === 'lesson' && selectedCourse) {
        // Reorder lessons
        const currentLessons = selectedCourse.lessons || []
        const draggedIndex = currentLessons.findIndex(l => l._id === draggedItem.id)
        const targetIndex = currentLessons.findIndex(l => l._id === targetId)
        
        if (draggedIndex === -1 || targetIndex === -1) return

        const reorderedLessons = [...currentLessons]
        const [draggedLesson] = reorderedLessons.splice(draggedIndex, 1)
        reorderedLessons.splice(targetIndex, 0, draggedLesson)

        // Update order in backend
        const lessonOrders = reorderedLessons.map((l, idx) => ({
          lesson_id: l._id,
          order: idx + 1
        }))

        await adminCourseApi.reorderLessons(selectedCourse._id, lessonOrders)

        const updatedCourse = { ...selectedCourse, lessons: reorderedLessons }
        setSelectedCourse(updatedCourse)
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
        
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thứ tự bài học'
        })
      } else if (draggedItem.kind === 'section' && selectedLesson) {
        // Reorder sections
        const currentSections = selectedLesson.sections || []
        const draggedIndex = currentSections.findIndex(s => s._id === draggedItem.id)
        const targetIndex = currentSections.findIndex(s => s._id === targetId)
        
        if (draggedIndex === -1 || targetIndex === -1) return

        const reorderedSections = [...currentSections]
        const [draggedSection] = reorderedSections.splice(draggedIndex, 1)
        reorderedSections.splice(targetIndex, 0, draggedSection)

        // Update order in backend
        const sectionOrders = reorderedSections.map((s, idx) => ({
          section_id: s._id,
          order: idx + 1
        }))

        await adminCourseApi.reorderSections(selectedLesson._id, sectionOrders)

        const updatedLesson = { ...selectedLesson, sections: reorderedSections }
        setSelectedLesson(updatedLesson)
        
        if (selectedCourse) {
          const updatedCourse = {
            ...selectedCourse,
            lessons: selectedCourse.lessons?.map(l => l._id === selectedLesson._id ? updatedLesson : l)
          }
          setSelectedCourse(updatedCourse)
          setRoadmap({
            ...roadmap,
            courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
          })
        }
        
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thứ tự section'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật thứ tự',
        variant: 'destructive'
      })
    } finally {
      setDraggedItem(null)
    }
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'article': return <FileText className="w-4 h-4" />
      case 'mindmap': return <Brain className="w-4 h-4" />
      case 'exercise': return <Edit className="w-4 h-4" />
      case 'quiz': return <Edit className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video'
      case 'document': return 'Tài liệu'
      case 'article': return 'Bài viết'
      case 'mindmap': return 'Sơ đồ tư duy'
      case 'exercise': return 'Bài tập'
      case 'quiz': return 'Trắc nghiệm'
      default: return type
    }
  }

  // Lesson CRUD operations
  const openEditLessonDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      name: lesson.title || lesson.name || '',
      description: lesson.description || '',
      duration: lesson.duration || ''
    })
    setShowLessonDialog(true)
  }

  const handleCreateLesson = async () => {
    if (!selectedCourse) return
    try {
      // Get teacher ID from course's assigned_teachers
      const assignedTeachers = (selectedCourse as any).assigned_teachers
      console.log('📋 Course assigned_teachers:', assignedTeachers)
      
      let teacherId = ''
      
      if (Array.isArray(assignedTeachers) && assignedTeachers.length > 0) {
        const firstTeacher = assignedTeachers[0]
        // If it's a string, use directly
        if (typeof firstTeacher === 'string') {
          teacherId = firstTeacher
        } 
        // If it's an object, try to get _id
        else if (typeof firstTeacher === 'object' && firstTeacher) {
          teacherId = firstTeacher._id || firstTeacher.id || ''
        }
      }
      
      console.log('🔑 Extracted teacherId:', teacherId)
      
      if (!teacherId) {
        toast({
          title: 'Lỗi',
          description: 'Khóa học chưa có giảng viên. Vui lòng thêm giảng viên cho khóa học trước.',
          variant: 'destructive'
        })
        return
      }

      // Find next available order number
      const maxOrder = selectedCourse.lessons && selectedCourse.lessons.length > 0
        ? Math.max(...selectedCourse.lessons.map(l => l.order || 0))
        : 0
      const nextOrder = maxOrder + 1

      const requestData = {
        course_id: selectedCourse._id,
        title: lessonForm.name,
        description: lessonForm.description,
        order: nextOrder,
        created_by: teacherId
      }
      
      console.log('📤 Sending lesson creation request:', requestData)

      const newLesson = await adminCourseApi.createLesson(requestData)
      
      const updatedCourse = {
        ...selectedCourse,
        lessons: [...(selectedCourse.lessons || []), newLesson]
      }
      
      setSelectedCourse(updatedCourse)
      
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo bài học mới'
      })
      
      setLessonForm({ name: '', description: '', duration: '' })
      setShowLessonDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo bài học',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateLesson = async () => {
    if (!selectedCourse || !editingLesson) return
    try {
      const updated = await adminCourseApi.updateLesson(editingLesson._id, {
        title: lessonForm.name,
        description: lessonForm.description
      })
      
      const updatedCourse = {
        ...selectedCourse,
        lessons: (selectedCourse.lessons || []).map(l => l._id === editingLesson._id ? updated : l)
      }
      
      setSelectedCourse(updatedCourse)
      
      if (selectedLesson?._id === editingLesson._id) {
        setSelectedLesson(updated)
      }
      
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật bài học'
      })
      
      setEditingLesson(null)
      setLessonForm({ name: '', description: '', duration: '' })
      setShowLessonDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật bài học',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourse) return
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return
    
    try {
      await adminCourseApi.deleteLesson(lessonId)
      
      const updatedCourse = {
        ...selectedCourse,
        lessons: (selectedCourse.lessons || []).filter(l => l._id !== lessonId)
      }
      
      setSelectedCourse(updatedCourse)
      
      if (selectedLesson?._id === lessonId) {
        setSelectedLesson(null)
      }
      
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa bài học'
      })
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa bài học',
        variant: 'destructive'
      })
    }
  }

  // Section CRUD operations
  const openEditSectionDialog = (section: Section) => {
    setEditingSection(section)
    setSectionForm({
      name: section.title || section.name || '',
      type: section.type,
      duration: section.duration || ''
    })
    setShowSectionDialog(true)
  }

  const handleCreateSection = async () => {
    if (!selectedLesson) return
    try {
      const newSection = await adminCourseApi.createSection({
        lesson_id: selectedLesson._id,
        title: sectionForm.name,
        type: sectionForm.type as any,
        order: selectedLesson.sections?.length || 0
      })
      
      const updatedLesson = {
        ...selectedLesson,
        sections: [...(selectedLesson.sections || []), newSection]
      }
      
      setSelectedLesson(updatedLesson)
      
      if (selectedCourse && roadmap) {
        const updatedCourse = {
          ...selectedCourse,
          lessons: (selectedCourse.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
        }
        
        setSelectedCourse(updatedCourse)
        
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã tạo section mới'
      })
      
      setSectionForm({ name: '', type: 'video', duration: '' })
      setShowSectionDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo section',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateSection = async () => {
    if (!selectedLesson || !editingSection) return
    try {
      const updated = await adminCourseApi.updateSection(editingSection._id, {
        title: sectionForm.name,
        type: sectionForm.type as any
      })
      
      const updatedLesson = {
        ...selectedLesson,
        sections: (selectedLesson.sections || []).map(s => s._id === editingSection._id ? updated : s)
      }
      
      setSelectedLesson(updatedLesson)
      
      if (selectedCourse && roadmap) {
        const updatedCourse = {
          ...selectedCourse,
          lessons: (selectedCourse.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
        }
        
        setSelectedCourse(updatedCourse)
        
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật section'
      })
      
      setEditingSection(null)
      setSectionForm({ name: '', type: 'video', duration: '' })
      setShowSectionDialog(false)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật section',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!selectedLesson) return
    if (!confirm('Bạn có chắc chắn muốn xóa section này?')) return
    
    try {
      await adminCourseApi.deleteSection(sectionId)
      
      const updatedLesson = {
        ...selectedLesson,
        sections: (selectedLesson.sections || []).filter(s => s._id !== sectionId)
      }
      
      setSelectedLesson(updatedLesson)
      
      if (selectedCourse && roadmap) {
        const updatedCourse = {
          ...selectedCourse,
          lessons: (selectedCourse.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
        }
        
        setSelectedCourse(updatedCourse)
        
        setRoadmap({
          ...roadmap,
          courses: roadmap.courses.map(c => c._id === selectedCourse._id ? updatedCourse : c)
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa section'
      })
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa section',
        variant: 'destructive'
      })
    }
  }

  const loadExerciseDetails = async (sectionId: string, testId: string) => {
    if (!testId || exerciseDetails[sectionId]) return
    
    setLoadingExercise(prev => ({ ...prev, [sectionId]: true }))
    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setExerciseDetails(prev => ({
        ...prev,
        [sectionId]: data.data || data
      }))
    } catch (error) {
      console.error('Error loading exercise:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải chi tiết bài tập',
        variant: 'destructive'
      })
    } finally {
      setLoadingExercise(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  const toggleSectionDetails = (sectionId: string) => {
    if (expandedSectionId === sectionId) {
      setExpandedSectionId(null)
    } else {
      setExpandedSectionId(sectionId)
      // Initialize section details if not exists
      if (!sectionDetails[sectionId]) {
        const section = selectedLesson?.sections?.find(s => s._id === sectionId)
        if (section) {
          setSectionDetails(prev => ({
            ...prev,
            [sectionId]: {
              video_url: (section as any).video_url || '',
              article_content: (section as any).article_content || (section as any).articleContent || '',
              mindmap_url: (section as any).mindmap_url || '',
              test_id: (section as any).test_id || '',
              duration_minutes: section.duration_minutes || 0
            }
          }))
          
          // For exercise type, check if section has questions directly
          if (section.type === 'exercise') {
            if ((section as any).questions && (section as any).questions.length > 0) {
              // Use questions from section directly
              setExerciseDetails(prev => ({
                ...prev,
                [sectionId]: {
                  title: section.title,
                  description: (section as any).description || '',
                  questions: (section as any).questions,
                  duration_minutes: section.duration_minutes
                }
              }))
            } else if ((section as any).test_id) {
              // Load from test API if has test_id
              loadExerciseDetails(sectionId, (section as any).test_id)
            }
          }
        }
      }
    }
  }

  const updateSectionDetail = (sectionId: string, field: string, value: any) => {
    setSectionDetails(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value
      }
    }))
  }

  const handleUploadVideoFile = async (sectionId: string, file: File) => {
    if (!file) return
    
    setUploadingFile(prev => ({ ...prev, [sectionId]: true }))
    
    try {
      const result = await adminCourseApi.uploadMedia(file, 'audio')
      
      if (result.data?.url) {
        updateSectionDetail(sectionId, 'video_url', result.data.url)
        toast({
          title: 'Thành công',
          description: 'Đã upload video'
        })
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || error.message || 'Không thể upload video',
        variant: 'destructive'
      })
    } finally {
      setUploadingFile(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  const handleUploadMindmapFile = async (sectionId: string, file: File) => {
    if (!file) return
    
    setUploadingFile(prev => ({ ...prev, [sectionId]: true }))
    
    try {
      const result = await adminCourseApi.uploadMedia(file, 'image')
      
      if (result.data?.url) {
        updateSectionDetail(sectionId, 'mindmap_url', result.data.url)
        toast({
          title: 'Thành công',
          description: 'Đã upload hình ảnh mindmap'
        })
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || error.message || 'Không thể upload hình ảnh',
        variant: 'destructive'
      })
    } finally {
      setUploadingFile(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  const handleImportQuestionsJSON = (sectionId: string, file: File) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        
        // Validate JSON structure
        if (!Array.isArray(json) && !json.questions) {
          throw new Error('File JSON phải chứa mảng câu hỏi hoặc object có field questions')
        }
        
        const questions = Array.isArray(json) ? json : json.questions
        
        setExerciseDetails(prev => ({
          ...prev,
          [sectionId]: {
            ...prev[sectionId],
            title: json.title || prev[sectionId]?.title || '',
            description: json.description || prev[sectionId]?.description || '',
            questions: questions
          }
        }))
        
        toast({
          title: 'Thành công',
          description: `Đã import ${questions.length} câu hỏi`
        })
      } catch (error: any) {
        toast({
          title: 'Lỗi',
          description: error.message || 'File JSON không hợp lệ',
          variant: 'destructive'
        })
      }
    }
    reader.readAsText(file)
  }

  const saveSectionDetails = async (sectionId: string) => {
    try {
      const details = sectionDetails[sectionId]
      const section = selectedLesson?.sections?.find(s => s._id === sectionId)
      
      // Merge questions from exerciseDetails if exists
      const updatedDetails: any = {
        ...details,
        questions: exerciseDetails[sectionId]?.questions || (section as any)?.questions || []
      }
      
      // Remove test_id if empty to avoid validation error
      if (updatedDetails.test_id === '' || !updatedDetails.test_id) {
        delete updatedDetails.test_id
      }
      
      await adminCourseApi.updateSection(sectionId, updatedDetails)
      
      // Reload lesson to get updated data
      if (selectedLesson) {
        const sections = await adminCourseApi.getSectionsByLessonId(selectedLesson._id)
        setSelectedLesson({
          ...selectedLesson,
          sections
        })
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã lưu nội dung section'
      })
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể lưu nội dung section',
        variant: 'destructive'
      })
    }
  }

  const startEditQuestion = (sectionId: string, question: any) => {
    setEditingQuestionId(question.id)
    setEditingQuestionData({
      ...question,
      sectionId
    })
  }

  const cancelEditQuestion = () => {
    setEditingQuestionId(null)
    setEditingQuestionData(null)
  }

  const saveEditQuestion = () => {
    if (!editingQuestionData) return
    
    const { sectionId, ...questionData } = editingQuestionData
    
    setExerciseDetails(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        questions: prev[sectionId].questions.map((q: any) => 
          q.id === questionData.id ? questionData : q
        )
      }
    }))
    
    toast({
      title: 'Đã cập nhật',
      description: 'Câu hỏi đã được cập nhật. Nhớ bấm "Lưu nội dung" để lưu vào database.'
    })
    
    cancelEditQuestion()
  }

  const updateEditingQuestion = (field: string, value: any) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const updateEditingOption = (index: number, value: string) => {
    setEditingQuestionData((prev: any) => ({
      ...prev,
      options: prev.options.map((opt: string, idx: number) => idx === index ? value : opt)
    }))
  }

  // Column resize handlers
  const handleResizeStart = (column: 'col1' | 'col2', e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(column)
    setStartX(e.clientX)
    setStartWidth(columnWidths[column])
  }

  // Add/remove mousemove and mouseup listeners
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const diff = e.clientX - startX
      const newWidth = Math.max(200, Math.min(600, startWidth + diff))
      
      setColumnWidths(prev => ({
        ...prev,
        [isResizing]: newWidth
      }))
    }

    const handleEnd = () => {
      setIsResizing(null)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, startX, startWidth])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Không tìm thấy lộ trình</p>
            <Button onClick={() => navigate('/admin/courses')} className="mt-4">
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminMenu />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/courses')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{roadmap.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {roadmap.courses.length} khóa học • Target: {roadmap.target_score}+
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={roadmap.is_published ? 'default' : 'secondary'}>
                {roadmap.is_published ? 'Đã xuất bản' : 'Chưa xuất bản'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content - 3 Columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Column 1: Courses List */}
          <div className="bg-white border-r border-gray-200 relative" style={{ width: `${columnWidths.col1}px` }}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Khóa học ({roadmap.courses.length})
                </h2>
                <Button size="sm" onClick={openCreateCourseDialog}>
                  <Plus className="w-4 h-4 mr-1" />
                  Tạo mới
                </Button>
              </div>
              <p className="text-xs text-gray-500">Click vào khóa học để xem bài học</p>
            </div>
            
            {/* Course Create/Edit Dialog */}
            <Dialog open={showCourseDialog} onOpenChange={(open) => {
              setShowCourseDialog(open)
              if (!open) {
                setEditingCourse(null)
                setCourseForm({ title: '', description: '', thumbnail: '', skill_groups: [], price: 0, original_price: 0, is_free: true, assigned_teachers: [] })
                setSelectedExistingCourses([])
              }
            }}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? 'Sửa thông tin khóa học' : 'Thêm khóa học vào lộ trình'}</DialogTitle>
                  <DialogDescription>
                    {editingCourse ? 'Cập nhật thông tin và hình ảnh khóa học' : 'Chọn khóa học có sẵn hoặc tạo khóa học mới'}
                  </DialogDescription>
                </DialogHeader>
                
                {editingCourse ? (
                  // Edit mode - show form directly
                  <>
                    <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="course-title">Tên khóa học *</Label>
                    <Input 
                      id="course-title" 
                      value={courseForm.title} 
                      onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} 
                      placeholder="Ví dụ: TOEIC Reading Master" 
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="course-description">Mô tả</Label>
                    <Textarea 
                      id="course-description" 
                      value={courseForm.description} 
                      onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} 
                      placeholder="Mô tả chi tiết về khóa học..." 
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Hình ảnh khóa học</Label>
                    {courseForm.thumbnail && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                        <img 
                          src={courseForm.thumbnail} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setCourseForm({...courseForm, thumbnail: ''})}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input 
                          id="course-thumbnail" 
                          value={courseForm.thumbnail} 
                          onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})} 
                          placeholder="Hoặc nhập URL ảnh" 
                        />
                      </div>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          {uploadingImage ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="skill-groups">Nhóm kỹ năng</Label>
                    <Select 
                      value={courseForm.skill_groups[0] || ''} 
                      onValueChange={(value) => setCourseForm({...courseForm, skill_groups: [value]})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kỹ năng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listening">Listening</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="speaking">Speaking</SelectItem>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="course-price">Giá bán (VNĐ)</Label>
                      <Input 
                        id="course-price" 
                        type="number"
                        value={courseForm.price} 
                        onChange={(e) => setCourseForm({...courseForm, price: Number(e.target.value)})} 
                        placeholder="0" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="course-original-price">Giá gốc (VNĐ)</Label>
                      <Input 
                        id="course-original-price" 
                        type="number"
                        value={courseForm.original_price} 
                        onChange={(e) => setCourseForm({...courseForm, original_price: Number(e.target.value)})} 
                        placeholder="0" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="course-is-free"
                      checked={courseForm.is_free}
                      onChange={(e) => setCourseForm({...courseForm, is_free: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="course-is-free" className="cursor-pointer">Miễn phí</Label>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="assigned-teachers">Giảng viên phụ trách</Label>
                    {loadingTeachers ? (
                      <div className="text-sm text-gray-500">Đang tải danh sách giảng viên...</div>
                    ) : (
                      <Select 
                        value={courseForm.assigned_teachers[0] || ''} 
                        onValueChange={(value) => setCourseForm({...courseForm, assigned_teachers: value ? [value] : []})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giảng viên" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Không chọn giảng viên</SelectItem>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher._id} value={teacher._id}>
                              {teacher.user?.name || 'Giảng viên'} - {teacher.user?.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                    </div>
                    <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCourseDialog(false)
                      setEditingCourse(null)
                      setCourseForm({ title: '', description: '', thumbnail: '', skill_groups: [], price: 0, original_price: 0, is_free: true, assigned_teachers: [] })
                    }}
                  >
                    Hủy
                  </Button>
                      <Button 
                        onClick={handleUpdateCourse} 
                        disabled={!courseForm.title}
                      >
                        Cập nhật
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  // Create/Add mode - show tabs
                  <Tabs defaultValue="existing" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existing">Chọn khóa học có sẵn</TabsTrigger>
                      <TabsTrigger value="create">Tạo khóa học mới</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="existing" className="space-y-4">
                      <div className="space-y-4 py-4">
                        {/* Search and filter */}
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              placeholder="Tìm kiếm khóa học..."
                              value={courseSearchTerm}
                              onChange={(e) => setCourseSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Select value={courseFilter} onValueChange={setCourseFilter}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Lọc theo kỹ năng" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tất cả</SelectItem>
                              <SelectItem value="listening">Listening</SelectItem>
                              <SelectItem value="reading">Reading</SelectItem>
                              <SelectItem value="speaking">Speaking</SelectItem>
                              <SelectItem value="writing">Writing</SelectItem>
                              <SelectItem value="vocabulary">Vocabulary</SelectItem>
                              <SelectItem value="grammar">Grammar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Course list */}
                        <ScrollArea className="h-[400px] border rounded-lg p-4">
                          {loadingCourses ? (
                            <div className="text-center py-8 text-gray-500">
                              Đang tải danh sách khóa học...
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {allCourses
                                .filter(course => {
                                  // Filter by search term
                                  const matchSearch = !courseSearchTerm || 
                                    course.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
                                  
                                  // Filter by skill group
                                  const matchFilter = !courseFilter || courseFilter === 'all' ||
                                    course.skill_groups?.includes(courseFilter)
                                  
                                  // Exclude courses already in roadmap
                                  const notInRoadmap = !roadmap?.courses.some(c => c._id === course._id)
                                  
                                  return matchSearch && matchFilter && notInRoadmap
                                })
                                .map((course) => (
                                  <div
                                    key={course._id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedExistingCourses.includes(course._id)
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      setSelectedExistingCourses(prev =>
                                        prev.includes(course._id)
                                          ? prev.filter(id => id !== course._id)
                                          : [...prev, course._id]
                                      )
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedExistingCourses.includes(course._id)}
                                        onChange={() => {}}
                                        className="w-4 h-4"
                                      />
                                      {course.thumbnail && (
                                        <img
                                          src={course.thumbnail}
                                          alt={course.title}
                                          className="w-12 h-12 rounded object-cover"
                                        />
                                      )}
                                      <div className="flex-1">
                                        <div className="font-medium">{course.title}</div>
                                        <div className="flex gap-2 mt-1">
                                          {course.skill_groups?.map((skill: string) => (
                                            <Badge key={skill} variant="secondary" className="text-xs">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {allCourses.filter(course => {
                                const matchSearch = !courseSearchTerm || 
                                  course.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
                                const matchFilter = !courseFilter || courseFilter === 'all' ||
                                  course.skill_groups?.includes(courseFilter)
                                const notInRoadmap = !roadmap?.courses.some(c => c._id === course._id)
                                return matchSearch && matchFilter && notInRoadmap
                              }).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                  Không tìm thấy khóa học phù hợp
                                </div>
                              )}
                            </div>
                          )}
                        </ScrollArea>

                        {selectedExistingCourses.length > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Đã chọn {selectedExistingCourses.length} khóa học
                            </p>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowCourseDialog(false)
                            setSelectedExistingCourses([])
                          }}
                        >
                          Hủy
                        </Button>
                        <Button 
                          onClick={handleAddExistingCourses}
                          disabled={selectedExistingCourses.length === 0}
                        >
                          Thêm {selectedExistingCourses.length > 0 ? `(${selectedExistingCourses.length})` : ''} khóa học
                        </Button>
                      </DialogFooter>
                    </TabsContent>

                    <TabsContent value="create" className="space-y-4">
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="course-title">Tên khóa học *</Label>
                          <Input 
                            id="course-title" 
                            value={courseForm.title} 
                            onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} 
                            placeholder="Ví dụ: TOEIC Reading Master" 
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="course-description">Mô tả</Label>
                          <Textarea 
                            id="course-description" 
                            value={courseForm.description} 
                            onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} 
                            placeholder="Mô tả chi tiết về khóa học..." 
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Hình ảnh khóa học</Label>
                          {courseForm.thumbnail && (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                              <img 
                                src={courseForm.thumbnail} 
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => setCourseForm({...courseForm, thumbnail: ''})}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input 
                                id="course-thumbnail" 
                                value={courseForm.thumbnail} 
                                onChange={(e) => setCourseForm({...courseForm, thumbnail: e.target.value})} 
                                placeholder="Hoặc nhập URL ảnh" 
                              />
                            </div>
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={uploadingImage}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                disabled={uploadingImage}
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                {uploadingImage ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="skill-groups">Nhóm kỹ năng</Label>
                          <Select 
                            value={courseForm.skill_groups[0] || ''} 
                            onValueChange={(value) => setCourseForm({...courseForm, skill_groups: [value]})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn kỹ năng" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="listening">Listening</SelectItem>
                              <SelectItem value="reading">Reading</SelectItem>
                              <SelectItem value="speaking">Speaking</SelectItem>
                              <SelectItem value="writing">Writing</SelectItem>
                              <SelectItem value="vocabulary">Vocabulary</SelectItem>
                              <SelectItem value="grammar">Grammar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="course-price">Giá bán (VNĐ)</Label>
                            <Input 
                              id="course-price" 
                              type="number"
                              value={courseForm.price} 
                              onChange={(e) => setCourseForm({...courseForm, price: Number(e.target.value)})} 
                              placeholder="0" 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="course-original-price">Giá gốc (VNĐ)</Label>
                            <Input 
                              id="course-original-price" 
                              type="number"
                              value={courseForm.original_price} 
                              onChange={(e) => setCourseForm({...courseForm, original_price: Number(e.target.value)})} 
                              placeholder="0" 
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="course-is-free"
                            checked={courseForm.is_free}
                            onChange={(e) => setCourseForm({...courseForm, is_free: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="course-is-free" className="cursor-pointer">Miễn phí</Label>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="assigned-teachers">Giảng viên phụ trách</Label>
                          {loadingTeachers ? (
                            <div className="text-sm text-gray-500">Đang tải danh sách giảng viên...</div>
                          ) : (
                            <Select 
                              value={courseForm.assigned_teachers[0] || ''} 
                              onValueChange={(value) => setCourseForm({...courseForm, assigned_teachers: value ? [value] : []})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn giảng viên" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Không chọn giảng viên</SelectItem>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher._id} value={teacher._id}>
                                    {teacher.user?.name || 'Giảng viên'} - {teacher.user?.phone}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowCourseDialog(false)
                            setCourseForm({ title: '', description: '', thumbnail: '', skill_groups: [], price: 0, original_price: 0, is_free: true, assigned_teachers: [] })
                          }}
                        >
                          Hủy
                        </Button>
                        <Button 
                          onClick={handleCreateCourse} 
                          disabled={!courseForm.title}
                        >
                          Tạo khóa học
                        </Button>
                      </DialogFooter>
                    </TabsContent>
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                <div className="space-y-2">
                  {roadmap.courses.map((course, index) => (
                    <div 
                      key={course._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'course', course._id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'course', course._id)}
                      className={`p-3 rounded-lg border cursor-move transition-colors ${
                        selectedCourse?._id === course._id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50 border-gray-200'
                      } ${draggedItem?.kind === 'course' && draggedItem.id === course._id ? 'opacity-50' : ''}`}
                      onClick={() => handleCourseClick(course)}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <span className="font-medium text-sm line-clamp-2 flex-1">{course.title}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => openEditCourseDialog(course, e)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => handleDeleteCourse(course._id, e)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <BookOpen className="w-3 h-3" />
                            <span>{course.lessons?.length || 0} bài học</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {roadmap.courses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có khóa học nào</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            
            {/* Resize Handle */}
            <div 
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart('col1', e)}
              style={{ background: isResizing === 'col1' ? '#3b82f6' : 'transparent' }}
            />
          </div>

          {/* Column 2: Lessons List */}
          <div className="bg-white border-r border-gray-200 relative" style={{ width: `${columnWidths.col2}px` }}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {selectedCourse ? `Bài học (${selectedCourse.lessons?.length || 0})` : 'Bài học'}
                </h3>
                {selectedCourse && (
                  <Dialog open={showLessonDialog} onOpenChange={(open) => {
                    setShowLessonDialog(open)
                    if (!open) {
                      setEditingLesson(null)
                      setLessonForm({ name: '', description: '', duration: '' })
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingLesson ? 'Sửa Bài học' : 'Tạo Bài học mới'}</DialogTitle>
                        <DialogDescription>
                          {editingLesson ? 'Cập nhật thông tin bài học' : `Thêm bài học vào khóa học ${selectedCourse.title}`}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="lesson-name">Tên Bài học</Label>
                          <Input 
                            id="lesson-name" 
                            value={lessonForm.name} 
                            onChange={(e) => setLessonForm({...lessonForm, name: e.target.value})} 
                            placeholder="Ví dụ: Nhận diện thông tin chính" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lesson-description">Mô tả</Label>
                          <Textarea 
                            id="lesson-description" 
                            value={lessonForm.description} 
                            onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})} 
                            placeholder="Mô tả nội dung bài học..." 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lesson-duration">Thời lượng ước tính</Label>
                          <Input 
                            id="lesson-duration" 
                            value={lessonForm.duration} 
                            onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})} 
                            placeholder="Ví dụ: 45 phút" 
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowLessonDialog(false)
                            setEditingLesson(null)
                            setLessonForm({ name: '', description: '', duration: '' })
                          }}
                        >
                          Hủy
                        </Button>
                        <Button 
                          onClick={editingLesson ? handleUpdateLesson : handleCreateLesson} 
                          disabled={!lessonForm.name}
                        >
                          {editingLesson ? 'Cập nhật' : 'Tạo Bài học'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {selectedCourse && (
                <p className="text-xs text-gray-500">{selectedCourse.title}</p>
              )}
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              {selectedCourse ? (
                <div className="p-4 space-y-2">
                  {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                    selectedCourse.lessons.map((lesson) => (
                      <div 
                        key={lesson._id}
                        className={`p-3 rounded-lg border cursor-move transition-colors ${
                          selectedLesson?._id === lesson._id 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50 border-gray-200'
                        } ${draggedItem?.kind === 'lesson' && draggedItem.id === lesson._id ? 'opacity-50' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'lesson', lesson._id, selectedCourse._id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'lesson', lesson._id, selectedCourse._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center gap-2 flex-1"
                            onClick={() => handleLessonClick(lesson)}
                          >
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-sm">{lesson.title || lesson.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditLessonDialog(lesson)
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteLesson(lesson._id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{lesson.sections?.length || 0} sections</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có bài học nào</p>
                      <p className="text-xs text-gray-400">Hãy tạo bài học đầu tiên</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Chọn khóa học để xem bài học</p>
                  </div>
                </div>
              )}
            </ScrollArea>
            
            {/* Resize Handle */}
            <div 
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10"
              onMouseDown={(e) => handleResizeStart('col2', e)}
              style={{ background: isResizing === 'col2' ? '#3b82f6' : 'transparent' }}
            />
          </div>

          {/* Column 3: Sections Management */}
          <div className="flex-1 bg-white">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">
                  {selectedLesson ? `Sections (${selectedLesson.sections?.length || 0})` : 'Sections'}
                </h3>
                {selectedLesson && (
                  <Dialog open={showSectionDialog} onOpenChange={(open) => {
                    setShowSectionDialog(open)
                    if (!open) {
                      setEditingSection(null)
                      setSectionForm({ name: '', type: 'video', duration: '' })
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSection ? 'Sửa Section' : 'Tạo Section mới'}</DialogTitle>
                        <DialogDescription>
                          {editingSection ? 'Cập nhật thông tin section' : `Thêm section vào bài học ${selectedLesson.title || selectedLesson.name}`}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="section-name">Tên Section</Label>
                          <Input 
                            id="section-name" 
                            value={sectionForm.name} 
                            onChange={(e) => setSectionForm({...sectionForm, name: e.target.value})} 
                            placeholder="Ví dụ: Giới thiệu format Part 1" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="section-type">Loại nội dung</Label>
                          <Select 
                            value={sectionForm.type} 
                            onValueChange={(value: any) => setSectionForm({...sectionForm, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="document">Tài liệu</SelectItem>
                              <SelectItem value="mindmap">Mind Map</SelectItem>
                              <SelectItem value="exercise">Bài tập</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="section-duration">Thời lượng</Label>
                          <Input 
                            id="section-duration" 
                            value={sectionForm.duration} 
                            onChange={(e) => setSectionForm({...sectionForm, duration: e.target.value})} 
                            placeholder="Ví dụ: 15 phút" 
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Upload tài liệu</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Kéo thả file hoặc click để chọn</p>
                            <p className="text-xs text-gray-500 mt-1">Video, PDF, Images, Mind Maps</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowSectionDialog(false)
                            setEditingSection(null)
                            setSectionForm({ name: '', type: 'video', duration: '' })
                          }}
                        >
                          Hủy
                        </Button>
                        <Button 
                          onClick={editingSection ? handleUpdateSection : handleCreateSection} 
                          disabled={!sectionForm.name}
                        >
                          {editingSection ? 'Cập nhật' : 'Tạo Section'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {selectedLesson && (
                <p className="text-xs text-gray-500">{selectedLesson.title || selectedLesson.name}</p>
              )}
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                {selectedLesson ? (
                  selectedLesson.sections && selectedLesson.sections.length > 0 ? (
                    <div className="space-y-3">
                      {selectedLesson.sections.map((section) => (
                        <div 
                          key={section._id}
                          className={`border border-gray-200 rounded-lg overflow-hidden cursor-move ${draggedItem?.kind === 'section' && draggedItem.id === section._id ? 'opacity-50' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'section', section._id, selectedCourse?._id, selectedLesson._id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, 'section', section._id, selectedCourse?._id, selectedLesson._id)}
                        >
                          <div 
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => toggleSectionDetails(section._id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {getSectionIcon(section.type)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{section.title || section.name}</span>
                                    {expandedSectionId === section._id ? (
                                      <ChevronUp className="w-4 h-4 text-blue-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                  {(section.duration || section.duration_minutes) && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {section.duration || `${section.duration_minutes} phút`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{getSectionTypeLabel(section.type)}</Badge>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditSectionDialog(section)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteSection(section._id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Section Details */}
                          {expandedSectionId === section._id && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                              <div className="space-y-3">
                                {section.type === 'video' && (
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor={`video-url-${section._id}`}>Video URL hoặc Upload File</Label>
                                      <div className="flex gap-2 mt-1">
                                        <Input
                                          id={`video-url-${section._id}`}
                                          value={sectionDetails[section._id]?.video_url || ''}
                                          onChange={(e) => updateSectionDetail(section._id, 'video_url', e.target.value)}
                                          placeholder="https://youtube.com/... hoặc upload file"
                                          className="flex-1"
                                        />
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => document.getElementById(`video-file-${section._id}`)?.click()}
                                          disabled={uploadingFile[section._id]}
                                        >
                                          <Upload className="w-4 h-4 mr-1" />
                                          {uploadingFile[section._id] ? 'Đang tải...' : 'Upload'}
                                        </Button>
                                        <input
                                          id={`video-file-${section._id}`}
                                          type="file"
                                          accept="video/mp4,video/mov,video/avi"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleUploadVideoFile(section._id, file)
                                          }}
                                        />
                                      </div>
                                    </div>
                                    {sectionDetails[section._id]?.video_url && (
                                      <div className="rounded-lg overflow-hidden bg-black">
                                        {getYouTubeVideoId(sectionDetails[section._id]?.video_url || '') ? (
                                          <iframe
                                            width="100%"
                                            height="315"
                                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(sectionDetails[section._id]?.video_url || '')}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        ) : (
                                          <video
                                            controls
                                            className="w-full"
                                            src={sectionDetails[section._id]?.video_url}
                                          >
                                            Trình duyệt không hỗ trợ video.
                                          </video>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {section.type === 'document' && (
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor={`article-content-${section._id}`}>Nội dung bài viết</Label>
                                      <Textarea
                                        id={`article-content-${section._id}`}
                                        value={sectionDetails[section._id]?.article_content || ''}
                                        onChange={(e) => updateSectionDetail(section._id, 'article_content', e.target.value)}
                                        placeholder="Nhập nội dung bài viết..."
                                        rows={10}
                                        className="mt-1 font-mono text-sm"
                                      />
                                    </div>
                                    {sectionDetails[section._id]?.article_content && (
                                      <div className="border rounded-lg p-4 bg-white">
                                        <h4 className="font-semibold text-sm mb-3 text-gray-700">Xem trước:</h4>
                                        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                                          {sectionDetails[section._id]?.article_content}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {section.type === 'mindmap' && (
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor={`mindmap-url-${section._id}`}>Mind Map URL hoặc Upload File</Label>
                                      <div className="flex gap-2 mt-1">
                                        <Input
                                          id={`mindmap-url-${section._id}`}
                                          value={sectionDetails[section._id]?.mindmap_url || ''}
                                          onChange={(e) => updateSectionDetail(section._id, 'mindmap_url', e.target.value)}
                                          placeholder="https://example.com/mindmap.png hoặc upload"
                                          className="flex-1"
                                        />
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => document.getElementById(`mindmap-file-${section._id}`)?.click()}
                                          disabled={uploadingFile[section._id]}
                                        >
                                          <Upload className="w-4 h-4 mr-1" />
                                          {uploadingFile[section._id] ? 'Đang tải...' : 'Upload'}
                                        </Button>
                                        <input
                                          id={`mindmap-file-${section._id}`}
                                          type="file"
                                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleUploadMindmapFile(section._id, file)
                                          }}
                                        />
                                      </div>
                                    </div>
                                    {sectionDetails[section._id]?.mindmap_url && (
                                      <div className="rounded-lg overflow-hidden border bg-white p-4">
                                        <img
                                          src={sectionDetails[section._id]?.mindmap_url}
                                          alt="Mind Map"
                                          className="w-full h-auto"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none'
                                            const errorDiv = document.createElement('div')
                                            errorDiv.className = 'text-center text-red-500 text-sm py-4'
                                            errorDiv.textContent = 'Không thể tải ảnh mindmap. Vui lòng kiểm tra URL.'
                                            e.currentTarget.parentElement?.appendChild(errorDiv)
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {section.type === 'exercise' && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor={`test-id-${section._id}`}>Test ID hoặc Import JSON</Label>
                                      <div className="flex gap-2 mt-1">
                                        <Input
                                          id={`test-id-${section._id}`}
                                          value={sectionDetails[section._id]?.test_id || ''}
                                          onChange={(e) => {
                                            updateSectionDetail(section._id, 'test_id', e.target.value)
                                            if (e.target.value) {
                                              loadExerciseDetails(section._id, e.target.value)
                                            }
                                          }}
                                          placeholder="ID của bài test hoặc import JSON"
                                          className="flex-1"
                                        />
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => document.getElementById(`questions-json-${section._id}`)?.click()}
                                        >
                                          <Upload className="w-4 h-4 mr-1" />
                                          Import JSON
                                        </Button>
                                        <input
                                          id={`questions-json-${section._id}`}
                                          type="file"
                                          accept="application/json,.json"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleImportQuestionsJSON(section._id, file)
                                          }}
                                        />
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Format JSON: {`{ "questions": [{ "id": "1", "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0 }] }`}
                                      </p>
                                    </div>
                                    
                                    {/* Exercise Details Display */}
                                    {loadingExercise[section._id] && (
                                      <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">Đang tải chi tiết bài tập...</p>
                                      </div>
                                    )}
                                    
                                    {exerciseDetails[section._id] && !loadingExercise[section._id] && (
                                      <div className="border rounded-lg p-4 bg-white space-y-4">
                                        <div>
                                          <h4 className="font-semibold text-sm mb-2">Thông tin bài tập</h4>
                                          <div className="space-y-2 text-xs">
                                            <p><strong>Tiêu đề:</strong> {exerciseDetails[section._id].title}</p>
                                            {exerciseDetails[section._id].description && (
                                              <p><strong>Mô tả:</strong> {exerciseDetails[section._id].description}</p>
                                            )}
                                            {exerciseDetails[section._id].duration_minutes && (
                                              <p><strong>Thời gian:</strong> {exerciseDetails[section._id].duration_minutes} phút</p>
                                            )}
                                            {exerciseDetails[section._id].audio_url && (
                                              <div>
                                                <strong>Audio:</strong>
                                                <audio controls className="w-full mt-1">
                                                  <source src={exerciseDetails[section._id].audio_url} type="audio/mpeg" />
                                                </audio>
                                              </div>
                                            )}
                                            {(exerciseDetails[section._id].audioUrl || (section as any).audioUrl) && (
                                              <div>
                                                <strong>Audio:</strong>
                                                <audio controls className="w-full mt-1">
                                                  <source src={exerciseDetails[section._id].audioUrl || (section as any).audioUrl} type="audio/mpeg" />
                                                </audio>
                                              </div>
                                            )}
                                            {exerciseDetails[section._id].transcript && (
                                              <div>
                                                <strong>Transcript:</strong>
                                                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{exerciseDetails[section._id].transcript}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Questions List */}
                                        {exerciseDetails[section._id].questions && exerciseDetails[section._id].questions.length > 0 ? (
                                          <div>
                                            <h4 className="font-semibold text-sm mb-2">Câu hỏi ({exerciseDetails[section._id].questions.length})</h4>
                                            <ScrollArea className="h-96 border rounded">
                                              <div className="space-y-3 p-3">
                                                {exerciseDetails[section._id].questions.map((question: any, qIndex: number) => (
                                                  <div key={question.id || qIndex} className="border-b pb-3 last:border-b-0">
                                                    {editingQuestionId === question.id ? (
                                                      // Edit Mode
                                                      <div className="space-y-3 bg-blue-50 p-3 rounded">
                                                        <div>
                                                          <Label className="text-xs">Câu hỏi {question.order || qIndex + 1}</Label>
                                                          <Textarea
                                                            value={editingQuestionData?.questionText || ''}
                                                            onChange={(e) => updateEditingQuestion('questionText', e.target.value)}
                                                            rows={2}
                                                            className="mt-1"
                                                          />
                                                        </div>
                                                        
                                                        <div>
                                                          <Label className="text-xs">Audio URL</Label>
                                                          <Input
                                                            value={editingQuestionData?.audio || ''}
                                                            onChange={(e) => updateEditingQuestion('audio', e.target.value)}
                                                            placeholder="https://..."
                                                            className="mt-1"
                                                          />
                                                        </div>
                                                        
                                                        <div>
                                                          <Label className="text-xs">Image URL</Label>
                                                          <Input
                                                            value={editingQuestionData?.image || ''}
                                                            onChange={(e) => updateEditingQuestion('image', e.target.value)}
                                                            placeholder="https://..."
                                                            className="mt-1"
                                                          />
                                                        </div>
                                                        
                                                        <div>
                                                          <Label className="text-xs">Transcript</Label>
                                                          <Textarea
                                                            value={editingQuestionData?.transcript || ''}
                                                            onChange={(e) => updateEditingQuestion('transcript', e.target.value)}
                                                            rows={3}
                                                            className="mt-1"
                                                          />
                                                        </div>
                                                        
                                                        <div>
                                                          <Label className="text-xs">Đáp án</Label>
                                                          {editingQuestionData?.options?.map((opt: string, oIndex: number) => (
                                                            <div key={oIndex} className="flex items-center gap-2 mt-2">
                                                              <span className="text-xs font-semibold w-6">{String.fromCharCode(65 + oIndex)}.</span>
                                                              <Input
                                                                value={opt}
                                                                onChange={(e) => updateEditingOption(oIndex, e.target.value)}
                                                                className="flex-1"
                                                              />
                                                              <input
                                                                type="radio"
                                                                checked={editingQuestionData?.correctAnswer === oIndex}
                                                                onChange={() => updateEditingQuestion('correctAnswer', oIndex)}
                                                                className="w-4 h-4"
                                                              />
                                                            </div>
                                                          ))}
                                                        </div>
                                                        
                                                        <div>
                                                          <Label className="text-xs">Giải thích</Label>
                                                          <Textarea
                                                            value={editingQuestionData?.explanation || ''}
                                                            onChange={(e) => updateEditingQuestion('explanation', e.target.value)}
                                                            rows={3}
                                                            className="mt-1"
                                                          />
                                                        </div>
                                                        
                                                        <div className="flex gap-2">
                                                          <Button size="sm" onClick={saveEditQuestion}>Lưu</Button>
                                                          <Button size="sm" variant="outline" onClick={cancelEditQuestion}>Hủy</Button>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      // View Mode
                                                      <div>
                                                        <div className="flex items-start justify-between mb-2">
                                                          <p className="font-medium text-xs flex-1">
                                                            Câu {question.order || qIndex + 1}: {question.questionText || question.question_text || 'Không có nội dung'}
                                                          </p>
                                                          <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => startEditQuestion(section._id, question)}
                                                          >
                                                            <Edit className="w-3 h-3" />
                                                          </Button>
                                                        </div>
                                                        
                                                        {(question.image || question.image_url) && (
                                                          <img src={question.image || question.image_url} alt="Question" className="w-full max-w-md h-auto rounded mb-2" />
                                                        )}
                                                        
                                                        {(question.audio || question.audio_url) && (
                                                          <audio controls className="w-full mb-2">
                                                            <source src={question.audio || question.audio_url} type="audio/mpeg" />
                                                          </audio>
                                                        )}
                                                        
                                                        {question.options && question.options.length > 0 && (
                                                          <div className="space-y-1 ml-4">
                                                            {question.options.map((option: any, oIndex: number) => {
                                                              const isCorrect = typeof option === 'string' 
                                                                ? question.correctAnswer === oIndex
                                                                : option.is_correct
                                                              const optionText = typeof option === 'string' ? option : option.option_text
                                                              
                                                              return (
                                                                <div 
                                                                  key={oIndex}
                                                                  className={`text-xs p-2 rounded ${
                                                                    isCorrect
                                                                      ? 'bg-green-100 text-green-800 font-semibold' 
                                                                      : 'bg-gray-50'
                                                                  }`}
                                                                >
                                                                  {String.fromCharCode(65 + oIndex)}. {optionText}
                                                                  {isCorrect && ' ✓'}
                                                                </div>
                                                              )
                                                            })}
                                                          </div>
                                                        )}
                                                        
                                                        {question.explanation && (
                                                          <div className="mt-2 p-2 bg-blue-50 rounded">
                                                            <p className="text-xs"><strong>Giải thích:</strong> {question.explanation}</p>
                                                          </div>
                                                        )}
                                                        
                                                        {question.transcript && (
                                                          <div className="mt-2 p-2 bg-gray-50 rounded">
                                                            <p className="text-xs"><strong>Transcript:</strong> {question.transcript}</p>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </ScrollArea>
                                          </div>
                                        ) : (
                                          <div className="text-center py-4 text-sm text-gray-500">
                                            Chưa có câu hỏi nào. Hãy thêm test_id hoặc thêm câu hỏi trực tiếp vào section.
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    {!loadingExercise[section._id] && !exerciseDetails[section._id] && sectionDetails[section._id]?.test_id && (
                                      <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">Bấm để tải chi tiết bài tập</p>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="mt-2"
                                          onClick={() => loadExerciseDetails(section._id, sectionDetails[section._id]?.test_id || '')}
                                        >
                                          Tải chi tiết
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div>
                                  <Label htmlFor={`duration-${section._id}`}>Thời lượng (phút)</Label>
                                  <Input
                                    id={`duration-${section._id}`}
                                    type="number"
                                    value={sectionDetails[section._id]?.duration_minutes || 0}
                                    onChange={(e) => updateSectionDetail(section._id, 'duration_minutes', Number(e.target.value))}
                                    className="mt-1"
                                  />
                                </div>
                                
                                <Button 
                                  onClick={() => saveSectionDetails(section._id)}
                                  className="w-full"
                                >
                                  Lưu nội dung
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có section nào</p>
                      <p className="text-xs text-gray-400">Click "Thêm" để tạo section</p>
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Chọn một bài học để quản lý sections</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
