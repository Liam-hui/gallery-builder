import axios from 'axios';

const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use(async (config) => {

  const headers = { ...config.headers };

  return { ...config, headers };
});

export default api;