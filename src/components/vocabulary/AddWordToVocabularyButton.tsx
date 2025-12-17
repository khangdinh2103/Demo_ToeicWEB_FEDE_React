"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BookmarkPlus } from "lucide-react"
import AddVocabularyModal from "./AddVocabularyModal"

interface AddWordToVocabularyButtonProps {
  word?: string
  sourceId?: string
  sourceType?: 'Test' | 'Question'
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
}

/**
 * Button component để thêm từ vào personal vocabulary
 * Có thể dùng trong test page, reading page, etc.
 */
export default function AddWordToVocabularyButton({
  word,
  sourceId,
  sourceType,
  className = "",
  size = "sm",
  variant = "ghost"
}: AddWordToVocabularyButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedText, setSelectedText] = useState(word || "")

  const handleClick = () => {
    // Nếu không có word được truyền vào, lấy text selection
    if (!word) {
      const selection = window.getSelection()
      const text = selection?.toString().trim()
      if (text) {
        setSelectedText(text)
      }
    }
    setShowModal(true)
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={size}
              variant={variant}
              onClick={handleClick}
              className={className}
            >
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Thêm vào bộ từ cá nhân</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AddVocabularyModal
        open={showModal}
        onOpenChange={setShowModal}
        initialWord={selectedText}
        sourceId={sourceId}
        sourceType={sourceType}
      />
    </>
  )
}
