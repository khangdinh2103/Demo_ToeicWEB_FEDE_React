import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminMenu from '../components/AdminMenu'
import SectionCreator from '../components/SectionCreator'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'

type Choice = { id: number; text: string; isCorrect?: boolean; explanation?: string }
type Section = { id: number; kind: string; title: string; src?: string; choices?: Choice[] }
type TestItem = { id: number; title: string; description: string; status: string; questions: number; sections?: Section[] }

export default function TestEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tests, setTests] = useState<TestItem[]>([])
  const [current, setCurrent] = useState<TestItem | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [bulkText, setBulkText] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('tests_v1')
    const parsed: TestItem[] = raw ? JSON.parse(raw) : []
    setTests(parsed)
  }, [])

  useEffect(() => {
    const reload = () => {
      const raw = localStorage.getItem('tests_v1')
      const parsed: TestItem[] = raw ? JSON.parse(raw) : []
      setTests(parsed)
    }
    const onStorage = (e: StorageEvent) => { if (e.key === 'tests_v1') reload() }
    window.addEventListener('storage', onStorage)
    window.addEventListener('tests_v1_changed', reload)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('tests_v1_changed', reload)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    const t = tests.find(x => String(x.id) === id)
    if (t) setCurrent(t)
  }, [id, tests])

  const saveLocal = (updatedTests: TestItem[]) => {
    setTests(updatedTests)
    localStorage.setItem('tests_v1', JSON.stringify(updatedTests))
    const t = updatedTests.find(x => String(x.id) === id)
    if (t) setCurrent(t)
  }

  const openEditor = (t: TestItem) => navigate(`/tests/edit/${t.id}`)

  const addSection = (sec: Section) => {
    if (!current) return
    const updated = tests.map(t => t.id === current.id ? { ...t, sections: [...(t.sections || []), sec] } : t)
    saveLocal(updated)
  }

  const parseBulkAndAdd = () => {
    if (!current || !bulkText.trim()) return
    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const newSections: Section[] = []
    let baseId = Date.now()
    lines.forEach((line, idx) => {
      // remove leading numbering like '1. '
      const noNum = line.replace(/^\s*\d+\.\s*/, '')
      // find the index where choices start (first ' A.' or ' *A.' pattern)
      const choiceStart = noNum.search(/\s\*?[A-Z]\./)
      let stem = ''
      let choicesPart = noNum
      if (choiceStart !== -1) {
        stem = noNum.slice(0, choiceStart).trim()
        choicesPart = noNum.slice(choiceStart + 1).trim()
      }

      // split choices by spaces where next token looks like 'A.' or '*A.'
      const parts = choicesPart.split(/\s+(?=\*?[A-Z]\.)/)
      const choices = parts.map((p, cidx) => {
        const m = p.match(/^(\*?)([A-Z])\.\s*(.*)$/)
        if (m) {
          const isCorrect = m[1] === '*'
          const text = m[3].trim().replace(/\.$/, '')
          return { id: baseId + idx * 10 + cidx, text, isCorrect }
        }
        // fallback: take whole part
        return { id: baseId + idx * 10 + cidx, text: p.replace(/\*$/, '').trim(), isCorrect: /\*$/.test(p) }
      })

      const sec: Section = { id: baseId + idx, kind: 'mcq', title: stem || `Question ${idx + 1}`, choices }
      newSections.push(sec)
    })

    // append to current test
    const updated = tests.map(t => t.id === current.id ? { ...t, sections: [...(t.sections || []), ...newSections] } : t)
    saveLocal(updated)
    setBulkText('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminMenu />
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left column - tests */}
          <div className="col-span-3">
            <div className="space-y-3">
              {tests.map(t => (
                <Card key={t.id} className="p-3 cursor-pointer" onClick={() => openEditor(t)}>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.questions} câu</div>
                </Card>
              ))}
            </div>
          </div>

          {/* Middle - sections */}
          <div className="col-span-6">
            <h3 className="font-semibold mb-3">Sections</h3>
            {current && (
              <div className="space-y-3">
                {(current.sections || []).map(s => (
                  <Card key={s.id} className="p-3 cursor-pointer" onClick={() => setSelectedSection(s)}>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-gray-500">{s.kind}</div>
                  </Card>
                ))}

                <SectionCreator onAdd={(sec) => addSection(sec as any)} />
              </div>
            )}
          </div>

          {/* Right - edit content for selected section */}
          <div className="col-span-3">
            <h3 className="font-semibold mb-3">Nội dung phần</h3>
            {selectedSection ? (
              <div>
                <Input value={selectedSection.title} onChange={(e:any) => setSelectedSection({ ...selectedSection, title: e.target.value })} />
                <Textarea className="mt-2" value={selectedSection.choices?.map(c => `${c.text}${c.isCorrect ? ' *' : ''}`).join('\n') || ''} onChange={(e:any) => {
                  // simple parse lines like "A. ..." with * for correct
                  const lines = e.target.value.split('\n').map((ln:string, idx:number) => ({ id: Date.now()+idx, text: ln.replace(/\s*\*$/, ''), isCorrect: /\*$/.test(ln) }))
                  setSelectedSection({ ...selectedSection, choices: lines })
                }} />
                <div className="mt-2">
                  <Button onClick={() => {
                    // write back to storage
                    if (!current || !selectedSection) return
                    const updated = tests.map(t => t.id === current.id ? { ...t, sections: (t.sections || []).map(s => s.id === selectedSection.id ? selectedSection : s) } : t)
                    saveLocal(updated)
                  }}>Lưu phần</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-gray-500 mb-2">Chọn một section để chỉnh sửa nội dung (ví dụ: A. ... B. ... *C. ...)</div>
                <div className="mb-2">
                  <Textarea value={bulkText} onChange={(e:any) => setBulkText(e.target.value)} placeholder={`Ví dụ:\n1. Question? A. opt1 B. opt2 C. opt3 *D. opt4\n2. ...`} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={parseBulkAndAdd}>Nhập nhanh từ đoạn text</Button>
                  <Button variant="ghost" onClick={() => setBulkText('')}>Xóa</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
