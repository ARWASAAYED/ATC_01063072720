import axios from 'axios';

// Default base URL (fallback)
let baseURL = 'http://localhost:9881/api';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Initialize baseURL by fetching the backend port
async function initializeBaseUrl(maxRetries = 5, retryDelay = 1000) {
  const possiblePorts = [9876, 9877, 9878, 9879, 9880, 9881];
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (const port of possiblePorts) {
      try {
        const response = await fetch(`http://localhost:${port}/api/port`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const { port: actualPort } = await response.json();
          baseURL = `http://localhost:${actualPort}/api`;
          api.defaults.baseURL = baseURL;
          console.log('Backend port set to:', actualPort);
          return;
        }
      } catch (err) {
        console.warn(`Attempt ${attempt}: Failed to fetch port ${port}:`, err.message);
      }
    }
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  console.error('Failed to fetch backend port after retries, using default:', baseURL);
}

// Call initialization
initializeBaseUrl();

// Add a request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email, password, rememberMe = false) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (rememberMe) {
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateUserProfile: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response.data;
  },
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/updatepassword', { currentPassword, newPassword });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

// Event API calls
export const eventAPI = {
  getEvents: async (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await api.get(`/events?${queryString}`);
    return response.data;
  },
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  createEvent: async (eventData) => {
   
    const isFormData = eventData instanceof FormData;
    
    const response = await axios({
      method: 'POST',
      url: `${api.defaults.baseURL}/events`,
      data: eventData,
      headers: {
       
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
      
        'Content-Type': isFormData ? undefined : 'application/json',
      }
    });
    
    return response.data;
  },
  updateEvent: async (id, eventData) => {
    // Similar approach for updates with FormData
    const isFormData = eventData instanceof FormData;
    
    const response = await axios({
      method: 'PUT',
      url: `${api.defaults.baseURL}/events/${id}`,
      data: eventData,
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
        'Content-Type': isFormData ? undefined : 'application/json',
      }
    });
    
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};


// Venue API calls
export const venueAPI = {
  getVenues: async () => {
    const response = await api.get('/venues');
    return response.data;
  },
  getVenue: async (id) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },
  createVenue: async (venueData) => {
    const isFormData = venueData instanceof FormData;
    const response = await api.post('/venues', venueData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
  deleteVenue: async (id) => {
    const response = await api.delete(`/venues/${id}`);
    return response.data;
  },
  updateVenue: async (id, venueData) => {
    const isFormData = venueData instanceof FormData;
    const response = await api.put(`/venues/${id}`, venueData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
};

// Speaker API calls

export const speakerAPI = {
  getSpeakers: async () => {
    const response = await api.get('/speakers');
    return response.data;
  },
  getSpeaker: async (id) => {
    const response = await api.get(`/speakers/${id}`);
    return response.data;
  },
  createSpeaker: async (speakerData) => {
    const isFormData = speakerData instanceof FormData;
    const response = await api.post('/speakers', speakerData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
  deleteSpeaker: async (id) => {
    const response = await api.delete(`/speakers/${id}`);
    return response.data;
  },
  updateSpeakers: async (id, speakerData) => {
    const isFormData = speakerData instanceof FormData;
    const response = await api.put(`/speakers/${id}`, speakerData, {
      headers: {
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
};



// Booking API calls
export const bookingAPI = {
  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getBooking: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  cancelBooking: async (id) => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;