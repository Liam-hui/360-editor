import axios from 'axios';

const api = axios.create({
  headers: { 'Content-Type': 'multipart/form-data' },
});

api.interceptors.request.use(async (config) => {

  config.baseURL = await getHostUrl();

  const headers = { ...config.headers };

  return { ...config, headers };
});

async function getHostUrl() {
  return window.host_url;
}

export default api;
