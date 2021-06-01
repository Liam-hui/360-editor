import axios from 'axios';

const api = axios.create({
  // baseURL: window.host_url,
  baseURL: 'http://dl.media/api/v1/',
});

api.interceptors.request.use((config) => {
  const headers = { ...config.headers };

  return { ...config, headers };
});

export default api;
