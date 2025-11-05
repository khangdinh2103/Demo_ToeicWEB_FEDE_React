import { useState } from 'react'
import { Plus, BookOpen, Clock, CheckCircle, FolderOpen, FileText, Video, Brain, Upload, Edit, Trash2, ChevronRight, ChevronDown, ToggleLeft, ToggleRight, Search, AlertTriangle, User, Calendar, Filter, Check, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ScrollArea } from '../../components/ui/scroll-area'
import AdminMenu from '../../components/AdminMenu'

// Sample data tailored for a TOEIC learning site (friendly labels)
const initialTracks = [
  {
    id: 1,
    name: 'TOEIC Listening Mastery',
    description: 'Lộ trình luyện nghe từ cơ bản tới nâng cao, bao gồm bài tập Part 1-4 và bài thi mô phỏng',
    status: 'active',
    skills: 'LR',
    level: 'lr-intermediate',
    category: 'listening',
    author: 'Nguyễn Minh Khang',
    createdDate: '2024-08-15',
    courses: [
      {
        id: 1,
        name: 'Part 1: Photographs',
        lessons: [
          {
            id: 1,
            name: 'Nhận diện thông tin chính',
            sections: [
              { id: 1, name: 'Giới thiệu format Part 1', type: 'video', duration: '10 phút' },
              { id: 2, name: 'Bộ bài luyện tập (10 câu)', type: 'exercise', duration: '25 phút' }
            ]
          }
          ,
          {
            id: 2,
            name: 'Chiến lược trả lời nhanh',
            sections: [
              { id: 3, name: 'Kỹ thuật loại trừ', type: 'video', duration: '12 phút' },
              { id: 4, name: 'Bài tập 15 câu', type: 'exercise', duration: '30 phút' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'TOEIC Reading Strategies',
    description: 'Chiến thuật giải nhanh Part 5-7 và kỹ năng đọc hiểu',
    status: 'pending',
    skills: 'LR',
    level: 'lr-basic',
    category: 'reading',
    author: 'Trần Thị Mai',
    createdDate: '2024-08-20',
    courses: []
  },
  {
    id: 3,
    name: 'TOEIC Vocabulary Builder',
    description: 'Xây dựng vốn từ vựng TOEIC hiệu quả với 1000+ từ thông dụng',
    status: 'pending',
    skills: 'LR',
    level: 'lr-intermediate',
    category: 'vocabulary',
    author: 'Nguyễn Văn Tú',
    createdDate: '2024-08-22',
    courses: []
  }
]

export default function AdminPage() {
  const [tracks, setTracks] = useState(initialTracks)
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set())
  const [showTrackDialog, setShowTrackDialog] = useState(false)
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [trackToDelete, setTrackToDelete] = useState<any>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [trackToApprove, setTrackToApprove] = useState<any>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [trackToReject, setTrackToReject] = useState<any>(null)
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false)
  const [trackToChangeStatus, setTrackToChangeStatus] = useState<any>(null)
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filters, setFilters] = useState({
    author: '',
    dateFrom: '',
    dateTo: '',
    level: '',
    skills: ''
  })
  const [newTrack, setNewTrack] = useState({ name: '', description: '', category: '', level: '', skills: '', author: '', createdDate: '' })
  const [newCourse, setNewCourse] = useState({ name: '', description: '' })
  const [newLesson, setNewLesson] = useState({ name: '', description: '', duration: '' })
  const [newSection, setNewSection] = useState({ name: '', type: 'video', duration: '', file: null })

  const getLevelDisplayName = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'lr-basic': 'LR căn bản 450+',
      'lr-intermediate': 'LR trung cấp 550+',
      'lr-advanced': 'LR chuyên sâu 800+',
      'ws-basic': 'WS căn bản 100+',
      'ws-intermediate': 'WS trung cấp 200+',
      'ws-advanced': 'WS chuyên sâu 300+',
      'lrws-basic': 'Căn bản (LR 450+ & WS 100+)',
      'lrws-intermediate': 'Trung cấp (LR 550+ & WS 200+)',
      'lrws-advanced': 'Chuyên sâu (LR 800+ & WS 300+)'
    }
    return levelMap[level] || level
  }

  const getSkillsDisplayName = (skills: string) => {
    const skillsMap: { [key: string]: string } = {
      'LR': '2 kỹ năng LR',
      'WS': '2 kỹ năng WS',
      'LRWS': '4 kỹ năng'
    }
    return skillsMap[skills] || skills
  }

  const handleCreateTrack = () => {
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const track = { 
      id: tracks.length + 1, 
      ...newTrack, 
      author: newTrack.author || 'Admin', // Default author if not provided
      createdDate: currentDate,
      status: 'active', 
      courses: [] 
    }
    setTracks([...tracks, track])
    setSelectedTrack(track)
    setNewTrack({ name: '', description: '', category: '', level: '', skills: '', author: '', createdDate: '' })
    setShowTrackDialog(false)
  }

  const handleDeleteTrack = (track: any) => {
    setTrackToDelete(track)
    setShowDeleteDialog(true)
  }

  const confirmDeleteTrack = () => {
    if (trackToDelete) {
      setTracks(tracks.filter(t => t.id !== trackToDelete.id))
      if (selectedTrack?.id === trackToDelete.id) {
        setSelectedTrack(null)
        setSelectedCourse(null)
        setSelectedLesson(null)
      }
      setTrackToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  // Approve a course (change status to active)
  const handleApproveCourse = (track: any) => {
    setTrackToApprove(track)
    setShowApproveDialog(true)
  }

  const confirmApproveCourse = () => {
    if (trackToApprove) {
      const updated = tracks.map(t => t.id === trackToApprove.id ? { ...t, status: 'active' } : t)
      setTracks(updated)
      setTrackToApprove(null)
      setShowApproveDialog(false)
    }
  }

  // Reject a course (delete it)
  const handleRejectCourse = (track: any) => {
    setTrackToReject(track)
    setShowRejectDialog(true)
  }

  const confirmRejectCourse = () => {
    if (trackToReject) {
      setTracks(tracks.filter(t => t.id !== trackToReject.id))
      if (selectedTrack?.id === trackToReject.id) {
        setSelectedTrack(null)
        setSelectedCourse(null)
        setSelectedLesson(null)
      }
      setTrackToReject(null)
      setShowRejectDialog(false)
    }
  }

  // Handle status change with confirmation
  const handleStatusChange = (track: any) => {
    setTrackToChangeStatus(track)
    setShowStatusChangeDialog(true)
  }

  const confirmStatusChange = () => {
    if (trackToChangeStatus) {
      const updated = tracks.map(t => t.id === trackToChangeStatus.id ? { ...t, status: t.status === 'active' ? 'pending' : 'active' } : t)
      setTracks(updated)
      // Update selectedTrack if it's the one being toggled
      if (selectedTrack && selectedTrack.id === trackToChangeStatus.id) {
        setSelectedTrack({ ...selectedTrack, status: selectedTrack.status === 'active' ? 'pending' : 'active' })
      }
      setTrackToChangeStatus(null)
      setShowStatusChangeDialog(false)
    }
  }

  const filteredTracks = tracks.filter(track => {
    // Basic search filter
    const matchesSearch = track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.category.toLowerCase().includes(searchTerm.toLowerCase())

    // Advanced filters
    const matchesAuthor = !filters.author || track.author.toLowerCase().includes(filters.author.toLowerCase())
    const matchesLevel = !filters.level || filters.level === 'all' || track.level === filters.level
    const matchesSkills = !filters.skills || filters.skills === 'all' || track.skills === filters.skills
    
    // Date range filter
    let matchesDateRange = true
    if (filters.dateFrom || filters.dateTo) {
      const trackDate = new Date(track.createdDate)
      if (filters.dateFrom) {
        matchesDateRange = matchesDateRange && trackDate >= new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        matchesDateRange = matchesDateRange && trackDate <= new Date(filters.dateTo)
      }
    }

    return matchesSearch && matchesAuthor && matchesLevel && matchesSkills && matchesDateRange
  })

  const clearFilters = () => {
    setFilters({
      author: '',
      dateFrom: '',
      dateTo: '',
      level: '',
      skills: ''
    })
    setSearchTerm('')
  }

  const handleCreateCourse = () => {
    if (!selectedTrack) return
    const course = { id: Date.now(), ...newCourse, lessons: [] }
    const updated = tracks.map(t => t.id === selectedTrack.id ? { ...t, courses: [...t.courses, course] } : t)
    setTracks(updated)
    setSelectedTrack({ ...selectedTrack, courses: [...selectedTrack.courses, course] })
    setSelectedCourse(course)
    setNewCourse({ name: '', description: '' })
    setShowCourseDialog(false)
  }

  const handleCreateLesson = () => {
    if (!selectedCourse) return
    const lesson = { id: Date.now(), ...newLesson, sections: [] }
    const updated = tracks.map(t => t.id === selectedTrack.id ? { ...t, courses: t.courses.map(c => c.id === selectedCourse.id ? { ...c, lessons: [...c.lessons, lesson] } : c) } : t)
    setTracks(updated)
    setSelectedLesson(lesson)
    setNewLesson({ name: '', description: '', duration: '' })
    setShowLessonDialog(false)
  }

  const handleCreateSection = () => {
    if (!selectedLesson) return
    const section = { id: Date.now(), ...newSection }
    const updated = tracks.map(t => t.id === selectedTrack.id ? { ...t, courses: t.courses.map(c => c.id === selectedCourse.id ? { ...c, lessons: c.lessons.map(l => l.id === selectedLesson.id ? { ...l, sections: [...l.sections, section] } : l) } : c) } : t)
    setTracks(updated)
    setNewSection({ name: '', type: 'video', duration: '', file: null })
    setShowSectionDialog(false)
  }

  const handleDeleteCourse = (courseId: number) => {
    if (!selectedTrack) return
    const updated = tracks.map(t => t.id === selectedTrack.id ? { ...t, courses: t.courses.filter(c => c.id !== courseId) } : t)
    setTracks(updated)
    setSelectedTrack({ ...selectedTrack, courses: selectedTrack.courses.filter((c: any) => c.id !== courseId) })
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null)
      setSelectedLesson(null)
    }
  }

  const handleDeleteLesson = (lessonId: number) => {
    if (!selectedTrack || !selectedCourse) return
    const updated = tracks.map(t => t.id === selectedTrack.id ? { ...t, courses: t.courses.map(c => c.id === selectedCourse.id ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c) } : t)
    setTracks(updated)
    const updatedCourse = { ...selectedCourse, lessons: selectedCourse.lessons.filter((l: any) => l.id !== lessonId) }
    setSelectedCourse(updatedCourse)
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson(null)
    }
  }

  const handleDeleteSection = (sectionId: number) => {
    if (!selectedTrack || !selectedCourse || !selectedLesson) return
    const updated = tracks.map(t => t.id === selectedTrack.id ? { ...t, courses: t.courses.map(c => c.id === selectedCourse.id ? { ...c, lessons: c.lessons.map(l => l.id === selectedLesson.id ? { ...l, sections: l.sections.filter(s => s.id !== sectionId) } : l) } : c) } : t)
    setTracks(updated)
    const updatedLesson = { ...selectedLesson, sections: selectedLesson.sections.filter((s: any) => s.id !== sectionId) }
    setSelectedLesson(updatedLesson)
  }

  const toggleTrackStatus = (track: any) => {
    handleStatusChange(track)
  }

  const toggleLessonExpansion = (lessonId: number) => {
    const copy = new Set(expandedLessons)
    if (copy.has(lessonId)) copy.delete(lessonId); else copy.add(lessonId)
    setExpandedLessons(copy)
  }

  // Drag & drop handlers for lessons and sections
  const onDragStart = (e: React.DragEvent, payload: object) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    // show move cursor
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleLessonDrop = (e: React.DragEvent, targetLessonId: number | null) => {
    e.preventDefault()
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.kind !== 'lesson') return
      if (!selectedTrack || !selectedCourse) return

      const lessons = [...selectedCourse.lessons]
      const fromIndex = lessons.findIndex((l: any) => l.id === data.id)
      if (fromIndex === -1) return

      // remove
      const [moved] = lessons.splice(fromIndex, 1)

      // compute toIndex: if targetLessonId is null => append
      const toIndex = targetLessonId == null ? lessons.length : Math.max(0, lessons.findIndex((l: any) => l.id === targetLessonId))
      lessons.splice(toIndex, 0, moved)

      const updatedTracks = tracks.map(t => {
        if (t.id !== selectedTrack.id) return t
        return {
          ...t,
          courses: t.courses.map((c: any) => c.id === selectedCourse.id ? { ...c, lessons } : c)
        }
      })

      setTracks(updatedTracks)
      setSelectedCourse({ ...selectedCourse, lessons })
    } catch (err) {
      // ignore malformed data
    }
  }

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: number | null) => {
    e.preventDefault()
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.kind !== 'section') return
      if (!selectedTrack || !selectedCourse || !selectedLesson) return

      const lessons = selectedCourse.lessons.map((lesson: any) => {
        if (lesson.id !== selectedLesson.id) return lesson
        const sections = [...lesson.sections]
        const fromIndex = sections.findIndex((s: any) => s.id === data.id)
        if (fromIndex === -1) return lesson
        const [moved] = sections.splice(fromIndex, 1)
        const toIndex = targetSectionId == null ? sections.length : Math.max(0, sections.findIndex((s: any) => s.id === targetSectionId))
        sections.splice(toIndex, 0, moved)
        return { ...lesson, sections }
      })

      const updatedTracks = tracks.map(t => {
        if (t.id !== selectedTrack.id) return t
        return {
          ...t,
          courses: t.courses.map((c: any) => c.id === selectedCourse.id ? { ...c, lessons } : c)
        }
      })

      setTracks(updatedTracks)
      // update selectedLesson reference
      const updatedLesson = lessons.find((l: any) => l.id === selectedLesson.id)
      setSelectedLesson(updatedLesson)
      setSelectedCourse({ ...selectedCourse, lessons })
    } catch (err) {
      // ignore
    }
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'mindmap': return <Brain className="w-4 h-4" />
      case 'exercise': return <Edit className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (!selectedTrack) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminMenu />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
               <div>
            <h1 className="text-2xl font-bold">Quản lý Khóa học</h1>
            <p className="text-gray-600">Tạo, sửa và xóa khóa học cho hệ thống TOEIC</p>
          </div>
              <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo Khóa học
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Tạo Khóa học mới</DialogTitle>
                    <DialogDescription>Thêm khóa học TOEIC mới vào hệ thống (tên, mô tả, danh mục)</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="track-name">Tên Khóa học</Label>
                      <Input id="track-name" value={newTrack.name} onChange={(e:any) => setNewTrack({...newTrack, name: e.target.value})} placeholder="Ví dụ: TOEIC Listening Mastery" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="track-description">Mô tả khóa học</Label>
                      <Textarea id="track-description" value={newTrack.description} onChange={(e:any) => setNewTrack({...newTrack, description: e.target.value})} placeholder="Tóm tắt nội dung và mục tiêu khóa học" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="track-skills">Kỹ năng</Label>
                      <Select value={newTrack.skills} onValueChange={(value:any) => setNewTrack({...newTrack, skills: value, level: ''})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kỹ năng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LR">2 kỹ năng LR (Listening & Reading)</SelectItem>
                          <SelectItem value="WS">2 kỹ năng WS (Writing & Speaking)</SelectItem>
                          <SelectItem value="LRWS">4 kỹ năng (Listening, Reading, Writing & Speaking)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newTrack.skills && (
                      <div className="grid gap-2">
                        <Label htmlFor="track-level">Chặng học</Label>
                        <Select value={newTrack.level} onValueChange={(value:any) => setNewTrack({...newTrack, level: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chặng học" />
                          </SelectTrigger>
                          <SelectContent>
                            {newTrack.skills === 'LR' && (
                              <>
                                <SelectItem value="lr-basic">LR căn bản 450+</SelectItem>
                                <SelectItem value="lr-intermediate">LR trung cấp 550+</SelectItem>
                                <SelectItem value="lr-advanced">LR chuyên sâu 800+</SelectItem>
                              </>
                            )}
                            {newTrack.skills === 'WS' && (
                              <>
                                <SelectItem value="ws-basic">WS căn bản 100+</SelectItem>
                                <SelectItem value="ws-intermediate">WS trung cấp 200+</SelectItem>
                                <SelectItem value="ws-advanced">WS chuyên sâu 300+</SelectItem>
                              </>
                            )}
                            {newTrack.skills === 'LRWS' && (
                              <>
                                <SelectItem value="lrws-basic">Căn bản (LR 450+ & WS 100+)</SelectItem>
                                <SelectItem value="lrws-intermediate">Trung cấp (LR 550+ & WS 200+)</SelectItem>
                                <SelectItem value="lrws-advanced">Chuyên sâu (LR 800+ & WS 300+)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="track-author">Tác giả</Label>
                      <Input 
                        id="track-author" 
                        value={newTrack.author} 
                        onChange={(e:any) => setNewTrack({...newTrack, author: e.target.value})} 
                        placeholder="Tên tác giả (để trống sẽ mặc định là Admin)" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="track-category">Danh mục</Label>
                      <Select value={newTrack.category} onValueChange={(value:any) => setNewTrack({...newTrack, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listening">Luyện nghe</SelectItem>
                          <SelectItem value="reading">Luyện đọc</SelectItem>
                          <SelectItem value="writing">Luyện viết</SelectItem>
                          <SelectItem value="speaking">Luyện nói</SelectItem>
                          <SelectItem value="vocabulary">Từ vựng & Ngữ pháp</SelectItem>
                          <SelectItem value="full-test">Full Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTrackDialog(false)}>Hủy</Button>
                    <Button onClick={handleCreateTrack} disabled={!newTrack.name || !newTrack.skills || !newTrack.level}>Tạo Khóa học</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search bar and Advanced Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm khóa học theo tên, mô tả hoặc danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                >
                  <Filter className="w-4 h-4" />
                  Lọc nâng cao
                  {(filters.author || filters.dateFrom || filters.dateTo || (filters.level && filters.level !== 'all') || (filters.skills && filters.skills !== 'all')) && (
                    <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                      Có lọc
                    </Badge>
                  )}
                </Button>
              </div>
              
              {/* Advanced Filter Panel */}
              {showAdvancedFilter && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="filter-author">Tác giả</Label>
                      <Input
                        id="filter-author"
                        placeholder="Nhập tên tác giả..."
                        value={filters.author}
                        onChange={(e) => setFilters({...filters, author: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="filter-skills">Kỹ năng</Label>
                      <Select value={filters.skills} onValueChange={(value) => setFilters({...filters, skills: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn kỹ năng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả kỹ năng</SelectItem>
                          <SelectItem value="LR">2 kỹ năng LR</SelectItem>
                          <SelectItem value="WS">2 kỹ năng WS</SelectItem>
                          <SelectItem value="LRWS">4 kỹ năng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="filter-level">Chặng học</Label>
                      <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chặng học" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả chặng</SelectItem>
                          <SelectItem value="lr-basic">LR căn bản 450+</SelectItem>
                          <SelectItem value="lr-intermediate">LR trung cấp 550+</SelectItem>
                          <SelectItem value="lr-advanced">LR chuyên sâu 800+</SelectItem>
                          <SelectItem value="ws-basic">WS căn bản 100+</SelectItem>
                          <SelectItem value="ws-intermediate">WS trung cấp 200+</SelectItem>
                          <SelectItem value="ws-advanced">WS chuyên sâu 300+</SelectItem>
                          <SelectItem value="lrws-basic">Căn bản (LR 450+ & WS 100+)</SelectItem>
                          <SelectItem value="lrws-intermediate">Trung cấp (LR 550+ & WS 200+)</SelectItem>
                          <SelectItem value="lrws-advanced">Chuyên sâu (LR 800+ & WS 300+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="filter-date-from">Từ ngày</Label>
                      <Input
                        id="filter-date-from"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="filter-date-to">Đến ngày</Label>
                      <Input
                        id="filter-date-to"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        Xóa bộ lọc
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Hoạt động</TabsTrigger>
                <TabsTrigger value="pending">Chưa xuất bản</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTracks.filter(track => track.status === 'active').map(track => (
                    <Card key={track.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2" onClick={() => setSelectedTrack(track)}>
                            <BookOpen className="w-5 h-5" />
                            {track.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đang hoạt động
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrackStatus(track);
                              }}
                              title="Chuyển thành chưa xuất bản"
                            >
                              <ToggleLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrack(track);
                              }}
                              title="Xóa khóa học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription onClick={() => setSelectedTrack(track)}>{track.description}</CardDescription>
                      </CardHeader>
                      <CardContent onClick={() => setSelectedTrack(track)}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getSkillsDisplayName(track.skills)}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {getLevelDisplayName(track.level)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{track.courses.length} modules</span>
                            <span>{track.courses.reduce((acc:any, course:any) => acc + course.lessons.length, 0)} bài học</span>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{track.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(track.createdDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTracks.filter(track => track.status === 'pending').map(track => (
                    <Card key={track.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2" onClick={() => setSelectedTrack(track)}>
                            <BookOpen className="w-5 h-5" />
                            {track.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Chưa xuất bản
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTrackStatus(track);
                              }}
                              title="Chuyển thành hoạt động"
                            >
                              <ToggleRight className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrack(track);
                              }}
                              title="Xóa khóa học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription onClick={() => setSelectedTrack(track)}>{track.description}</CardDescription>
                      </CardHeader>
                      <CardContent onClick={() => setSelectedTrack(track)}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getSkillsDisplayName(track.skills)}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {getLevelDisplayName(track.level)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{track.courses.length} courses</span>
                            <span>{track.courses.reduce((acc:any, course:any) => acc + course.lessons.length, 0)} lessons</span>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{track.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(track.createdDate).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Approval buttons for non-admin courses */}
                          {track.author && track.author.toLowerCase() !== 'admin' && (
                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveCourse(track);
                                  }}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectCourse(track);
                                  }}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Từ chối
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Xác nhận xóa khóa học
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Bạn có chắc chắn muốn xóa khóa học <strong>"{trackToDelete?.name}"</strong> không?
                    <br />
                    <span className="text-red-600 text-sm mt-2 block">
                      ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến khóa học này sẽ bị xóa vĩnh viễn.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Hủy
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteTrack}>
                    Xóa khóa học
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    Xác nhận duyệt khóa học
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Bạn có chắc chắn muốn duyệt khóa học <strong>"{trackToApprove?.name}"</strong> không?
                    <br />
                    <span className="text-green-600 text-sm mt-2 block">
                      ✓ Khóa học này sẽ được chuyển sang trạng thái "Hoạt động" và có thể được truy cập bởi học viên.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={confirmApproveCourse} className="bg-green-600 hover:bg-green-700">
                    Duyệt khóa học
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <X className="w-5 h-5" />
                    Xác nhận từ chối khóa học
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Bạn có chắc chắn muốn từ chối khóa học <strong>"{trackToReject?.name}"</strong> không?
                    <br />
                    <span className="text-red-600 text-sm mt-2 block">
                      ⚠️ Khóa học này sẽ bị từ chối và không thể được truy cập bởi học viên.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                    Hủy
                  </Button>
                  <Button variant="destructive" onClick={confirmRejectCourse}>
                    Từ chối khóa học
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Status Change Confirmation Dialog */}
            <Dialog open={showStatusChangeDialog} onOpenChange={setShowStatusChangeDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-blue-600">
                    <ToggleLeft className="w-5 h-5" />
                    Xác nhận thay đổi trạng thái
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Bạn có chắc chắn muốn thay đổi trạng thái của khóa học <strong>"{trackToChangeStatus?.name}"</strong> từ{" "}
                    <span className={`font-semibold ${trackToChangeStatus?.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {trackToChangeStatus?.isActive ? 'Hoạt động' : 'Chưa xuất bản'}
                    </span>{" "}
                    sang{" "}
                    <span className={`font-semibold ${!trackToChangeStatus?.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {!trackToChangeStatus?.isActive ? 'Hoạt động' : 'Chưa xuất bản'}
                    </span>?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowStatusChangeDialog(false)}>
                    Hủy
                  </Button>
                  <Button onClick={confirmStatusChange} className="bg-blue-600 hover:bg-blue-700">
                    Xác nhận thay đổi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 flex h-screen">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="p-0 h-auto font-semibold text-lg">← {selectedTrack.name}</Button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedTrack.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getSkillsDisplayName(selectedTrack.skills)}
              </Badge>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                {getLevelDisplayName(selectedTrack.level)}
              </Badge>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Courses</h3>
                <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Add Course</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>

                      <DialogTitle>Tạo Course mới</DialogTitle>
                      <DialogDescription>Thêm course mới vào khóa học {selectedTrack.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="course-name">Tên Course</Label>
                        <Input 
                          id="course-name" 
                          value={newCourse.name} 
                          onChange={(e:any) => setNewCourse({...newCourse, name: e.target.value})} 
                          placeholder="Ví dụ: Part 1: Photographs" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="course-description">Mô tả</Label>
                        <Textarea 
                          id="course-description" 
                          value={newCourse.description} 
                          onChange={(e:any) => setNewCourse({...newCourse, description: e.target.value})} 
                          placeholder="Mô tả nội dung course..." 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setShowCourseDialog(false);
                        setNewCourse({ name: '', description: '' });
                      }}>Hủy</Button>
                      <Button onClick={handleCreateCourse} disabled={!newCourse.name}>Tạo Course</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {selectedTrack.courses.length > 0 ? (
                  selectedTrack.courses.map((course:any) => (
                    <div key={course.id} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedCourse?.id === course.id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2" onClick={() => { setSelectedCourse(course); setSelectedLesson(null); }}>
                          <FolderOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm">{course.name}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{course.lessons.length} lessons</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Chưa có course nào</p>
                    <p className="text-xs text-gray-400">Hãy tạo course đầu tiên</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex">
          <div className="flex-1 bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedCourse ? selectedCourse.name : 'Chọn một course'}</h2>
                {selectedCourse && (
                  <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" />Tạo Lesson</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tạo Lesson mới</DialogTitle>
                        <DialogDescription>Thêm lesson mới vào course {selectedCourse.name}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="lesson-name">Tên Lesson</Label>
                          <Input id="lesson-name" value={newLesson.name} onChange={(e:any) => setNewLesson({...newLesson, name: e.target.value})} placeholder="Ví dụ: HTML Fundamentals" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lesson-description">Mô tả</Label>
                          <Textarea id="lesson-description" value={newLesson.description} onChange={(e:any) => setNewLesson({...newLesson, description: e.target.value})} placeholder="Mô tả nội dung lesson..." />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lesson-duration">Thời lượng ước tính</Label>
                          <Input id="lesson-duration" value={newLesson.duration} onChange={(e:any) => setNewLesson({...newLesson, duration: e.target.value})} placeholder="Ví dụ: 45 phút" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setShowLessonDialog(false);
                          setNewLesson({ name: '', description: '', duration: '' });
                        }}>Hủy</Button>
                        <Button onClick={handleCreateLesson} disabled={!newLesson.name}>Tạo Lesson</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4">
                {selectedCourse ? (
                  <div className="space-y-3">
                    {selectedCourse.lessons.map((lesson:any) => (
                      <div key={lesson.id} className="border border-gray-200 rounded-lg" onDragOver={onDragOver} onDrop={(e) => handleLessonDrop(e, lesson.id)}>
                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, { kind: 'lesson', id: lesson.id })}
                          className={`p-4 cursor-pointer transition-colors ${selectedLesson?.id === lesson.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          onClick={() => { setSelectedLesson(lesson); toggleLessonExpansion(lesson.id); }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {expandedLessons.has(lesson.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              <span className="font-medium">{lesson.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{lesson.sections.length} sections</Badge>
                              <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLesson(lesson.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                              {expandedLessons.has(lesson.id) && (
                          <div className="px-4 pb-4">
                            <div className="pl-6 space-y-2">
                              {lesson.sections.map((section:any) => (
                                <div
                                  key={section.id}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                                  draggable
                                  onDragStart={(e) => onDragStart(e, { kind: 'section', id: section.id })}
                                  onDragOver={onDragOver}
                                  onDrop={(e) => handleSectionDrop(e, section.id)}
                                >
                                  {getSectionIcon(section.type)}
                                  <span className="text-sm">{section.name}</span>
                                  <span className="text-xs text-gray-500 ml-auto">{section.duration}</span>
                                </div>
                              ))}
                              {/* drop target to append at end */}
                              <div className="h-6" onDragOver={onDragOver} onDrop={(e) => handleSectionDrop(e, null)} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Chọn một course để xem danh sách lessons</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="w-80 bg-white">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{selectedLesson ? `Sections - ${selectedLesson.name}` : 'Sections'}</h3>
                {selectedLesson && (
                  <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tạo Section mới</DialogTitle>
                        <DialogDescription>Thêm section vào lesson {selectedLesson.name}</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="section-name">Tên Section</Label>
                          <Input id="section-name" value={newSection.name} onChange={(e:any) => setNewSection({...newSection, name: e.target.value})} placeholder="Ví dụ: Introduction to HTML" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="section-type">Loại nội dung</Label>
                          <Select value={newSection.type} onValueChange={(value:any) => setNewSection({...newSection, type: value})}>
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
                          <Input id="section-duration" value={newSection.duration} onChange={(e:any) => setNewSection({...newSection, duration: e.target.value})} placeholder="Ví dụ: 15 min" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="section-file">Upload tài liệu</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600">Kéo thả file hoặc click để chọn</p>
                            <p className="text-xs text-gray-500 mt-1">Video, PDF, Images, Mind Maps</p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setShowSectionDialog(false);
                          setNewSection({ name: '', type: 'video', duration: '', file: null });
                        }}>Hủy</Button>
                        <Button onClick={handleCreateSection} disabled={!newSection.name}>Tạo Section</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4">
                {selectedLesson ? (
                  <div className="space-y-3">
                    {selectedLesson.sections.map((section:any) => (
                      <Card key={section.id} className="p-3">
                        <div className="flex items-start gap-3">
                          {getSectionIcon(section.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{section.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{section.duration}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">{section.type}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Edit className="w-3 h-3" /></Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(section.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">Chọn một lesson để xem sections</p>
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
