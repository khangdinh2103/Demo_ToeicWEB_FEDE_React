"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, PenTool, Mic, Send, User, Bot, RotateCcw, StopCircle } from "lucide-react"

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
  const [selectedWritingType, setSelectedWritingType] = useState<string>("")
  const [selectedWritingTopic, setSelectedWritingTopic] = useState<string>("")
  const [writingTimeLeft, setWritingTimeLeft] = useState<number>(1800) // 30 phút = 1800 giây
  const [isWritingTimerActive, setIsWritingTimerActive] = useState<boolean>(false)
  const [writingWordCount, setWritingWordCount] = useState<number>(0)
  
  // Enhanced Speaking AI states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudioFile, setRecordedAudioFile] = useState<File | null>(null)
  const [transcribedText, setTranscribedText] = useState("")
  const [speakingEvaluation, setSpeakingEvaluation] = useState<any>(null)
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

  const handleWritingCheck = async () => {
    if (!writingText.trim()) return

    setWritingFeedback("")
    setIsEvaluating(true)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setWritingFeedback("❌ Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      // Get topic text
      const topicText = selectedWritingTopic ? 
        [
          { id: "technology", title: "Technology in Education", question: "Some people believe that technology has made learning easier and more accessible. Others think that it has made students less focused and more dependent. Discuss both views and give your own opinion." },
          { id: "work-life", title: "Work-Life Balance", question: "In many countries, people are now working longer hours than before. What are the reasons for this? What effects does this have on individuals and society?" },
          { id: "environment", title: "Environmental Protection", question: "Some people think that environmental problems are too big for individuals to solve, while others believe that individuals can make a difference. Discuss both views and give your opinion." },
          { id: "health", title: "Health and Fitness", question: "In recent years, more and more people are choosing to eat healthy food and exercise regularly. What are the reasons for this trend? Is this a positive or negative development?" },
          { id: "social-media", title: "Social Media Impact", question: "Social media has become an integral part of people's lives. Do the advantages of social media outweigh the disadvantages?" }
        ].find(t => t.id === selectedWritingTopic)?.question : ""

      const response = await fetch("http://localhost:3090/api/student/vocabulary/evaluate-writing", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: writingText,
          topic: topicText
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Đã xảy ra lỗi khi đánh giá.")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Parse JSON evaluation
        let evaluationData = result.data.evaluation
        if (typeof evaluationData === 'string') {
          try {
            evaluationData = JSON.parse(evaluationData)
          } catch (e) {
            console.log("Evaluation is not JSON, using as-is")
          }
        }
        setWritingFeedback(evaluationData)
      } else {
        throw new Error(result.message || "Không thể đánh giá bài viết")
      }
    } catch (err: any) {
      setWritingFeedback(`❌ Lỗi: ${err.message || "Đã xảy ra lỗi khi đánh giá."}`)
      console.error("Evaluation error:", err)
    } finally {
      setIsEvaluating(false)
    }
  }

  // Writing Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    
    if (isWritingTimerActive && writingTimeLeft > 0) {
      timer = setInterval(() => {
        setWritingTimeLeft((prev) => {
          if (prev <= 1) {
            setIsWritingTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isWritingTimerActive, writingTimeLeft])

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
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setSpeakingError("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      // Get topic text from selectedTopic
      const topicText = speakingTopics.find(t => t.id === selectedTopic)?.description || ""

      const formData = new FormData()
      formData.append("audio", recordedAudioFile)
      if (topicText) {
        formData.append("topic", topicText)
      }

      const response = await fetch("http://localhost:3090/api/student/vocabulary/pronunciation-toeic", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Đã xảy ra lỗi khi đánh giá.")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Parse JSON evaluation if it's a string
        let evaluationData = result.data.evaluation
        if (typeof evaluationData === 'string') {
          try {
            evaluationData = JSON.parse(evaluationData)
          } catch (e) {
            console.log("Evaluation is not JSON, using as-is")
          }
        }
        
        setTranscribedText(evaluationData.transcribedText || result.data.transcribedText)
        setSpeakingEvaluation(evaluationData)
      } else {
        throw new Error(result.message || "Không thể đánh giá giọng nói")
      }
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
    setSpeakingEvaluation(null)
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
      id: "self-introduction",
      title: "Introduce Yourself",
      description: "Please introduce yourself. Talk about your name, where you're from, your education or work, your interests, and your goals for the future."
    },
    {
      id: "online-learning",
      title: "Online Learning vs Traditional Learning",
      description: "Do you think online learning is better than traditional classroom learning? Explain your opinion with reasons and examples."
    },
    {
      id: "work-from-home",
      title: "Working from Home",
      description: "What are the advantages and disadvantages of working from home? Share your perspective with specific examples."
    },
    {
      id: "social-media",
      title: "Social Media Impact",
      description: "How has social media changed the way people communicate? Discuss both positive and negative effects."
    },
    {
      id: "healthy-lifestyle",
      title: "Maintaining a Healthy Lifestyle",
      description: "What do you think is the most important factor in maintaining a healthy lifestyle? Explain why with examples."
    },
    {
      id: "teamwork",
      title: "Teamwork vs Individual Work",
      description: "Do you prefer working in a team or working alone? Give reasons and examples to support your opinion."
    },
    {
      id: "travel",
      title: "Benefits of Traveling",
      description: "What are the main benefits of traveling to different countries? Discuss your views with specific examples."
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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  <span>TOEIC Writing Practice</span>
                </CardTitle>
                <CardDescription>
                  Luyện tập Writing TOEIC với 3 dạng bài khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedWritingType ? (
                  // Writing Type Selection
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Chọn dạng bài luyện tập:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Describe Picture */}
                      <button
                        onClick={() => setSelectedWritingType("describe")}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center relative"
                      >
                        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Đang phát triển
                        </div>
                        <div className="text-4xl mb-3">🖼️</div>
                        <h4 className="font-semibold text-lg mb-2">Mô tả tranh</h4>
                        <p className="text-sm text-gray-600">
                          Viết mô tả chi tiết về một bức tranh trong 8 phút
                        </p>
                      </button>

                      {/* Email Response */}
                      <button
                        onClick={() => setSelectedWritingType("email")}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center relative"
                      >
                        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Đang phát triển
                        </div>
                        <div className="text-4xl mb-3">📧</div>
                        <h4 className="font-semibold text-lg mb-2">Phản hồi email</h4>
                        <p className="text-sm text-gray-600">
                          Viết email phản hồi chuyên nghiệp trong 10 phút
                        </p>
                      </button>

                      {/* Opinion Essay */}
                      <button
                        onClick={() => setSelectedWritingType("opinion")}
                        className="p-6 border-2 border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-center"
                      >
                        <div className="text-4xl mb-3">✍️</div>
                        <h4 className="font-semibold text-lg mb-2">Trình bày quan điểm</h4>
                        <p className="text-sm text-gray-600">
                          Viết bài luận trình bày quan điểm (100+ từ, 30 phút)
                        </p>
                      </button>
                    </div>
                  </div>
                ) : selectedWritingType === "opinion" && !selectedWritingTopic ? (
                  // Opinion Topic Selection
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Chọn chủ đề:</h3>
                      <Button variant="outline" size="sm" onClick={() => setSelectedWritingType("")}>
                        ← Quay lại
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          id: "technology",
                          title: "Technology in Education",
                          question: "Some people believe that technology has made learning easier and more accessible. Others think that it has made students less focused and more dependent. Discuss both views and give your own opinion."
                        },
                        {
                          id: "work-life",
                          title: "Work-Life Balance",
                          question: "In many countries, people are now working longer hours than before. What are the reasons for this? What effects does this have on individuals and society?"
                        },
                        {
                          id: "environment",
                          title: "Environmental Protection",
                          question: "Some people think that environmental problems are too big for individuals to solve, while others believe that individuals can make a difference. Discuss both views and give your opinion."
                        },
                        {
                          id: "health",
                          title: "Health and Fitness",
                          question: "In recent years, more and more people are choosing to eat healthy food and exercise regularly. What are the reasons for this trend? Is this a positive or negative development?"
                        },
                        {
                          id: "social-media",
                          title: "Social Media Impact",
                          question: "Social media has become an integral part of people's lives. Do the advantages of social media outweigh the disadvantages?"
                        }
                      ].map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => {
                            setSelectedWritingTopic(topic.id)
                            setIsWritingTimerActive(true)
                            setWritingTimeLeft(1800)
                          }}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                        >
                          <h4 className="font-semibold text-base mb-2">{topic.title}</h4>
                          <p className="text-sm text-gray-700 italic">"{topic.question}"</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : selectedWritingType === "opinion" && selectedWritingTopic ? (
                  // Opinion Writing Interface
                  <div className="space-y-4">
                    {/* Topic Display */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            📝 Chủ đề của bạn:
                            <span className="text-blue-700">
                              {[
                                { id: "technology", title: "Technology in Education" },
                                { id: "work-life", title: "Work-Life Balance" },
                                { id: "environment", title: "Environmental Protection" },
                                { id: "health", title: "Health and Fitness" },
                                { id: "social-media", title: "Social Media Impact" }
                              ].find(t => t.id === selectedWritingTopic)?.title}
                            </span>
                          </h4>
                          <p className="text-sm text-blue-800 italic leading-relaxed">
                            {selectedWritingTopic === "technology" && 
                              "Some people believe that technology has made learning easier and more accessible. Others think that it has made students less focused and more dependent. Discuss both views and give your own opinion."}
                            {selectedWritingTopic === "work-life" && 
                              "In many countries, people are now working longer hours than before. What are the reasons for this? What effects does this have on individuals and society?"}
                            {selectedWritingTopic === "environment" && 
                              "Some people think that environmental problems are too big for individuals to solve, while others believe that individuals can make a difference. Discuss both views and give your opinion."}
                            {selectedWritingTopic === "health" && 
                              "In recent years, more and more people are choosing to eat healthy food and exercise regularly. What are the reasons for this trend? Is this a positive or negative development?"}
                            {selectedWritingTopic === "social-media" && 
                              "Social media has become an integral part of people's lives. Do the advantages of social media outweigh the disadvantages?"}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedWritingTopic("")
                            setWritingText("")
                            setWritingWordCount(0)
                            setIsWritingTimerActive(false)
                            setWritingTimeLeft(1800)
                          }}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          Đổi chủ đề
                        </Button>
                      </div>
                    </div>

                    {/* Header with Timer and Word Count */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                      <div>
                        <h3 className="font-semibold">Trình bày quan điểm</h3>
                        <p className="text-sm opacity-90">Yêu cầu: Tối thiểu 100 từ</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {Math.floor(writingTimeLeft / 60)}:{(writingTimeLeft % 60).toString().padStart(2, '0')}
                        </div>
                        <p className="text-xs opacity-75">Thời gian còn lại</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{writingWordCount}</div>
                        <p className="text-xs opacity-75">từ</p>
                      </div>
                    </div>

                    {/* Writing Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Viết bài luận của bạn:
                          </label>
                          <Textarea
                            placeholder="Bắt đầu viết bài luận của bạn ở đây..."
                            value={writingText}
                            onChange={(e) => {
                              setWritingText(e.target.value)
                              const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0)
                              setWritingWordCount(words.length)
                            }}
                            rows={15}
                            className="font-mono"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleWritingCheck} 
                            className="flex-1"
                            disabled={writingWordCount < 100}
                          >
                            <PenTool className="mr-2 h-4 w-4" />
                            Nộp bài & Nhận đánh giá
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setSelectedWritingTopic("")
                              setWritingText("")
                              setWritingWordCount(0)
                              setIsWritingTimerActive(false)
                              setWritingTimeLeft(1800)
                            }}
                          >
                            Làm lại
                          </Button>
                        </div>
                        {writingWordCount < 100 && writingWordCount > 0 && (
                          <p className="text-sm text-orange-600">
                            ⚠️ Cần thêm {100 - writingWordCount} từ nữa để đạt yêu cầu tối thiểu
                          </p>
                        )}
                      </div>

                      {/* Feedback Area */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Đánh giá từ AI:
                        </label>
                        <div className="border rounded-lg p-4 bg-gray-50 h-96 overflow-y-auto">
                          {isEvaluating ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">Đang phân tích bài viết...</p>
                              </div>
                            </div>
                          ) : writingFeedback && typeof writingFeedback === 'object' ? (
                            <div className="space-y-4">
                              {/* Score */}
                              <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm opacity-90">Điểm TOEIC Writing</p>
                                    <p className="text-3xl font-bold">{(writingFeedback as any).score || 0}/200</p>
                                    {(writingFeedback as any).wordCount && (
                                      <p className="text-xs opacity-75 mt-1">📊 {(writingFeedback as any).wordCount} từ</p>
                                    )}
                                  </div>
                                  <div className="text-5xl">📝</div>
                                </div>
                                {(writingFeedback as any).scoreReason && (
                                  <div className="border-t border-white/20 pt-2 mt-2">
                                    <p className="text-sm opacity-95">{(writingFeedback as any).scoreReason}</p>
                                  </div>
                                )}
                              </div>

                              {/* Length Comment */}
                              {(writingFeedback as any).lengthComment && (
                                <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-orange-800 mb-1">📏 Độ dài</h4>
                                  <p className="text-sm text-orange-700">{(writingFeedback as any).lengthComment}</p>
                                </div>
                              )}

                              {/* Strengths */}
                              {(writingFeedback as any).strengths && (writingFeedback as any).strengths.length > 0 && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-green-800 mb-2">✅ Điểm mạnh</h4>
                                  <ul className="space-y-1">
                                    {(writingFeedback as any).strengths.map((s: string, i: number) => (
                                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                        <span>•</span><span>{s}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Task Response */}
                              {(writingFeedback as any).taskResponse && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-blue-800 mb-1">📋 Trả lời yêu cầu đề bài</h4>
                                  <p className="text-sm text-blue-700">{(writingFeedback as any).taskResponse}</p>
                                </div>
                              )}

                              {/* Coherence */}
                              {(writingFeedback as any).coherence && (
                                <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-purple-800 mb-1">🔗 Tính mạch lạc</h4>
                                  <p className="text-sm text-purple-700">{(writingFeedback as any).coherence}</p>
                                </div>
                              )}

                              {/* Vocabulary & Grammar */}
                              {(writingFeedback as any).vocabularyGrammar && (
                                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-indigo-800 mb-1">📚 Từ vựng & Ngữ pháp</h4>
                                  <p className="text-sm text-indigo-700">{(writingFeedback as any).vocabularyGrammar}</p>
                                </div>
                              )}

                              {/* Errors */}
                              {(writingFeedback as any).errors && (writingFeedback as any).errors.length > 0 && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-red-800 mb-2">❌ Lỗi ({(writingFeedback as any).errors.length})</h4>
                                  <ul className="space-y-2">
                                    {(writingFeedback as any).errors.map((e: string, i: number) => (
                                      <li key={i} className="text-sm text-red-700 bg-white p-2 rounded">
                                        {i + 1}. {e}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Improvements */}
                              {(writingFeedback as any).improvements && (writingFeedback as any).improvements.length > 0 && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r">
                                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Góp ý cải thiện</h4>
                                  <ul className="space-y-2">
                                    {(writingFeedback as any).improvements.map((tip: string, i: number) => (
                                      <li key={i} className="text-sm text-yellow-700 bg-white p-2 rounded">
                                        {i + 1}. {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : writingFeedback && typeof writingFeedback === 'string' ? (
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm text-red-600">{writingFeedback}</pre>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Viết bài luận và nhấn "Nộp bài & Nhận đánh giá" để nhận phản hồi từ AI
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Coming Soon for other types
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-semibold mb-2">Tính năng đang phát triển</h3>
                    <p className="text-gray-600 mb-4">Chức năng này sẽ sớm được ra mắt</p>
                    <Button onClick={() => setSelectedWritingType("")}>
                      ← Quay lại chọn dạng bài
                    </Button>
                  </div>
                )}
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
                        ) : speakingEvaluation && typeof speakingEvaluation === 'object' ? (
                          <div className="space-y-4">
                            {/* Score Section */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-5 shadow-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-sm opacity-90 mb-1">Điểm TOEIC Speaking Part 6</p>
                                  <p className="text-4xl font-bold">{speakingEvaluation?.score || 0}/200</p>
                                  {speakingEvaluation?.wordCount && (
                                    <p className="text-xs opacity-75 mt-1">
                                      📊 Số từ: {speakingEvaluation.wordCount} từ
                                    </p>
                                  )}
                                </div>
                                <div className="text-6xl">🎯</div>
                              </div>
                              {speakingEvaluation?.scoreReason && (
                                <div className="border-t border-white/20 pt-3 mt-3">
                                  <p className="text-xs opacity-75 mb-1">Nhận xét của giám khảo:</p>
                                  <p className="text-sm opacity-95 leading-relaxed">{speakingEvaluation.scoreReason}</p>
                                </div>
                              )}
                            </div>

                            {/* Length Comment */}
                            {speakingEvaluation?.lengthComment && (
                              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r">
                                <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                                  📏 Đánh giá độ dài
                                </h4>
                                <p className="text-sm text-orange-700 leading-relaxed">{speakingEvaluation.lengthComment}</p>
                              </div>
                            )}

                            {/* Topic Relevance */}
                            {speakingEvaluation?.topicRelevance && (
                              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                                <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                                  ✅ Độ phù hợp với chủ đề
                                </h4>
                                <p className="text-sm text-green-700 leading-relaxed whitespace-pre-line">{speakingEvaluation.topicRelevance}</p>
                              </div>
                            )}

                            {/* Errors */}
                            {(speakingEvaluation as any).errors && (speakingEvaluation as any).errors.length > 0 && (
                              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                                <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
                                  ❌ Lỗi cần sửa ({(speakingEvaluation as any).errors.length} lỗi)
                                </h4>
                                <ul className="space-y-2">
                                  {(speakingEvaluation as any).errors.map((error: string, index: number) => (
                                    <li key={index} className="text-sm text-red-700 flex items-start gap-2 bg-white p-2 rounded">
                                      <span className="text-red-500 font-bold mt-0.5">{index + 1}.</span>
                                      <span className="leading-relaxed whitespace-pre-line">{error}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Better Expressions */}
                            {(speakingEvaluation as any).betterExpressions && (speakingEvaluation as any).betterExpressions.length > 0 && (
                              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                                <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                                  💡 Cách diễn đạt tốt hơn
                                </h4>
                                <ul className="space-y-2">
                                  {(speakingEvaluation as any).betterExpressions.map((expr: string, index: number) => (
                                    <li key={index} className="text-sm text-blue-700 flex items-start gap-2 bg-white p-2 rounded">
                                      <span className="text-blue-500 font-bold mt-0.5">{index + 1}.</span>
                                      <span className="leading-relaxed whitespace-pre-line">{expr}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Pronunciation */}
                            {(speakingEvaluation as any).pronunciation && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
                                <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2">
                                  🗣️ Phát âm & Độ trôi chảy
                                </h4>
                                <p className="text-sm text-yellow-700 leading-relaxed whitespace-pre-line">{(speakingEvaluation as any).pronunciation}</p>
                              </div>
                            )}

                            {/* Improvements */}
                            {(speakingEvaluation as any).improvements && (speakingEvaluation as any).improvements.length > 0 && (
                              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
                                <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
                                  🎓 Lời khuyên từ giám khảo
                                </h4>
                                <ul className="space-y-2">
                                  {(speakingEvaluation as any).improvements.map((tip: string, index: number) => (
                                    <li key={index} className="text-sm text-purple-700 flex items-start gap-2 bg-white p-2 rounded">
                                      <span className="text-purple-500 font-bold mt-0.5">{index + 1}.</span>
                                      <span className="leading-relaxed whitespace-pre-line">{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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
