"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { 
  Play, Pause, Volume2, VolumeX, Settings, Maximize, 
  RotateCcw, RotateCw 
} from "lucide-react"

interface VideoPlayerProps {
  lesson: {
    id: number
    title: string
    duration: string
    videoUrl: string
    completed?: boolean
  }
  onComplete?: () => void
}

export default function VideoPlayer({ lesson, onComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0]
      videoRef.current.volume = newVolume / 100
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackRate(speed)
    }
  }

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleEnd = () => {
      setIsPlaying(false)
      onComplete?.()
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnd)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnd)
    }
  }, [onComplete])

  return (
    <div className="bg-black rounded-lg overflow-hidden relative group">
      <div className="relative aspect-video">
        {/* Fallback for YouTube videos */}
        {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="/placeholder.svg?height=360&width=640"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <source src={lesson.videoUrl} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>

            {/* Custom Video Controls */}
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePlayPause}
                  className="bg-black/30 hover:bg-black/50 text-white rounded-full p-4"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress Bar */}
                <div className="mb-3">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={handleTimeChange}
                    className="w-full"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipTime(-10)}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipTime(10)}
                      className="text-white hover:bg-white/20"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="w-20">
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={100}
                          step={1}
                          onValueChange={handleVolumeChange}
                        />
                      </div>
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Speed Control */}
                    <select
                      value={playbackRate}
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 bg-gray-900 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{lesson.title}</h3>
            <p className="text-sm text-gray-300">Thời lượng: {lesson.duration}</p>
          </div>
          <div className="flex items-center space-x-2">
            {lesson.completed && (
              <span className="text-green-400 text-sm">✓ Đã hoàn thành</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
