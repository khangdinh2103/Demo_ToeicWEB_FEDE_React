import { useState } from 'react'
import { Plus, BookOpen, Clock, CheckCircle, FolderOpen, FileText, Video, Brain, Upload, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ScrollArea } from '../components/ui/scroll-area'
import AdminMenu from '../components/AdminMenu'

// Sample data tailored for a TOEIC learning site (friendly labels)
const initialTracks = [
  {
    id: 1,
    name: 'TOEIC Listening Mastery',
    description: 'Lộ trình luyện nghe từ cơ bản tới nâng cao, bao gồm bài tập Part 1-4 và bài thi mô phỏng',
    status: 'active',
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
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [newTrack, setNewTrack] = useState({ name: '', description: '', category: '' })
  const [newLesson, setNewLesson] = useState({ name: '', description: '', duration: '' })
  const [newSection, setNewSection] = useState({ name: '', type: 'video', duration: '', file: null })

  const handleCreateTrack = () => {
    const track = { id: tracks.length + 1, ...newTrack, status: 'active', courses: [] }
    setTracks([...tracks, track])
    setSelectedTrack(track)
    setNewTrack({ name: '', description: '', category: '' })
    setShowTrackDialog(false)
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
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminMenu />
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin - Quản trị TOEIC</h1>
              <p className="text-gray-600 mt-2">Quản lý khóa học, bài học và nội dung dành cho người học TOEIC</p>
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
                    <Label htmlFor="track-category">Danh mục</Label>
                    <Select value={newTrack.category} onValueChange={(value:any) => setNewTrack({...newTrack, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listening">Luyện nghe</SelectItem>
                        <SelectItem value="reading">Luyện đọc</SelectItem>
                        <SelectItem value="vocabulary">Từ vựng & Ngữ pháp</SelectItem>
                        <SelectItem value="full-test">Full Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTrackDialog(false)}>Hủy</Button>
                  <Button onClick={handleCreateTrack}>Tạo Khóa học</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Hoạt động</TabsTrigger>
              <TabsTrigger value="pending">Chưa xuất bản</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tracks.filter(track => track.status === 'active').map(track => (
                  <Card key={track.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTrack(track)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          {track.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đang hoạt động
                        </Badge>
                      </div>
                      <CardDescription>{track.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{track.courses.length} modules</span>
                        <span>{track.courses.reduce((acc:any, course:any) => acc + course.lessons.length, 0)} bài học</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tracks.filter(track => track.status === 'pending').map(track => (
                  <Card key={track.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTrack(track)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          {track.name}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Chưa xuất bản
                        </Badge>
                      </div>
                      <CardDescription>{track.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{track.courses.length} courses</span>
                        <span>{track.courses.reduce((acc:any, course:any) => acc + course.lessons.length, 0)} lessons</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={() => setSelectedTrack(null)} className="p-0 h-auto font-semibold text-lg">← {selectedTrack.name}</Button>
            </div>
            <p className="text-sm text-gray-600">{selectedTrack.description}</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Courses</h3>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Add Course</Button>
              </div>

              <div className="space-y-2">
                {selectedTrack.courses.map((course:any) => (
                  <div key={course.id} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedCourse?.id === course.id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50'}`} onClick={() => { setSelectedCourse(course); setSelectedLesson(null); }}>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">{course.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{course.lessons.length} lessons</p>
                  </div>
                ))}
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
                        <Button variant="outline" onClick={() => setShowLessonDialog(false)}>Hủy</Button>
                        <Button onClick={handleCreateLesson}>Tạo Lesson</Button>
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
                              <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4" /></Button>
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
                        <Button variant="outline" onClick={() => setShowSectionDialog(false)}>Hủy</Button>
                        <Button onClick={handleCreateSection}>Tạo Section</Button>
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
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><Trash2 className="w-3 h-3" /></Button>
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
