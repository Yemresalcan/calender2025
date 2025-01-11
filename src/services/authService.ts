import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5153/api';

interface LoginResponse {
  token: string;
  username: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/Auth/login`, credentials);
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiry', this.getTokenExpiry().toString());
        this.setupAxiosInterceptors();
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Giriş başarısız');
      }
      throw error;
    }
  },

  async register(data: RegisterData): Promise<void> {
    try {
      await axios.post(`${API_URL}/Auth/register`, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Kayıt başarısız');
      }
      throw error;
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/Auth/verify`, { token }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.isValid;
    } catch {
      return false;
    }
  },

  getTokenExpiry(): number {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    return Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000; // 30 gün veya 24 saat
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setupAxiosInterceptors() {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('username');
    delete axios.defaults.headers.common['Authorization'];
  }
}; 