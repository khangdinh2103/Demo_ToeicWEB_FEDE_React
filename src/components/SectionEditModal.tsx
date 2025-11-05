import { useState, useRef } from 'react'
import { X, Upload, Trash2, GripVertical, Volume2, Image as ImageIcon, FileText, Play, Pause } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Choice = { 
  id: number
  text: string
  isCorrect?: boolean
  explanation?: string
}

type Section = { 
  id: number
  kind: string
  title: string
  partName?: string
  src?: string
  choices?: Choice[]
  explanation?: string
  audioFile?: File | null
  imageFile?: File | null
}

interface SectionEditModalProps {
  section: Section
  isOpen: boolean
  onClose: () => void
  onSave: (section: Section) => void
}

interface SortableChoiceProps {
  choice: Choice
  index: number
  onUpdate: (choice: Choice) => void
  onDelete: (id: number) => void
}

function SortableChoice({ choice, index, onUpdate, onDelete }: SortableChoiceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: choice.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className="p-3 border-l-4 border-l-blue-200">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Lựa chọn {String.fromCharCode(65 + index)}:</Label>
              <input
                type="checkbox"
                checked={choice.isCorrect || false}
                onChange={(e) => onUpdate({ ...choice, isCorrect: e.target.checked })}
                className="w-4 h-4"
              />
              <Label className="text-sm text-green-600">Đáp án đúng</Label>
            </div>
            
            <Textarea
              value={choice.text}
              onChange={(e) => onUpdate({ ...choice, text: e.target.value })}
              placeholder="Nhập nội dung lựa chọn..."
              className="min-h-16"
            />
            
            <Textarea
              value={choice.explanation || ''}
              onChange={(e) => onUpdate({ ...choice, explanation: e.target.value })}
              placeholder="Giải thích cho lựa chọn này (tùy chọn)..."
              className="min-h-12 text-sm"
            />
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(choice.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function SectionEditModal({ section, isOpen, onClose, onSave }: SectionEditModalProps) {
  const [editedSection, setEditedSection] = useState<Section>({ ...section })
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const imageFileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!isOpen) return null

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const choices = editedSection.choices || []
      const oldIndex = choices.findIndex(choice => choice.id === active.id)
      const newIndex = choices.findIndex(choice => choice.id === over?.id)

      const newChoices = arrayMove(choices, oldIndex, newIndex)
      setEditedSection({ ...editedSection, choices: newChoices })
    }
  }

  const addChoice = () => {
    const newChoice: Choice = {
      id: Date.now(),
      text: '',
      isCorrect: false,
      explanation: ''
    }
    setEditedSection({
      ...editedSection,
      choices: [...(editedSection.choices || []), newChoice]
    })
  }

  const updateChoice = (updatedChoice: Choice) => {
    setEditedSection({
      ...editedSection,
      choices: (editedSection.choices || []).map(choice =>
        choice.id === updatedChoice.id ? updatedChoice : choice
      )
    })
  }

  const deleteChoice = (choiceId: number) => {
    setEditedSection({
      ...editedSection,
      choices: (editedSection.choices || []).filter(choice => choice.id !== choiceId)
    })
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const audioUrl = URL.createObjectURL(file)
      setEditedSection({
        ...editedSection,
        audioFile: file,
        src: audioUrl
      })
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setEditedSection({
        ...editedSection,
        imageFile: file,
        src: imageUrl
      })
    }
  }

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSave = () => {
    onSave(editedSection)
    onClose()
  }

  const getSectionIcon = () => {
    switch (editedSection.kind) {
      case 'audio':
        return <Volume2 className="w-5 h-5 text-blue-500" />
      case 'image':
        return <ImageIcon className="w-5 h-5 text-green-500" />
      case 'reading':
        return <FileText className="w-5 h-5 text-purple-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getSectionIcon()}
            <h2 className="text-xl font-semibold">Chỉnh sửa Section</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {editedSection.kind}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề câu hỏi</Label>
              <Input
                id="title"
                value={editedSection.title}
                onChange={(e) => setEditedSection({ ...editedSection, title: e.target.value })}
                placeholder="Nhập tiêu đề câu hỏi..."
              />
            </div>

            <div>
              <Label htmlFor="kind">Loại Section</Label>
              <Select value={editedSection.kind} onValueChange={(value) => setEditedSection({ ...editedSection, kind: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audio">Audio / Listening</SelectItem>
                  <SelectItem value="image">Image / Picture</SelectItem>
                  <SelectItem value="reading">Reading / Text</SelectItem>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="partName">Tên phần</Label>
              <Input
                id="partName"
                value={editedSection.partName || ''}
                onChange={(e) => setEditedSection({ ...editedSection, partName: e.target.value })}
                placeholder="Ví dụ: Part 1, Part 2, Listening Comprehension..."
              />
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Media Files</h3>
            
            {(editedSection.kind === 'audio' || editedSection.kind === 'mcq') && (
              <Card className="p-4">
                <Label className="block mb-2">Audio File</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => audioFileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Audio
                  </Button>
                  
                  {editedSection.src && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleAudioPlayback}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <span className="text-sm text-gray-600">Audio đã tải lên</span>
                    </div>
                  )}
                </div>
                
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                
                {editedSection.src && (
                  <audio
                    ref={audioRef}
                    src={editedSection.src}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                )}
              </Card>
            )}

            {(editedSection.kind === 'image' || editedSection.kind === 'mcq') && (
              <Card className="p-4">
                <Label className="block mb-2">Image File</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageFileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  
                  {editedSection.src && editedSection.kind === 'image' && (
                    <span className="text-sm text-gray-600">Hình ảnh đã tải lên</span>
                  )}
                </div>
                
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {editedSection.src && editedSection.kind === 'image' && (
                  <div className="mt-3">
                    <img
                      src={editedSection.src}
                      alt="Preview"
                      className="max-w-full h-48 object-contain border rounded"
                    />
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Choices Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Lựa chọn trả lời</h3>
              <Button onClick={addChoice} variant="outline" size="sm">
                + Thêm lựa chọn
              </Button>
            </div>

            {editedSection.choices && editedSection.choices.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={editedSection.choices.map(choice => choice.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {editedSection.choices.map((choice, index) => (
                      <SortableChoice
                        key={choice.id}
                        choice={choice}
                        index={index}
                        onUpdate={updateChoice}
                        onDelete={deleteChoice}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>Chưa có lựa chọn nào</p>
                <Button onClick={addChoice} variant="outline" size="sm" className="mt-2">
                  Thêm lựa chọn đầu tiên
                </Button>
              </div>
            )}
          </div>

          {/* Explanation */}
          <div>
            <Label htmlFor="explanation">Giải thích chung</Label>
            <Textarea
              id="explanation"
              value={editedSection.explanation || ''}
              onChange={(e) => setEditedSection({ ...editedSection, explanation: e.target.value })}
              placeholder="Giải thích chung cho câu hỏi này..."
              className="min-h-20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  )
}
