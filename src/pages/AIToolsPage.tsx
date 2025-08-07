"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, PenTool, Mic, Send, BookOpen, User, Bot, Volume2, Play, RotateCcw, StopCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { evaluateSpeech } from "@/api/evaluate-speech"

export default function AIToolsPage() {
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là AI Assistant của STAREDU. Tôi có thể giúp bạn về từ vựng, ngữ pháp, và các mẹo làm bài TOEIC. Bạn cần hỗ trợ gì?",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [writingText, setWritingText] = useState("")
  const [writingFeedback, setWritingFeedback] = useState("")
  
  // Enhanced Speaking AI states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudioFile, setRecordedAudioFile] = useState<File | null>(null)
  const [transcribedText, setTranscribedText] = useState("")
  const [speakingEvaluation, setSpeakingEvaluation] = useState("")
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [speakingError, setSpeakingError] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioStreamRef = useRef<MediaStream | null>(null)

  const handleChatSend = () => {
    if (!chatInput.trim()) return

    const newMessages = [
      ...chatMessages,
      { role: "user", content: chatInput },
      {
        role: "assistant",
        content:
          "Đây là câu trả lời mẫu từ AI. Trong thực tế, đây sẽ là phản hồi từ AI dựa trên câu hỏi của bạn về TOEIC.",
      },
    ]
    setChatMessages(newMessages)
    setChatInput("")
  }

  const handleWritingCheck = () => {
    if (!writingText.trim()) return

    setWritingFeedback(`
**Phân tích văn bản của bạn:**

**Điểm mạnh:**
- Cấu trúc câu rõ ràng
- Sử dụng từ vựng phù hợp
- Ý tưởng được trình bày logic

**Cần cải thiện:**
- Một số lỗi ngữ pháp nhỏ
- Có thể sử dụng từ vựng đa dạng hơn
- Kiểm tra lại dấu câu

**Gợi ý:**
- Thay "good" bằng "excellent" hoặc "outstanding"
- Sử dụng cấu trúc câu phức để tăng điểm
    `)
  }

  // Enhanced Speaking AI Functions
  const startRecording = async () => {
    setSpeakingError("")
    setTranscribedText("")
    setSpeakingEvaluation("")
    setRecordedAudioFile(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      
      let mimeType = "audio/webm"
      let fileExtension = "webm"
      
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"
        fileExtension = "mp4"
      } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus"
        fileExtension = "webm"
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const audioFile = new File([audioBlob], `recorded_audio.${fileExtension}`, { type: mimeType })
        setRecordedAudioFile(audioFile)
        audioChunksRef.current = []

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setSpeakingError("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSpeakingEvaluate = async () => {
    if (!recordedAudioFile) {
      setSpeakingError("Vui lòng ghi âm giọng nói trước khi đánh giá.")
      return
    }
    
    setSpeakingError("")
    setIsEvaluating(true)
    setTranscribedText("")
    setSpeakingEvaluation("")

    try {
      const result = await evaluateSpeech(recordedAudioFile)
      setTranscribedText(result.transcribedText)
      setSpeakingEvaluation(result.evaluation)
    } catch (err: any) {
      setSpeakingError(err.message || "Đã xảy ra lỗi khi đánh giá.")
      console.error("Evaluation error:", err)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleSpeakingReset = () => {
    stopRecording()
    setRecordedAudioFile(null)
    setTranscribedText("")
    setSpeakingEvaluation("")
    setIsEvaluating(false)
    setSpeakingError("")
    setSelectedTopic("")
    audioChunksRef.current = []
    mediaRecorderRef.current = null
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }
  }

  const speakingTopics = [
    {
      id: "hometown",
      title: "Describe your hometown",
      description: "Talk about the place where you grew up, its characteristics, and what makes it special."
    },
    {
      id: "routine",
      title: "Talk about your daily routine",
      description: "Describe a typical day in your life, from morning to evening."
    },
    {
      id: "education",
      title: "Discuss the importance of education",
      description: "Share your thoughts on why education is important and how it impacts society."
    },
    {
      id: "hobby",
      title: "Describe your favorite hobby",
      description: "Talk about something you enjoy doing in your free time and why you like it."
    },
    {
      id: "work",
      title: "Talk about your dream job",
      description: "Describe what kind of job you would like to have and why it appeals to you."
    },
    {
      id: "technology",
      title: "The role of technology in modern life",
      description: "Discuss how technology has changed our daily lives and its benefits or drawbacks."
    }
  ]

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">STAREDU</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link to="/courses" className="text-gray-700 hover:text-blue-600">
                Khóa học
              </Link>
              <Link to="/practice" className="text-gray-700 hover:text-blue-600">
                Luyện tập
              </Link>
              <Link to="/ai-tools" className="text-blue-600 font-medium">
                AI Tools
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Tools cho TOEIC
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sử dụng công nghệ AI để cải thiện kỹ năng TOEIC của bạn với Chat AI, Writing AI và Speaking AI
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="writing" className="flex items-center space-x-2">
              <PenTool className="h-4 w-4" />
              <span>Writing AI</span>
            </TabsTrigger>
            <TabsTrigger value="speaking" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Speaking AI</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Chat */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>AI Chatbot TOEIC</span>
                </CardTitle>
                <CardDescription>
                  Hỏi bất kỳ câu hỏi nào về từ vựng, ngữ pháp, hoặc mẹo làm bài TOEIC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-4">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white border"
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.role === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {message.role === "user" ? "Bạn" : "AI Assistant"}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Hỏi về từ vựng, ngữ pháp, hoặc mẹo TOEIC..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                    />
                    <Button onClick={handleChatSend}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Questions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Câu hỏi thường gặp:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Cách học từ vựng TOEIC hiệu quả?",
                        "Mẹo làm Part 5?",
                        "Cách cải thiện Listening?",
                        "Chiến lược làm bài Reading?",
                      ].map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing AI */}
          <TabsContent value="writing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PenTool className="h-5 w-5" />
                  <span>AI Writing Assistant</span>
                </CardTitle>
                <CardDescription>
                  Nhập văn bản của bạn để AI phân tích và đưa ra gợi ý cải thiện
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Writing Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nhập văn bản của bạn:
                      </label>
                      <Textarea
                        placeholder="Viết một đoạn văn ngắn về chủ đề TOEIC hoặc bất kỳ nội dung nào..."
                        value={writingText}
                        onChange={(e) => setWritingText(e.target.value)}
                        rows={10}
                      />
                    </div>
                    <Button onClick={handleWritingCheck} className="w-full">
                      <PenTool className="mr-2 h-4 w-4" />
                      Phân tích văn bản
                    </Button>
                  </div>

                  {/* Writing Feedback */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phân tích từ AI:
                      </label>
                      <div className="border rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto">
                        {writingFeedback ? (
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">
                              {writingFeedback}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Nhập văn bản và nhấn "Phân tích văn bản" để nhận phản hồi từ AI
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Speaking AI */}
          <TabsContent value="speaking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>TOEIC AI Speaking Evaluator</span>
                </CardTitle>
                <CardDescription>
                  Luyện tập nói với công nghệ AI chuyên nghiệp - Ghi âm, chuyển đổi giọng nói và nhận đánh giá chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Speaking Practice */}
                  <div className="space-y-6">
                    {/* Topic Selection */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Chọn chủ đề luyện tập:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {speakingTopics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic.id)}
                            className={`p-3 border rounded-lg text-left transition-all ${
                              selectedTopic === topic.id
                                ? "bg-blue-100 border-blue-500 text-blue-800"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <p className="font-medium text-sm">{topic.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{topic.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recording Section */}
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div
                          className={`w-32 h-32 rounded-full flex items-center justify-center ${
                            isRecording
                              ? "bg-red-100 border-4 border-red-500 animate-pulse"
                              : "bg-blue-100 border-4 border-blue-500"
                          }`}
                        >
                          {isRecording ? (
                            <Mic className="h-12 w-12 text-red-600" />
                          ) : (
                            <Mic className="h-12 w-12 text-blue-600" />
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {isRecording ? "Đang ghi âm..." : recordedAudioFile ? "Đã ghi âm xong" : "Sẵn sàng ghi âm"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isRecording
                            ? "Hãy nói về chủ đề đã chọn. Nhấn dừng khi hoàn thành."
                            : recordedAudioFile
                            ? "File âm thanh đã sẵn sàng để đánh giá."
                            : "Chọn chủ đề và nhấn nút mic để bắt đầu ghi âm"}
                        </p>
                      </div>

                      {/* Recording Controls */}
                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={toggleRecording}
                          size="lg"
                          disabled={isEvaluating || !selectedTopic}
                          variant={isRecording ? "destructive" : "default"}
                          className="flex items-center gap-2"
                        >
                          {isRecording ? (
                            <>
                              <StopCircle className="h-4 w-4" />
                              Dừng ghi âm
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4" />
                              Bắt đầu ghi âm
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleSpeakingReset}
                          disabled={isEvaluating}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Đặt lại
                        </Button>
                      </div>

                      {/* Evaluate Button */}
                      {recordedAudioFile && !isRecording && (
                        <Button
                          onClick={handleSpeakingEvaluate}
                          disabled={isEvaluating}
                          className="w-full"
                          size="lg"
                        >
                          {isEvaluating ? "Đang phân tích..." : "Đánh giá giọng nói"}
                        </Button>
                      )}

                      {/* Status Messages */}
                      {isRecording && (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                          <p className="text-sm text-red-600 font-medium">Đang ghi âm...</p>
                        </div>
                      )}
                      
                      {recordedAudioFile && !isRecording && (
                        <p className="text-sm text-green-600 font-medium">✓ Đã ghi âm xong. Sẵn sàng để đánh giá.</p>
                      )}
                      
                      {speakingError && (
                        <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{speakingError}</p>
                      )}
                    </div>
                  </div>

                  {/* Speaking Results */}
                  <div className="space-y-4">
                    {/* Transcription */}
                    {transcribedText && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          📝 Văn bản đã chuyển đổi:
                        </label>
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <p className="text-sm italic text-blue-800">{transcribedText}</p>
                        </div>
                      </div>
                    )}

                    {/* AI Evaluation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        🤖 Đánh giá từ TOEIC AI:
                      </label>
                      <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
                        {isEvaluating ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">Đang phân tích giọng nói và tạo đánh giá...</p>
                            </div>
                          </div>
                        ) : speakingEvaluation ? (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-sm"
                              dangerouslySetInnerHTML={{ 
                                __html: speakingEvaluation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/## (.*?)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">$1</h3>')
                                  .replace(/\*\s(.*?)$/gm, '<li class="ml-4">$1</li>')
                                  .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
                                  .replace(/\n\n/g, '<br><br>')
                                  .replace(/\n/g, '<br>')
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Ghi âm giọng nói và nhấn "Đánh giá giọng nói" để nhận phản hồi chi tiết từ TOEIC AI về phát âm, ngữ pháp và từ vựng
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
