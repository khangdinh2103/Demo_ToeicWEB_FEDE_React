/**
 * Format date to relative time or absolute date
 * If within 30 days: show relative time (e.g., "2 ngày trước")
 * If more than 30 days: show absolute date (e.g., "15/10/2024")
 */
export function formatLastLogin(dateString: string | null | undefined): string {
  if (!dateString) {
    return 'Chưa đăng nhập'
  }

  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  // Less than 1 hour
  if (diffInMinutes < 60) {
    if (diffInMinutes < 1) {
      return 'Vừa xong'
    }
    return `${diffInMinutes} phút trước`
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  // Less than 30 days
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`
  }

  // More than 30 days - show absolute date
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return '-'
  }

  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
