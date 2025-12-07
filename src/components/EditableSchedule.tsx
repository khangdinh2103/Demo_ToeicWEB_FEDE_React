import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, Edit2, Check, X, Calendar as CalendarIcon, GripVertical } from "lucide-react"

interface Section {
  _id: string
  title: string
  duration: number
}

interface ScheduleSession {
  roadmapId: string
  roadmapName: string
  color: any
  sessions: Section[]
  totalMinutes: number
  date: Date
}

interface EditableScheduleProps {
  schedule: ScheduleSession[]
  onSave: (updatedSchedule: ScheduleSession[]) => void
  onCancel: () => void
}

export default function EditableSchedule({ schedule, onSave, onCancel }: EditableScheduleProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedSchedule, setEditedSchedule] = useState<ScheduleSession[]>(schedule)
  const [newDate, setNewDate] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleEditDate = (index: number, dateString: string) => {
    const updated = [...editedSchedule]
    updated[index] = {
      ...updated[index],
      date: new Date(dateString)
    }
    setEditedSchedule(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return
    
    const updated = [...editedSchedule]
    const [draggedItem] = updated.splice(draggedIndex, 1)
    updated.splice(dropIndex, 0, draggedItem)
    
    setEditedSchedule(updated)
    setDraggedIndex(null)
  }

  const handleRemoveSession = (index: number) => {
    const updated = editedSchedule.filter((_, i) => i !== index)
    setEditedSchedule(updated)
  }

  const handleSave = () => {
    onSave(editedSchedule)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
        <div>
          <h3 className="text-lg font-bold text-blue-900">Chỉnh sửa lịch trình học</h3>
          <p className="text-sm text-blue-700">Kéo thả để sắp xếp lại thứ tự, thay đổi ngày hoặc xóa buổi học</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            Lưu thay đổi
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {editedSchedule.map((session, index) => (
          <Card 
            key={index} 
            className={`${session.color.bg} border-2 ${session.color.border} ${draggedIndex === index ? 'opacity-50' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Drag Handle */}
                <div className="cursor-move">
                  <GripVertical className="h-6 w-6 text-gray-400" />
                </div>

                {/* Session Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${session.color.dot} text-white`}>
                      Ngày {index + 1}
                    </Badge>
                    <span className={`font-bold ${session.color.text}`}>
                      {session.roadmapName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <Input
                          type="date"
                          value={newDate || session.date.toISOString().split('T')[0]}
                          onChange={(e) => {
                            setNewDate(e.target.value)
                            handleEditDate(index, e.target.value)
                          }}
                          className="w-auto"
                        />
                        <Button
                          size="sm"
                          onClick={() => setEditingIndex(null)}
                          className="bg-green-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(session.date)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingIndex(index)
                            setNewDate(session.date.toISOString().split('T')[0])
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Sections List */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {session.sessions.length} sections • {formatTime(session.totalMinutes)}
                      </span>
                    </div>
                    
                    <div className="pl-6 space-y-1">
                      {session.sessions.map((section: Section, sIdx: number) => (
                        <div key={sIdx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-6 text-gray-400">{sIdx + 1}.</span>
                          <span className="flex-1">{section.title}</span>
                          <span className="text-gray-500">{Math.round(section.duration)}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveSession(index)}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Tổng số ngày học</p>
              <p className="text-2xl font-bold text-purple-900">{editedSchedule.length} ngày</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng thời gian</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatTime(editedSchedule.reduce((sum, s) => sum + s.totalMinutes, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dự kiến hoàn thành</p>
              <p className="text-lg font-bold text-purple-900">
                {editedSchedule.length > 0 
                  ? new Date(editedSchedule[editedSchedule.length - 1].date).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

