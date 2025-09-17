import axios from 'axios';

import { toast } from 'react-toastify';
import { URLS } from '../utils/urls';
import UserStorage from './storage/auth';

const api = axios.create({
  baseURL: URLS.api
});

api.interceptors.response.use((e => e), reject => {
  if (reject?.response?.status === 401 && reject?.response?.data?.message === 'Unauthorized') {
    UserStorage.removeTokensAuth()
    toast("Token expirado! faça login novamente", { type: 'error' })
    // window.location.href = "/auth/login"
  }
  return Promise.reject(reject);
})
api.interceptors.request.use((config) => {
  const token = UserStorage.getTokenStorage()
  if (config.headers) {
    if (token !== null) {
      config.headers.Authorization = `Bearer ${token.access_token}`;
    }
  }
  return config;
});

export default api