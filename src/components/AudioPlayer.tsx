import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, Play, Pause, RotateCcw } from "lucide-react"
import { Card } from "@/components/ui/card"

interface AudioPlayerProps {
  audioUrl: string
  title?: string
  autoPlay?: boolean
  onEnded?: () => void
  compact?: boolean
}

export default function AudioPlayer({ 
  audioUrl, 
  title = "Audio", 
  autoPlay = false,
  onEnded,
  compact = false
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (onEnded) onEnded()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [autoPlay, audioUrl])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    const audio = audioRef.current
    if (!audio) return
    
    audio.currentTime = 0
    audio.play()
    setIsPlaying(true)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    
    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    
    const newVolume = value[0]
    audio.volume = newVolume / 100
    setVolume(newVolume)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlayPause}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex-1 min-w-[100px]">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleRestart}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Nghe lại
          </Button>

          <Button
            onClick={togglePlayPause}
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Phát
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24 cursor-pointer"
            />
            <span className="text-sm text-muted-foreground w-10">
              {volume}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
