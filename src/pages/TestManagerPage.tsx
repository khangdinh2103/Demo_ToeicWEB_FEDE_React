import { useState } from 'react'
import { Plus, Edit, Trash2, BookOpen, Image, Music, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ScrollArea } from '../components/ui/scroll-area'
import AdminMenu from '../components/AdminMenu'

type Choice = { id: number; text: string; isCorrect?: boolean; media?: string }

type Section = {
  id: number
  kind: 'audio' | 'image' | 'mcq' | 'mcq_audio' | 'mcq_image'
  title: string
  src?: string // url for audio or image
  choices?: Choice[]
}

type TestItem = {
  id: number
  title: string
  description: string
  status: 'active' | 'pending'
  questions: number
  sections?: Section[]
}

const initialTests: TestItem[] = [
  { id: 1, title: 'Full Test - Level A', description: 'Đề thi thử 200 câu, mô phỏng kỳ thi TOEIC', status: 'active', questions: 200, sections: [] },
  { id: 2, title: 'Mini Test - Listening', description: '30 câu tập trung phần Listening', status: 'pending', questions: 30, sections: [] },
]

export default function TestManagerPage() {
  const navigate = useNavigate()
  const [tests, setTests] = useState<TestItem[]>(() => {
    try {
      const raw = localStorage.getItem('tests_v1')
      return raw ? JSON.parse(raw) : initialTests
    } catch (e) {
      return initialTests
    }
  })
  
  // persist helper
  const persist = (next: TestItem[]) => {
    setTests(next)
    try {
      localStorage.setItem('tests_v1', JSON.stringify(next))
      // notify other listeners in the same window
      try { window.dispatchEvent(new Event('tests_v1_changed')) } catch {}
    } catch {}
  }
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editing, setEditing] = useState<TestItem | null>(null)
  const [form, setForm] = useState<{ title: string; description: string; questions: number; status: 'active' | 'pending'; sections?: Section[] }>({ title: '', description: '', questions: 20, status: 'active', sections: [] })

  const createTest = () => {
  const t: TestItem = { id: Date.now(), title: form.title || 'Untitled', description: form.description || '', status: form.status, questions: form.questions, sections: form.sections || [] }
  persist([t, ...tests])
    setShowCreate(false)
  }

  const openEdit = (t: TestItem) => {
    setEditing(t)
  setForm({ title: t.title, description: t.description, questions: t.questions, status: t.status, sections: t.sections ? JSON.parse(JSON.stringify(t.sections)) : [] })
    setShowEdit(true)
  }

  const updateTest = () => {
    if (!editing) return
  const updated = tests.map(t => t.id === editing.id ? { ...t, title: form.title, description: form.description, questions: form.questions, status: form.status, sections: form.sections || [] } : t)
    persist(updated)
    setShowEdit(false)
    setEditing(null)
  }

  const deleteTest = (id: number) => {
  const next = tests.filter(t => t.id !== id)
  persist(next)
  }

  const toggleTestStatus = (id: number) => {
    const updated = tests.map(t => t.id === id ? { ...t, status: (t.status === 'active' ? 'pending' : 'active') as 'active' | 'pending' } : t)
    persist(updated)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminMenu />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Đề</h1>
            <p className="text-gray-600">Tạo, sửa và xóa đề thi cho hệ thống TOEIC</p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2"><Plus className="w-4 h-4" />Tạo đề mới</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo đề mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Input placeholder="Tiêu đề đề" value={form.title} onChange={(e:any) => setForm({ ...form, title: e.target.value })} />
                  <Textarea placeholder="Mô tả" value={form.description} onChange={(e:any) => setForm({ ...form, description: e.target.value })} />
                  <Input type="number" placeholder="Số câu" value={form.questions} onChange={(e:any) => setForm({ ...form, questions: Number(e.target.value) })} />
                  <div className="flex gap-2">
                    <Button variant={form.status === 'active' ? 'default' : 'outline'} onClick={() => setForm({ ...form, status: 'active' })}>Hoạt động</Button>
                    <Button variant={form.status === 'pending' ? 'default' : 'outline'} onClick={() => setForm({ ...form, status: 'pending' })}>Chưa xuất bản</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
                  <Button onClick={createTest}>Tạo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Hoạt động</TabsTrigger>
            <TabsTrigger value="pending">Chưa xuất bản</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ScrollArea className="h-[60vh]">
              <div className="grid gap-4">
                {tests.filter(t => t.status === 'active').map(t => (
                  <Card key={t.id} className="cursor-pointer">
                    <CardHeader onClick={() => navigate(`/tests/edit/${t.id}`)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                          <div>
                            <CardTitle>{t.title}</CardTitle>
                            <CardDescription className="text-sm">{t.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">{t.questions} câu</Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-yellow-600 hover:text-yellow-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTestStatus(t.id);
                            }}
                            title="Chuyển thành chưa xuất bản"
                          >
                            <ToggleLeft className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(t);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTest(t.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent />
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pending">
            <ScrollArea className="h-[60vh]">
              <div className="grid gap-4">
                {tests.filter(t => t.status === 'pending').map(t => (
                  <Card key={t.id} className="cursor-pointer">
                    <CardHeader onClick={() => navigate(`/tests/edit/${t.id}`)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-6 h-6 text-yellow-600" />
                          <div>
                            <CardTitle>{t.title}</CardTitle>
                            <CardDescription className="text-sm">{t.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">{t.questions} câu</Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-600 hover:text-green-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTestStatus(t.id);
                            }}
                            title="Chuyển thành hoạt động"
                          >
                            <ToggleRight className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(t);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTest(t.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent />
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Edit dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đề</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Tiêu đề đề" value={form.title} onChange={(e:any) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Mô tả" value={form.description} onChange={(e:any) => setForm({ ...form, description: e.target.value })} />
              <Input type="number" placeholder="Số câu" value={form.questions} onChange={(e:any) => setForm({ ...form, questions: Number(e.target.value) })} />
              <div className="flex gap-2">
                <Button variant={form.status === 'active' ? 'default' : 'outline'} onClick={() => setForm({ ...form, status: 'active' })}>Hoạt động</Button>
                <Button variant={form.status === 'pending' ? 'default' : 'outline'} onClick={() => setForm({ ...form, status: 'pending' })}>Chưa xuất bản</Button>
              </div>

              {/* Sections management */}
              <div className="mt-4">
                <h4 className="font-medium">Sections</h4>
                <div className="space-y-2 mt-2">
                  {(form.sections || []).map((s) => (
                    <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {s.kind.startsWith('mcq') ? <BookOpen className="w-5 h-5" /> : s.kind === 'image' ? <Image className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                        <div>
                          <div className="font-medium">{s.title}</div>
                          <div className="text-xs text-gray-500">{s.kind}{s.src ? ` — ${s.src}` : ''}</div>
                          {s.choices && s.choices.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">{s.choices.length} lựa chọn</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => {
                          // remove section
                          setForm({ ...form, sections: (form.sections || []).filter(x => x.id !== s.id) })
                        }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}

                  {/* Add new section draft */}
                  <SectionCreator onAdd={(sec) => setForm({ ...form, sections: [...(form.sections || []), sec] })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdit(false)}>Hủy</Button>
              <Button onClick={updateTest}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  )
}

// Small helper component to create a section (media + MCQ)
function SectionCreator({ onAdd }: { onAdd: (s: Section) => void }) {
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
    // reset
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

