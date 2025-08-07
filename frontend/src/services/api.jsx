import axios from 'axios';

const BASE_URL = 'http://localhost/tripsquad/backend';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['authorization'] = `Bearer ${token}`;
  }
  return config;
});


export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth endpoints
export const login = (email, password) => 
  api.post('/auth/login.php', { email, password });

export const register = (name, email, password) => 
  api.post('/auth/register.php', { name, email, password });

// Trip endpoints
// export const createTrip = (tripData) => 
//   api.post('/trips/create.php', tripData);



export const createTrip = async (tripData) => {
  const token = localStorage.getItem('token'); // or get it from your AuthContext
  const response = await fetch('http://localhost/tripsquad/backend/trips/create.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tripData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create trip');
  }

  return data;
};





export const getTrips = () => {
  const token = localStorage.getItem('token');
  return axios.get("http://localhost/tripsquad/backend/trips/list.php", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};


export const getTripDetails = (tripId) => 
  api.get(`${BASE_URL}/trips/details.php?trip_id=${tripId}`);

// Expense endpoints
export const createExpense = (expenseData) => 
  api.post(`${BASE_URL}/expenses/create.php`, expenseData);

export const getExpenses = (tripId) => 
  api.get(`${BASE_URL}/expenses/list.php?trip_id=${tripId}`);

export const getBalance = (tripId) => 
  api.get(`${BASE_URL}/expenses/balance.php?trip_id=${tripId}`);

export default api;