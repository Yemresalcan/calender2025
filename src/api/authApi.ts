import axios from 'axios';

const API_URL = 'https://calender2025api-production.up.railway.app/api/Auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Giriş başarısız');
      }
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<void> {
    try {
      await axios.post(`${API_URL}/register`, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Kayıt başarısız');
      }
      throw error;
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/verify`, { token });
      return response.data.isValid;
    } catch {
      return false;
    }
  },

  async forgotPassword(data: { email: string }): Promise<void> {
    try {
      await axios.post(`${API_URL}/forgot-password`, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'İşlem başarısız');
      }
      throw error;
    }
  },

  async resetPassword(data: { token: string; newPassword: string }): Promise<void> {
    try {
      await axios.post(`${API_URL}/reset-password`, data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Şifre sıfırlama başarısız');
      }
      throw error;
    }
  }
}; 