const API_URL = 'https://calendar4jw-backend.onrender.com';

export const googleAPI = {
  getAuthUrl: async () => {
    const response = await fetch(`${API_URL}/auth/google`);
    return response.json();
  },
  
  getEvents: async (userId) => {
    const response = await fetch(`${API_URL}/api/events/${userId}`);
    return response.json();
  },
  
  createEvent: async (userId, event) => {
    const response = await fetch(`${API_URL}/api/events/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    return response.json();
  },
  
  deleteEvent: async (userId, eventId) => {
    await fetch(`${API_URL}/api/events/${userId}/${eventId}`, {
      method: 'DELETE'
    });
  }
};

export const caldavAPI = {
  connect: async (credentials) => {
    const response = await fetch(`${API_URL}/api/caldav/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },
  
  getEvents: async (caldavId) => {
    const response = await fetch(`${API_URL}/api/caldav/events/${caldavId}`);
    return response.json();
  }
};