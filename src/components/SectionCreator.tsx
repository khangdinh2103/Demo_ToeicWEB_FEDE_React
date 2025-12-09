import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Trash2 } from 'lucide-react'

type Choice = { id: number; text: string; isCorrect?: boolean; explanation?: string; media?: string }
type Section = {
  id: number
  kind: 'audio' | 'image' | 'mcq' | 'mcq_audio' | 'mcq_image'
  title: string
  partName?: string
  src?: string
  choices?: Choice[]
  correctAnswer?: string
  explanation?: string
}

export default function SectionCreator({ onAdd }: { onAdd: (s: Section) => void }) {
  const [kind, setKind] = useState<Section['kind']>('mcq')
  const [title, setTitle] = useState('')
  const [partName, setPartName] = useState('')
  const [src, setSrc] = useState('')
  const [choices, setChoices] = useState<Choice[]>([])
  const [explanation, setExplanation] = useState('')

  const addChoice = () => setChoices([...choices, { id: Date.now() + Math.random(), text: '', isCorrect: false, explanation: '' }])
  const updateChoice = (id: number, patch: Partial<Choice>) => setChoices(choices.map(c => c.id === id ? { ...c, ...patch } : c))
  const removeChoice = (id: number) => setChoices(choices.filter(c => c.id !== id))

  const submit = () => {
    const sec: Section = { 
      id: Date.now(), 
      kind, 
      title: title || `${kind} section`,
      partName: partName || undefined,
      src: src || undefined, 
      choices: choices.length ? choices : undefined,
      explanation: explanation || undefined
    }
    onAdd(sec)
    setKind('mcq')
    setTitle('')
    setPartName('')
    setSrc('')
    setChoices([])
    setExplanation('')
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Thêm Section Mới</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Loại Section</label>
          <select value={kind} onChange={(e) => setKind(e.target.value as Section['kind'])} className="w-full p-2 border rounded-md">
            <option value="audio">Audio (độc lập)</option>
            <option value="image">Image (độc lập)</option>
            <option value="mcq">MCQ (Trắc nghiệm)</option>
            <option value="mcq_audio">MCQ + Audio</option>
            <option value="mcq_image">MCQ + Image</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên Part</label>
          <input 
            className="w-full p-2 border rounded-md" 
            placeholder="VD: Part 1, Part 2..." 
            value={partName} 
            onChange={(e) => setPartName(e.target.value)} 
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Tiêu đề Section</label>
        <input 
          className="w-full p-2 border rounded-md" 
          placeholder="Nhập tiêu đề cho section này" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
      </div>

      {(kind === 'audio' || kind === 'mcq_audio') && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Audio URL</label>
          <input 
            className="w-full p-2 border rounded-md" 
            placeholder="Nhập URL file audio" 
            value={src} 
            onChange={(e) => setSrc(e.target.value)} 
          />
        </div>
      )}
      
      {(kind === 'image' || kind === 'mcq_image') && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input 
            className="w-full p-2 border rounded-md" 
            placeholder="Nhập URL hình ảnh" 
            value={src} 
            onChange={(e) => setSrc(e.target.value)} 
          />
        </div>
      )}

      {(kind.startsWith('mcq')) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Các lựa chọn (A, B, C, D)</label>
            <Button type="button" variant="outline" size="sm" onClick={addChoice}>
              Thêm lựa chọn
            </Button>
          </div>
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div key={choice.id} className="p-3 border rounded-md bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input 
                    className="flex-1 p-2 border rounded-md" 
                    value={choice.text} 
                    onChange={(e) => updateChoice(choice.id, { text: e.target.value })} 
                    placeholder={`Nội dung lựa chọn ${String.fromCharCode(65 + index)}`} 
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input 
                      type="radio" 
                      name="correct" 
                      checked={!!choice.isCorrect} 
                      onChange={() => setChoices(choices.map(x => ({ ...x, isCorrect: x.id === choice.id })))} 
                    />
                    <span className="text-green-600 font-medium">Đáp án đúng</span>
                  </label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeChoice(choice.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Giải thích cho lựa chọn này:</label>
                  <textarea 
                    className="w-full p-2 border rounded-md text-sm" 
                    rows={2}
                    value={choice.explanation || ''} 
                    onChange={(e) => updateChoice(choice.id, { explanation: e.target.value })} 
                    placeholder="Nhập giải thích cho lựa chọn này (tùy chọn)" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Giải thích chung cho câu hỏi</label>
        <textarea 
          className="w-full p-2 border rounded-md" 
          rows={3}
          value={explanation} 
          onChange={(e) => setExplanation(e.target.value)} 
          placeholder="Nhập giải thích chung cho câu hỏi này (tùy chọn)" 
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => { 
            setKind('mcq'); 
            setTitle(''); 
            setPartName(''); 
            setSrc(''); 
            setChoices([]); 
            setExplanation(''); 
          }}
        >
          Hủy
        </Button>
        <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700">
          Thêm Section
        </Button>
      </div>
    </div>
  )
}
