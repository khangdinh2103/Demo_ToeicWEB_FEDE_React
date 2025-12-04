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
  
  // Image Writing states
  const [imagePrompt, setImagePrompt] = useState<any>(null)
  const [imagePromptsList, setImagePromptsList] = useState<any[]>([])
  const [imageCollocationSuggestions, setImageCollocationSuggestions] = useState<any[]>([])
  const [imageWritingText, setImageWritingText] = useState("")
  const [imageWritingResult, setImageWritingResult] = useState<any>(null)
  const [isLoadingImagePrompts, setIsLoadingImagePrompts] = useState(false)
  const [isLoadingImageSuggestions, setIsLoadingImageSuggestions] = useState(false)
  const [isCheckingImageWriting, setIsCheckingImageWriting] = useState(false)
  
  // Email Writing states
  const [emailPrompt, setEmailPrompt] = useState("")
  const [emailKeywords, setEmailKeywords] = useState<any[]>([])
  const [emailResponse, setEmailResponse] = useState("")
  const [emailResult, setEmailResult] = useState<any>(null)
  const [isGeneratingEmailPrompt, setIsGeneratingEmailPrompt] = useState(false)
  const [isLoadingEmailKeywords, setIsLoadingEmailKeywords] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailTimeLeft, setEmailTimeLeft] = useState<number>(600) // 10 phút = 600 giây
  const [isEmailTimerActive, setIsEmailTimerActive] = useState<boolean>(false)
  
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

  // Email Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    
    if (isEmailTimerActive && emailTimeLeft > 0) {
      timer = setInterval(() => {
        setEmailTimeLeft((prev) => {
          if (prev <= 1) {
            setIsEmailTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isEmailTimerActive, emailTimeLeft])

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

  // Image Writing handlers
  const loadAllImagePrompts = async () => {
    setIsLoadingImagePrompts(true)
    setImagePromptsList([])

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      const response = await fetch("http://localhost:3090/api/student/writing/image-writing/all", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Không thể tải danh sách đề bài")
      }

      const result = await response.json()
      console.log("📝 [AITools] Loaded image prompts:", result)
      if (result.success && result.data) {
        setImagePromptsList(result.data)
        console.log("✅ [AITools] Set image prompts list:", result.data.length, "items")
      }
    } catch (err: any) {
      console.error("❌ [AITools] Error loading prompts:", err)
      alert(err.message || "Đã xảy ra lỗi khi tải danh sách đề bài")
    } finally {
      setIsLoadingImagePrompts(false)
    }
  }

  const selectRandomImagePrompt = () => {
    if (imagePromptsList.length === 0) return
    const randomIndex = Math.floor(Math.random() * imagePromptsList.length)
    selectImagePrompt(imagePromptsList[randomIndex])
  }

  const selectImagePrompt = (prompt: any) => {
    setImagePrompt(prompt)
    setImageCollocationSuggestions([])
    setImageWritingText("")
    setImageWritingResult(null)
  }

  const loadImageCollocationSuggestions = async () => {
    if (!imagePrompt) return

    setIsLoadingImageSuggestions(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      const response = await fetch("http://localhost:3090/api/student/writing/image-writing/suggest-collocations", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt_id: imagePrompt._id
        })
      })

      if (!response.ok) {
        throw new Error("Không thể tải gợi ý")
      }

      const result = await response.json()
      console.log("💡 [AITools] Collocation response:", result)
      if (result.data && result.data.suggestions) {
        console.log("✅ [AITools] Setting suggestions:", result.data.suggestions)
        setImageCollocationSuggestions(result.data.suggestions)
        console.log("✅ [AITools] Suggestions count:", result.data.suggestions.length)
      } else {
        console.warn("⚠️ [AITools] No suggestions in response:", result)
      }
    } catch (err: any) {
      console.error("❌ [AITools] Error loading suggestions:", err)
      alert(err.message || "Đã xảy ra lỗi khi tải gợi ý")
    } finally {
      setIsLoadingImageSuggestions(false)
    }
  }

  const checkImageWriting = async () => {
    if (!imagePrompt || !imageWritingText.trim()) {
      alert("Vui lòng viết câu mô tả trước khi chấm bài")
      return
    }

    setIsCheckingImageWriting(true)
    setImageWritingResult(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      const response = await fetch("http://localhost:3090/api/student/writing/image-writing/check-sentence", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt_id: imagePrompt._id,
          sentence: imageWritingText
        })
      })

      if (!response.ok) {
        throw new Error("Không thể chấm bài")
      }

      const result = await response.json()
      console.log("📊 [AITools] Check writing response:", result)
      if (result.data) {
        console.log("✅ [AITools] Setting writing result:", result.data)
        setImageWritingResult(result.data)
      } else {
        console.warn("⚠️ [AITools] No data in response:", result)
      }
    } catch (err: any) {
      console.error("❌ [AITools] Error checking writing:", err)
      alert(err.message || "Đã xảy ra lỗi khi chấm bài")
    } finally {
      setIsCheckingImageWriting(false)
    }
  }

  // Email Writing functions
  const generateEmailPrompt = async () => {
    setIsGeneratingEmailPrompt(true)
    setEmailPrompt("")
    setEmailKeywords([])
    setEmailResponse("")
    setEmailResult(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      const response = await fetch("http://localhost:3090/api/student/writing/email-writing/generate-prompt", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error("Không thể tạo đề email")
      }

      const result = await response.json()
      console.log("📧 [AITools] Email prompt response:", result)
      if (result.data && result.data.full_email) {
        setEmailPrompt(result.data.full_email)
        console.log("✅ [AITools] Email prompt generated")
      } else {
        console.warn("⚠️ [AITools] No full_email in response:", result)
      }
    } catch (err: any) {
      console.error("❌ [AITools] Error generating email prompt:", err)
      alert(err.message || "Đã xảy ra lỗi khi tạo đề email")
    } finally {
      setIsGeneratingEmailPrompt(false)
    }
  }

  const loadEmailKeywords = async () => {
    if (!emailPrompt) {
      alert("Vui lòng tạo đề email trước")
      return
    }

    setIsLoadingEmailKeywords(true)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      const response = await fetch("http://localhost:3090/api/student/writing/email-writing/suggest-keywords", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt_email: emailPrompt
        })
      })

      if (!response.ok) {
        throw new Error("Không thể tải gợi ý từ khóa")
      }

      const result = await response.json()
      console.log("🔑 [AITools] Email keywords response:", result)
      if (result.data && result.data.keywords) {
        setEmailKeywords(result.data.keywords)
        console.log("✅ [AITools] Keywords loaded:", result.data.keywords.length)
      }
    } catch (err: any) {
      console.error("❌ [AITools] Error loading keywords:", err)
      alert(err.message || "Đã xảy ra lỗi khi tải từ khóa")
    } finally {
      setIsLoadingEmailKeywords(false)
    }
  }

  const checkEmailWriting = async () => {
    if (!emailPrompt || !emailResponse.trim()) {
      alert("Vui lòng viết email phản hồi trước khi chấm bài")
      return
    }

    setIsCheckingEmail(true)
    setEmailResult(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng tính năng này.")
        return
      }

      const response = await fetch("http://localhost:3090/api/student/writing/email-writing/check-email", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt_email: emailPrompt,
          response_email: emailResponse
        })
      })

      if (!response.ok) {
        throw new Error("Không thể chấm bài email")
      }

      const result = await response.json()
      console.log("📊 [AITools] Check email response:", result)
      if (result.data) {
        setEmailResult(result.data)
        console.log("✅ [AITools] Email result set")
      }
    } catch (err: any) {
      console.error("❌ [AITools] Error checking email:", err)
      alert(err.message || "Đã xảy ra lỗi khi chấm bài")
    } finally {
      setIsCheckingEmail(false)
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
                        onClick={() => {
                          setSelectedWritingType("describe")
                          loadAllImagePrompts()
                        }}
                        className="p-6 border-2 border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-center"
                      >
                        <div className="text-4xl mb-3">🖼️</div>
                        <h4 className="font-semibold text-lg mb-2">Mô tả tranh</h4>
                        <p className="text-sm text-gray-600">
                          Viết câu mô tả dựa vào tranh và 2 từ cho trước
                        </p>
                      </button>

                      {/* Email Response */}
                      <button
                        onClick={() => setSelectedWritingType("email")}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
                      >
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
                ) : selectedWritingType === "describe" ? (
                  // Image Writing Interface
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Viết câu mô tả tranh</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedWritingType("")
                          setImagePrompt(null)
                          setImagePromptsList([])
                          setImageCollocationSuggestions([])
                          setImageWritingText("")
                          setImageWritingResult(null)
                        }}
                      >
                        ← Quay lại
                      </Button>
                    </div>

                    {isLoadingImagePrompts ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải danh sách đề bài...</p>
                      </div>
                    ) : !imagePrompt && imagePromptsList.length > 0 ? (
                      // Prompt Selection List
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-700">Chọn đề bài:</h4>
                          <Button
                            onClick={selectRandomImagePrompt}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            🎲 Đề ngẫu nhiên
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {imagePromptsList.map((prompt, index) => (
                            <button
                              key={prompt._id}
                              onClick={() => selectImagePrompt(prompt)}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                            >
                              <div className="aspect-video mb-3 rounded overflow-hidden">
                                <img 
                                  src={prompt.image_url} 
                                  alt={`Prompt ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {prompt.required_words && prompt.required_words.map((word: string, idx: number) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                                    {word}
                                  </span>
                                ))}
                              </div>
                              {prompt.image_description && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{prompt.image_description}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : imagePrompt ? (
                      <>
                        {/* Image Display */}
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-700">📸 Hình ảnh:</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImagePrompt(null)
                                setImageCollocationSuggestions([])
                                setImageWritingText("")
                                setImageWritingResult(null)
                              }}
                            >
                              ← Chọn đề khác
                            </Button>
                          </div>
                          <img 
                            src={imagePrompt.image_url} 
                            alt="Writing prompt" 
                            className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                          />
                        </div>

                        {/* Required Words */}
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-semibold text-blue-900 mb-2">📝 Yêu cầu: Viết câu sử dụng 2 từ sau</h4>
                          <div className="flex gap-2">
                            {imagePrompt.required_words && imagePrompt.required_words.map((word: string, idx: number) => (
                              <span key={idx} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-lg">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Suggestions Button */}
                        <div className="flex gap-2">
                          <Button
                            onClick={loadImageCollocationSuggestions}
                            disabled={isLoadingImageSuggestions || imageCollocationSuggestions.length > 0}
                            variant="outline"
                            className="w-full"
                          >
                            {isLoadingImageSuggestions ? "Đang tải..." : imageCollocationSuggestions.length > 0 ? "✓ Đã tải gợi ý" : "💡 Gợi ý collocations"}
                          </Button>
                        </div>

                        {/* Collocation Suggestions */}
                        {imageCollocationSuggestions.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <h4 className="font-semibold text-green-900 mb-3">💡 Gợi ý Collocations:</h4>
                            <div className="space-y-2">
                              {imageCollocationSuggestions.map((suggestion, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border border-green-200">
                                  <p className="font-semibold text-green-800">{suggestion.collocation}</p>
                                  <p className="text-sm text-gray-600 italic">📖 {suggestion.meaning}</p>
                                  <p className="text-sm text-gray-700 mt-1">"{suggestion.example}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Writing Input */}
                        <div>
                          <label className="block font-semibold mb-2">Viết câu mô tả của bạn:</label>
                          <Textarea
                            value={imageWritingText}
                            onChange={(e) => setImageWritingText(e.target.value)}
                            placeholder="Ví dụ: A man wearing a backpack walks across the bridge."
                            className="min-h-[120px] text-base"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Số từ: {imageWritingText.trim().split(/\s+/).filter(w => w).length}
                          </p>
                        </div>

                        {/* Check Button */}
                        <Button
                          onClick={checkImageWriting}
                          disabled={isCheckingImageWriting || !imageWritingText.trim()}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="lg"
                        >
                          {isCheckingImageWriting ? "Đang chấm bài..." : "✓ Chấm bài"}
                        </Button>

                        {/* Results */}
                        {imageWritingResult && (
                          <div className="bg-white p-6 rounded-lg border-2 border-blue-300 space-y-4">
                            <h3 className="font-bold text-xl text-blue-900 mb-4">📊 Kết quả đánh giá</h3>
                            
                            {/* Overall Score */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">Điểm tổng:</span>
                                <span className="text-3xl font-bold text-blue-600">
                                  {imageWritingResult.overall_score}/100
                                </span>
                              </div>
                            </div>

                            {/* Meaning */}
                            {imageWritingResult.meaning && (
                              <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  {imageWritingResult.meaning.is_correct ? "✅" : "❌"} Ý nghĩa
                                </h4>
                                <p className="text-gray-700">{imageWritingResult.meaning.explanation}</p>
                                {imageWritingResult.meaning.image_relevance && (
                                  <p className="text-sm text-purple-700 mt-2 italic">
                                    🖼️ Phù hợp với ảnh: {imageWritingResult.meaning.image_relevance}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Grammar */}
                            {imageWritingResult.grammar && (
                              <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  {imageWritingResult.grammar.is_correct ? "✅" : "❌"} Ngữ pháp
                                </h4>
                                <p className="text-gray-700">{imageWritingResult.grammar.explanation}</p>
                              </div>
                            )}

                            {/* Vocabulary */}
                            {imageWritingResult.vocabulary && (
                              <div className="border-l-4 border-yellow-500 pl-4">
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  {imageWritingResult.vocabulary.used_correctly ? "✅" : "❌"} Từ vựng
                                </h4>
                                <p className="text-gray-700">{imageWritingResult.vocabulary.explanation}</p>
                              </div>
                            )}

                            {/* Correction */}
                            {imageWritingResult.correction && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-900 mb-2">✍️ Câu gợi ý:</h4>
                                <p className="text-green-800 font-medium text-lg italic">
                                  "{imageWritingResult.correction.corrected_sentence}"
                                </p>
                                <p className="text-sm text-gray-600 mt-2">{imageWritingResult.correction.explanation}</p>
                              </div>
                            )}

                            {/* Feedback Summary */}
                            {imageWritingResult.feedback_summary && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">💬 Nhận xét chung:</h4>
                                <p className="text-gray-700">{imageWritingResult.feedback_summary}</p>
                              </div>
                            )}

                            {/* Reset Button */}
                            <Button
                              onClick={() => {
                                setImageWritingText("")
                                setImageWritingResult(null)
                                setImageCollocationSuggestions([])
                                setImagePrompt(null)
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              ← Chọn đề khác
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>Chưa có đề bài nào. Vui lòng thêm đề từ trang quản lý.</p>
                        <Button onClick={() => setSelectedWritingType("")} className="mt-4">
                          ← Quay lại
                        </Button>
                      </div>
                    )}
                  </div>
                ) : selectedWritingType === "email" ? (
                  // Email Writing Interface
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Viết email phản hồi (TOEIC Writing Task 6)</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedWritingType("")
                          setEmailPrompt("")
                          setEmailKeywords([])
                          setEmailResponse("")
                          setEmailResult(null)
                          setEmailTimeLeft(600)
                          setIsEmailTimerActive(false)
                        }}
                      >
                        ← Quay lại
                      </Button>
                    </div>

                    {!emailPrompt ? (
                      // Generate Prompt Button
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📧</div>
                        <h4 className="text-xl font-semibold mb-4">Bắt đầu luyện tập</h4>
                        <p className="text-gray-600 mb-6">
                          Nhấn nút dưới để tạo một đề email ngẫu nhiên phong cách TOEIC
                        </p>
                        <Button
                          onClick={generateEmailPrompt}
                          disabled={isGeneratingEmailPrompt}
                          size="lg"
                          className="px-8"
                        >
                          {isGeneratingEmailPrompt ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Đang tạo đề...
                            </>
                          ) : (
                            "🎲 Tạo đề ngẫu nhiên"
                          )}
                        </Button>
                      </div>
                    ) : (
                      // Email Writing Practice
                      <div className="space-y-4">
                        {/* Email Prompt */}
                        <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
                          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <span>📨</span>
                            <span>Email nhận được:</span>
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                            {emailPrompt}
                          </div>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">⏱️</span>
                            <div>
                              <p className="font-semibold text-gray-800">Thời gian làm bài</p>
                              <p className="text-sm text-gray-600">TOEIC yêu cầu: 10 phút</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">
                              {Math.floor(emailTimeLeft / 60)}:{String(emailTimeLeft % 60).padStart(2, '0')}
                            </p>
                            <Button
                              onClick={() => {
                                if (isEmailTimerActive) {
                                  setIsEmailTimerActive(false)
                                } else {
                                  setIsEmailTimerActive(true)
                                  if (emailTimeLeft === 0) {
                                    setEmailTimeLeft(600)
                                  }
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              {isEmailTimerActive ? "⏸ Tạm dừng" : emailTimeLeft === 0 ? "🔄 Đặt lại" : "▶ Bắt đầu"}
                            </Button>
                          </div>
                        </div>

                        {/* Keywords Suggestions */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">💡 Gợi ý từ khóa hữu ích</h4>
                            <Button
                              onClick={loadEmailKeywords}
                              disabled={isLoadingEmailKeywords || emailKeywords.length > 0}
                              size="sm"
                              variant="outline"
                            >
                              {isLoadingEmailKeywords ? "Đang tải..." : emailKeywords.length > 0 ? "✓ Đã tải" : "Xem gợi ý"}
                            </Button>
                          </div>

                          {emailKeywords.length > 0 && (
                            <div className="space-y-3">
                              {emailKeywords.map((keyword: any, idx: number) => (
                                <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                  <p className="font-semibold text-green-900">{keyword.keyword}</p>
                                  <p className="text-sm text-gray-700 mt-1">{keyword.meaning}</p>
                                  <p className="text-sm text-gray-600 italic mt-1">"{keyword.usage_example}"</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Email Response Input */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">✍️ Email phản hồi của bạn</h4>
                            <span className="text-sm text-gray-600">
                              {emailResponse.split(/\s+/).filter(Boolean).length} từ
                            </span>
                          </div>
                          <Textarea
                            value={emailResponse}
                            onChange={(e) => setEmailResponse(e.target.value)}
                            placeholder="Viết email phản hồi của bạn tại đây... (khuyến nghị 50-100 từ)"
                            className="min-h-[300px] text-base"
                          />
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              💡 Lưu ý: Email cần rõ ràng, lịch sự và trả lời đầy đủ các câu hỏi
                            </p>
                            <Button
                              onClick={checkEmailWriting}
                              disabled={isCheckingEmail || emailResponse.trim().length === 0}
                              size="lg"
                            >
                              {isCheckingEmail ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Đang chấm...
                                </>
                              ) : (
                                "📊 Chấm bài"
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Email Result */}
                        {emailResult && (
                          <div className="bg-white p-6 rounded-lg border-2 border-green-500 space-y-4">
                            {/* Overall Score & CEFR Level */}
                            <div className="text-center pb-4 border-b-2 border-gray-200">
                              <div className="flex items-center justify-center gap-4 mb-3">
                                <div className="text-6xl font-bold text-green-600">
                                  {emailResult.overall_score}/100
                                </div>
                                {emailResult.cefr_level && (
                                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                                    <p className="text-sm font-medium">CEFR Level</p>
                                    <p className="text-2xl font-bold">{emailResult.cefr_level}</p>
                                  </div>
                                )}
                              </div>
                              <p className="text-lg text-gray-700">
                                {emailResult.overall_score >= 80 ? "🎉 Xuất sắc!" :
                                 emailResult.overall_score >= 60 ? "👍 Tốt!" :
                                 emailResult.overall_score >= 40 ? "💪 Cần cải thiện" :
                                 "📚 Tiếp tục luyện tập"}
                              </p>
                            </div>

                            {/* Criteria Scores */}
                            {emailResult.criteria_scores && emailResult.criteria_scores.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 text-lg">📋 Chi tiết đánh giá:</h4>
                                {emailResult.criteria_scores.map((criteria: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className={`border-l-4 pl-4 ${
                                      criteria.score >= 80 ? 'border-green-500' :
                                      criteria.score >= 60 ? 'border-blue-500' :
                                      criteria.score >= 40 ? 'border-yellow-500' :
                                      'border-red-500'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold text-gray-800">
                                        {criteria.score >= 80 ? "✅" : criteria.score >= 60 ? "👍" : criteria.score >= 40 ? "⚠️" : "❌"} {criteria.criterion}
                                      </h4>
                                      <span className={`text-lg font-bold ${
                                        criteria.score >= 80 ? 'text-green-600' :
                                        criteria.score >= 60 ? 'text-blue-600' :
                                        criteria.score >= 40 ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`}>
                                        {criteria.score}/100
                                      </span>
                                    </div>
                                    <p className="text-gray-700">{criteria.feedback}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Detailed Explanation */}
                            {emailResult.detailed_explanation && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2">💬 Nhận xét chi tiết:</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{emailResult.detailed_explanation}</p>
                              </div>
                            )}

                            {/* Conclusion */}
                            {emailResult.conclusion && (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-900 mb-2">🎯 Kết luận:</h4>
                                <p className="text-gray-700">{emailResult.conclusion}</p>
                              </div>
                            )}

                            {/* Reset Button */}
                            <Button
                              onClick={() => {
                                setEmailPrompt("")
                                setEmailKeywords([])
                                setEmailResponse("")
                                setEmailResult(null)
                                setEmailTimeLeft(600)
                                setIsEmailTimerActive(false)
                              }}
                              variant="outline"
                              className="w-full"
                            >
                              ← Tạo đề mới
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
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
