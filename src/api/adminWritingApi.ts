import axiosInstance from './axiosConfig'

export interface WritingPrompt {
  _id: string
  type: 'text' | 'image'
  required_words?: string[]
  image_url?: string
  image_description?: string
  created_by: string
  createdAt: string
  updatedAt: string
}

export interface CreateWritingPromptData {
  type: 'text' | 'image'
  required_words: string[] // Đúng 2 từ theo backend model
  image?: File
  image_description?: string
}

export interface UpdateWritingPromptData {
  type?: 'text' | 'image'
  required_words?: string[]
  image?: File
  remove_image?: boolean
  image_description?: string
}

// Tạo đề writing mới
export const createWritingPrompt = async (data: CreateWritingPromptData): Promise<WritingPrompt> => {
  const formData = new FormData()
  formData.append('type', data.type)
  
  // Gửi từng từ riêng lẻ thay vì JSON.stringify
  if (data.required_words && data.required_words.length > 0) {
    data.required_words.forEach(word => {
      formData.append('required_words[]', word)
    })
  }
  
  if (data.image) {
    formData.append('image', data.image)
  }

  const response = await axiosInstance.post('/admin/writing-prompts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data.data
}

// Cập nhật đề writing
export const updateWritingPrompt = async (
  id: string,
  data: UpdateWritingPromptData
): Promise<WritingPrompt> => {
  const formData = new FormData()
  
  if (data.type) {
    formData.append('type', data.type)
  }
  
  // Gửi từng từ riêng lẻ thay vì JSON.stringify
  if (data.required_words && data.required_words.length > 0) {
    data.required_words.forEach(word => {
      formData.append('required_words[]', word)
    })
  }
  
  if (data.image) {
    formData.append('image', data.image)
  }
  
  if (data.remove_image) {
    formData.append('remove_image', 'true')
  }
  
  if (data.image_description) {
    formData.append('image_description', data.image_description)
  }

  const response = await axiosInstance.patch(`/admin/writing-prompts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data.data
}

// Xóa đề writing
export const deleteWritingPrompt = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/writing-prompts/${id}`)
}

// Lấy danh sách tất cả đề writing
export const getAllWritingPrompts = async (): Promise<WritingPrompt[]> => {
  try {
    const response = await axiosInstance.get('/admin/writing-prompts')
    return response.data.data || []
  } catch (error) {
    console.error('Get writing prompts error:', error)
    return []
  }
}

export const adminWritingApi = {
  createWritingPrompt,
  updateWritingPrompt,
  deleteWritingPrompt,
  getAllWritingPrompts
}
