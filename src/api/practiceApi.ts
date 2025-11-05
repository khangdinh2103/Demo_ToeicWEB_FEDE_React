import axios from 'axios'

const API_BASE_URL = 'http://localhost:3090/api/admin'

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}` }
}

// ===== VOCABULARY API =====

export const vocabularyApi = {
  // Get all vocabulary sets
  getAllSets: async () => {
    const response = await axios.get(`${API_BASE_URL}/vocabulary/sets`, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Get vocabulary set by ID
  getSetById: async (setId: string) => {
    const response = await axios.get(`${API_BASE_URL}/vocabulary/sets/${setId}`, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Create new vocabulary set
  createSet: async (data: {
    part_of_speech: string
    day_number: number
    title: string
    description?: string
    is_free?: boolean
  }) => {
    const response = await axios.post(`${API_BASE_URL}/vocabulary/sets`, data, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Add flashcards to set
  addFlashCards: async (setId: string, cards: any[]) => {
    const response = await axios.post(
      `${API_BASE_URL}/vocabulary/sets/${setId}/cards`,
      { cards },
      { headers: getAuthHeader() }
    )
    return response.data
  },

  // Delete flashcards from set
  deleteFlashCards: async (setId: string, cardIds: string[]) => {
    const response = await axios.delete(
      `${API_BASE_URL}/vocabulary/sets/${setId}/cards`,
      {
        headers: getAuthHeader(),
        data: { cardIds }
      }
    )
    return response.data
  },

  // Delete vocabulary sets
  deleteSets: async (setIds: string[]) => {
    const response = await axios.delete(`${API_BASE_URL}/vocabulary/sets`, {
      headers: getAuthHeader(),
      data: { setIds }
    })
    return response.data
  }
}

// ===== DICTATION API =====

export const dictationApi = {
  // Get all dictations
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/dictations`, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Get dictation by ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/dictations/${id}`, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Create new dictation
  create: async (data: {
    title: string
    youtubeVideoId: string
  }) => {
    const response = await axios.post(`${API_BASE_URL}/dictations`, data, {
      headers: getAuthHeader()
    })
    return response.data
  },

  // Delete dictations
  delete: async (lessonIds: string[]) => {
    const response = await axios.delete(`${API_BASE_URL}/dictations`, {
      headers: getAuthHeader(),
      data: { lessonIds }
    })
    return response.data
  }
}
