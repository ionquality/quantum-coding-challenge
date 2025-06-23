import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.APP_URL, // Backend API URL
    withCredentials: true, // Include cookies with requests
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;