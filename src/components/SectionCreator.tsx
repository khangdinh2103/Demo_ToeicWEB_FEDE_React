import { useState } from 'react'
import { Button } from '../components/ui/button'
import { BookOpen, Image, Music, Trash2 } from 'lucide-react'

type Choice = { id: number; text: string; isCorrect?: boolean; media?: string }
type Section = {
  id: number
  kind: 'audio' | 'image' | 'mcq' | 'mcq_audio' | 'mcq_image'
  title: string
  src?: string
  choices?: Choice[]
}

export default function SectionCreator({ onAdd }: { onAdd: (s: Section) => void }) {
  const [kind, setKind] = useState<Section['kind']>('mcq')
  const [title, setTitle] = useState('')
  const [src, setSrc] = useState('')
  const [choices, setChoices] = useState<Choice[]>([])

  const addChoice = () => setChoices([...choices, { id: Date.now() + Math.random(), text: '', isCorrect: false }])
  const updateChoice = (id: number, patch: Partial<Choice>) => setChoices(choices.map(c => c.id === id ? { ...c, ...patch } : c))
  const removeChoice = (id: number) => setChoices(choices.filter(c => c.id !== id))

  const submit = () => {
    const sec: Section = { id: Date.now(), kind, title: title || `${kind} section`, src: src || undefined, choices: choices.length ? choices : undefined }
    onAdd(sec)
    setKind('mcq')
    setTitle('')
    setSrc('')
    setChoices([])
  }

  return (
    <div className="p-3 border rounded">
      <div className="grid grid-cols-2 gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as Section['kind'])} className="p-2 border rounded">
          <option value="audio">Audio (độc lập)</option>
          <option value="image">Image (độc lập)</option>
          <option value="mcq">MCQ</option>
          <option value="mcq_audio">MCQ + Audio</option>
          <option value="mcq_image">MCQ + Image</option>
        </select>
        <input className="p-2 border rounded" placeholder="Tiêu đề phần" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="mt-2">
        {(kind === 'audio' || kind === 'mcq_audio') && (
          <input className="w-full p-2 border rounded" placeholder="Audio URL" value={src} onChange={(e) => setSrc(e.target.value)} />
        )}
        {(kind === 'image' || kind === 'mcq_image') && (
          <input className="w-full p-2 border rounded" placeholder="Image URL" value={src} onChange={(e) => setSrc(e.target.value)} />
        )}
      </div>

      {(kind.startsWith('mcq')) && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium">Lựa chọn</div>
            <button type="button" className="text-sm text-blue-600" onClick={addChoice}>Thêm lựa chọn</button>
          </div>
          <div className="space-y-2">
            {choices.map(c => (
              <div key={c.id} className="flex gap-2">
                <input className="flex-1 p-2 border rounded" value={c.text} onChange={(e) => updateChoice(c.id, { text: e.target.value })} placeholder="Nội dung lựa chọn" />
                <label className="flex items-center gap-1"><input type="radio" name="correct" checked={!!c.isCorrect} onChange={() => setChoices(choices.map(x => ({ ...x, isCorrect: x.id === c.id })))} /> đúng</label>
                <button type="button" className="text-red-600" onClick={() => removeChoice(c.id)}>Xóa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-3">
        <Button variant="outline" onClick={() => { setKind('mcq'); setTitle(''); setSrc(''); setChoices([]) }}>Hủy</Button>
        <Button onClick={submit}>Thêm phần</Button>
      </div>
    </div>
  )
}
