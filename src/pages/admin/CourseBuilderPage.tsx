import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Edit, Trash2, FileText, Video, Brain, Upload } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useToast } from '../../hooks/use-toast'
import AdminMenu from '../../components/AdminMenu'
import { adminCourseApi } from '../../api/adminCourseApi'

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
  name: string
  title?: string
  description: string
  level: string
  thumbnail?: string
  lessons?: Lesson[]
}

export default function CourseBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  
  // Form states
  const [lessonForm, setLessonForm] = useState({ name: '', description: '', duration: '' })
  const [sectionForm, setSectionForm] = useState({ name: '', type: 'video' as const, duration: '' })

  // Load course data
  useEffect(() => {
    if (id) {
      loadCourse()
    }
  }, [id])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const data = await adminCourseApi.getCourseById(id!)
      console.log('Course data from API:', data)
      
      // If lessons are not included, load them separately
      if (!data.lessons || data.lessons.length === 0) {
        try {
          const lessons = await adminCourseApi.getLessonsByCourseId(id!)
          console.log('Lessons from API:', lessons)
          
          // Load sections for each lesson
          const lessonsWithSections = await Promise.all(
            lessons.map(async (lesson: any) => {
              try {
                const sections = await adminCourseApi.getSectionsByLessonId(lesson._id)
                return { ...lesson, sections }
              } catch {
                return { ...lesson, sections: [] }
              }
            })
          )
          
          data.lessons = lessonsWithSections
        } catch (error) {
          console.error('Error loading lessons:', error)
          data.lessons = []
        }
      }
      
      setCourse(data)
    } catch (error: any) {
      console.error('Error loading course:', error)
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tải khóa học',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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

  // Lesson CRUD
  const handleCreateLesson = async () => {
    if (!course) return
    try {
      const newLesson = await adminCourseApi.createLesson({
        course_id: course._id,
        title: lessonForm.name,
        description: lessonForm.description,
        order: course.lessons?.length || 0
      })
      
      setCourse({
        ...course,
        lessons: [...(course.lessons || []), newLesson]
      })
      
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
    if (!course || !editingLesson) return
    try {
      const updated = await adminCourseApi.updateLesson(editingLesson._id, {
        title: lessonForm.name,
        description: lessonForm.description
      })
      
      setCourse({
        ...course,
        lessons: (course.lessons || []).map(l => l._id === editingLesson._id ? updated : l)
      })
      
      if (selectedLesson?._id === editingLesson._id) {
        setSelectedLesson(updated)
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
    if (!course) return
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return
    
    try {
      await adminCourseApi.deleteLesson(lessonId)
      
      setCourse({
        ...course,
        lessons: (course.lessons || []).filter(l => l._id !== lessonId)
      })
      
      if (selectedLesson?._id === lessonId) {
        setSelectedLesson(null)
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

  const openEditLessonDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      name: lesson.title || lesson.name || '',
      description: lesson.description || '',
      duration: lesson.duration || ''
    })
    setShowLessonDialog(true)
  }

  // Section CRUD
  const handleCreateSection = async () => {
    if (!course || !selectedLesson) return
    try {
      const newSection = await adminCourseApi.createSection({
        lesson_id: selectedLesson._id,
        title: sectionForm.name,
        type: sectionForm.type as any,
        order: selectedLesson.sections?.length || 0,
        duration_minutes: sectionForm.duration ? parseInt(sectionForm.duration) : undefined
      })
      
      const updatedLesson = {
        ...selectedLesson,
        sections: [...(selectedLesson.sections || []), newSection]
      }
      
      setCourse({
        ...course,
        lessons: (course.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
      })
      
      setSelectedLesson(updatedLesson)
      
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
    if (!course || !selectedLesson || !editingSection) return
    try {
      const updated = await adminCourseApi.updateSection(editingSection._id, {
        title: sectionForm.name,
        type: sectionForm.type as any,
        duration_minutes: sectionForm.duration ? parseInt(sectionForm.duration) : undefined
      })
      
      const updatedLesson = {
        ...selectedLesson,
        sections: (selectedLesson.sections || []).map(s => s._id === editingSection._id ? updated : s)
      }
      
      setCourse({
        ...course,
        lessons: (course.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
      })
      
      setSelectedLesson(updatedLesson)
      
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
    if (!course || !selectedLesson) return
    if (!confirm('Bạn có chắc chắn muốn xóa section này?')) return
    
    try {
      await adminCourseApi.deleteSection(sectionId)
      
      const updatedLesson = {
        ...selectedLesson,
        sections: (selectedLesson.sections || []).filter(s => s._id !== sectionId)
      }
      
      setCourse({
        ...course,
        lessons: (course.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
      })
      
      setSelectedLesson(updatedLesson)
      
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

  const openEditSectionDialog = (section: Section) => {
    setEditingSection(section)
    setSectionForm({
      name: section.title || section.name || '',
      type: section.type as any,
      duration: section.duration || String(section.duration_minutes || '')
    })
    setShowSectionDialog(true)
  }

  // Drag & drop handlers for lessons
  const onDragStart = (e: React.DragEvent, payload: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleLessonDrop = async (e: React.DragEvent, targetLessonId: string | null) => {
    e.preventDefault()
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw || !course) return
      
      const data = JSON.parse(raw)
      if (data.kind !== 'lesson') return

      const lessons = [...(course.lessons || [])]
      const fromIndex = lessons.findIndex(l => l._id === data.id)
      if (fromIndex === -1) return

      const [moved] = lessons.splice(fromIndex, 1)
      const toIndex = targetLessonId == null ? lessons.length : Math.max(0, lessons.findIndex(l => l._id === targetLessonId))
      lessons.splice(toIndex, 0, moved)

      // Update UI (TODO: Create API endpoint to update multiple lesson orders)
      setCourse({ ...course, lessons })
      
      toast({
        title: 'Thành công',
        description: 'Đã thay đổi thứ tự bài học'
      })
    } catch (err) {
      console.error('Error reordering lessons:', err)
    }
  }

  const handleSectionDrop = async (e: React.DragEvent, targetSectionId: string | null) => {
    e.preventDefault()
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw || !course || !selectedLesson) return
      
      const data = JSON.parse(raw)
      if (data.kind !== 'section') return

      const sections = [...(selectedLesson.sections || [])]
      const fromIndex = sections.findIndex(s => s._id === data.id)
      if (fromIndex === -1) return

      const [moved] = sections.splice(fromIndex, 1)
      const toIndex = targetSectionId == null ? sections.length : Math.max(0, sections.findIndex(s => s._id === targetSectionId))
      sections.splice(toIndex, 0, moved)

      const updatedLesson = { ...selectedLesson, sections }
      
      setCourse({
        ...course,
        lessons: (course.lessons || []).map(l => l._id === selectedLesson._id ? updatedLesson : l)
      })
      
      setSelectedLesson(updatedLesson)
      
      toast({
        title: 'Thành công',
        description: 'Đã thay đổi thứ tự section'
      })
    } catch (err) {
      console.error('Error reordering sections:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Không tìm thấy khóa học</p>
            <Button onClick={() => navigate('/admin/courses')}>Quay lại danh sách</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 flex h-screen">
        {/* Left Panel - Course Info & Lessons List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/courses')} 
              className="p-0 h-auto font-semibold text-lg mb-2"
            >
              ← {course.title || course.name}
            </Button>
            <p className="text-sm text-gray-600 mb-3">{course.description}</p>
            <Badge variant="outline" className="text-xs">
              {course.level}
            </Badge>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Bài học ({course.lessons?.length || 0})</h3>
                <Dialog open={showLessonDialog} onOpenChange={(open) => {
                  setShowLessonDialog(open)
                  if (!open) {
                    setEditingLesson(null)
                    setLessonForm({ name: '', description: '', duration: '' })
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingLesson ? 'Sửa Bài học' : 'Tạo Bài học mới'}</DialogTitle>
                      <DialogDescription>
                        {editingLesson ? 'Cập nhật thông tin bài học' : 'Thêm bài học mới vào khóa học'}
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
              </div>

              <div className="space-y-2">
                {course.lessons && course.lessons.length > 0 ? (
                  course.lessons.map((lesson) => (
                    <div 
                      key={lesson._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLesson?._id === lesson._id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      draggable
                      onDragStart={(e) => onDragStart(e, { kind: 'lesson', id: lesson._id })}
                      onDragOver={onDragOver}
                      onDrop={(e) => handleLessonDrop(e, lesson._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-2 flex-1"
                          onClick={() => setSelectedLesson(lesson)}
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
                      {lesson.duration && (
                        <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                      )}
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
            </div>
          </ScrollArea>
        </div>

        {/* Middle Panel - Lesson Details with Sections */}
        <div className="flex-1 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {selectedLesson ? (selectedLesson.title || selectedLesson.name) : 'Chọn một bài học'}
            </h2>
            {selectedLesson?.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedLesson.description}</p>
            )}
          </div>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              {selectedLesson ? (
                <div className="space-y-3">
                  {selectedLesson.sections && selectedLesson.sections.length > 0 ? (
                    selectedLesson.sections.map((section) => (
                      <div 
                        key={section._id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        draggable
                        onDragStart={(e) => onDragStart(e, { kind: 'section', id: section._id })}
                        onDragOver={onDragOver}
                        onDrop={(e) => handleSectionDrop(e, section._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getSectionIcon(section.type)}
                            <div>
                              <span className="font-medium text-sm">{section.title || section.name}</span>
                              {(section.duration || section.duration_minutes) && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {section.duration || `${section.duration_minutes} phút`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{section.type}</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => openEditSectionDialog(section)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteSection(section._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có section nào</p>
                      <p className="text-xs text-gray-400">Hãy tạo section đầu tiên ở bên phải</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chọn một bài học để xem danh sách sections</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Section Management */}
        <div className="w-80 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
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
                        {editingSection ? 'Cập nhật thông tin section' : `Thêm section vào bài học ${selectedLesson.name}`}
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
          </div>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              {selectedLesson ? (
                selectedLesson.sections && selectedLesson.sections.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLesson.sections.map((section) => (
                      <Card key={section._id} className="p-3">
                        <div className="flex items-start gap-3">
                          {getSectionIcon(section.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{section.title || section.name}</h4>
                            {(section.duration || section.duration_minutes) && (
                              <p className="text-xs text-gray-500 mt-1">
                                {section.duration || `${section.duration_minutes} phút`}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">{section.type}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => openEditSectionDialog(section)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteSection(section._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
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
  )
}
