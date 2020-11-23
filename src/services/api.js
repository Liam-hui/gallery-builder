import axios from 'axios';

const api = axios.create({
  baseURL: 'http://gallerybuilder.itisdemo.com/api/',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {

  const headers = { ...config.headers };

  return { ...config, headers };
});

export default api;