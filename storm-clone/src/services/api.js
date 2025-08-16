const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001'

class ApiService {
  async request(endpoint, options = {} ) {
    const url = `${API_BASE_URL}/api${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return response
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Storm methods
  async createStorm(stormData) {
    return this.request('/storms', {
      method: 'POST',
      body: stormData,
    })
  }

  async getStorm(stormId) {
    return this.request(`/storms/${stormId}`)
  }

  async joinStorm(stormId, username) {
    return this.request(`/storms/${stormId}/join`, {
      method: 'POST',
      body: { username },
    })
  }

  async advancePhase(stormId) {
    return this.request(`/storms/${stormId}/advance-phase`, {
      method: 'POST',
    })
  }

  // Idea methods
  async submitIdea(stormId, ideaData) {
    return this.request(`/storms/${stormId}/ideas`, {
      method: 'POST',
      body: ideaData,
    })
  }

  async updateIdea(ideaId, ideaData) {
    return this.request(`/ideas/${ideaId}`, {
      method: 'PUT',
      body: ideaData,
    })
  }

  async deleteIdea(ideaId) {
    return this.request(`/ideas/${ideaId}`, {
      method: 'DELETE',
    })
  }

  // Vote methods
  async submitVote(ideaId, voteData) {
    return this.request(`/ideas/${ideaId}/vote`, {
      method: 'POST',
      body: voteData,
    })
  }

  // Session methods
  async getSession() {
    return this.request('/session')
  }

  async clearSession() {
    return this.request('/session', {
      method: 'DELETE',
    })
  }
}

export default new ApiService()

