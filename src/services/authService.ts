import axios from 'axios';

const API_URL = 'http://localhost:5153/api';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    username: string;
}

export const authService = {
    async login(credentials: LoginDto): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/Auth/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    async register(userData: RegisterDto): Promise<AuthResponse> {
        const response = await axios.post(`${API_URL}/Auth/register`, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    setupAxiosInterceptors() {
        const token = this.getToken();
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }
}; 