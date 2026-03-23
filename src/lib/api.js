import axios from 'axios'

const GAS_URL = import.meta.env.VITE_GAS_URL
let apiCount = 0

// Base API function
export const apiCall = async (action, payload = {}, showLoading = true) => {
  const token = localStorage.getItem('auth_token') || ''
  
  if (showLoading) {
      apiCount++
      if (apiCount === 1) window.dispatchEvent(new CustomEvent('apiLoadStart'))
  }
  
  try {
    const response = await axios.post(GAS_URL, JSON.stringify({
      action,
      payload,
      token
    }), {
      headers: {
        'Content-Type': 'text/plain' // Avoid CORS preflight with text/plain
      }
    })
    
    // GAS might return html if error (redirect error), check if json
    if (typeof response.data === 'string' && response.data.includes('<html')) {
      throw new Error('Google Apps Script Error. Please check permissions.')
    }
    
    if (response.data.error) {
       // Force logout if token is invalid
       if (response.data.forceLogout) {
           localStorage.removeItem('auth_token')
           window.location.reload()
       }
       throw new Error(response.data.error)
    }
    
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'API Request Failed')
    }
    throw error
  } finally {
      if (showLoading) {
          apiCount--
          if (apiCount === 0) window.dispatchEvent(new CustomEvent('apiLoadEnd'))
      }
  }
}
