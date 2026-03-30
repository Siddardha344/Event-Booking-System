import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const eventsAPI = {
  getAll: (params) => API.get('/events', { params }),
  getById: (id) => API.get(`/events/${id}`),
  getAvailability: (id) => API.get(`/events/${id}/availability`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
};

export const bookingsAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: () => API.get('/bookings/my'),
  getById: (id) => API.get(`/bookings/${id}`),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
};

export const paymentsAPI = {
  createIntent: (data) => API.post('/payments/create-intent', data),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getBookings: (params) => API.get('/admin/bookings', { params }),
  getUsers: () => API.get('/admin/users'),
  featureEvent: (id, featured) => API.put(`/admin/events/${id}/feature`, { featured }),
};

export default API;
