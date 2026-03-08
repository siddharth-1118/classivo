const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('classivo_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const apiService = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GET ${endpoint} failed (${response.status}):`, errorText);
        throw new Error(`API GET ${endpoint} failed: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error(`Fetch error for GET ${endpoint}:`, err);
      throw err;
    }
  },
  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`POST ${endpoint} failed (${response.status}):`, errorText);
        throw new Error(`API POST ${endpoint} failed: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error(`Fetch error for POST ${endpoint}:`, err);
      throw err;
    }
  }
};
