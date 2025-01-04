import axios from 'axios';
import { Month } from '../types/calendar';

const API_URL = 'http://localhost:5153/api';

// Axios interceptor'ı ekleyin
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const calendarService = {
    async getAllMonths(): Promise<Month[]> {
        try {
            const response = await axios.get(`${API_URL}/Months`);
            return response.data;
        } catch (error) {
            console.error('Aylar yüklenirken hata:', error);
            throw error;
        }
    },

    async getMonth(id: string): Promise<Month> {
        const response = await axios.get(`${API_URL}/Months/${id}`);
        return response.data;
    },

    async createMonth(monthData: Omit<Month, 'id'>): Promise<Month> {
        const response = await axios.post(`${API_URL}/Months`, monthData);
        return response.data;
    },

    async updateMonth(id: string, monthData: Month): Promise<void> {
        await axios.put(`${API_URL}/Months/${id}`, monthData);
    },

    async deleteMonth(id: string): Promise<void> {
        await axios.delete(`${API_URL}/Months/${id}`);
    },

    async initializeMonths(): Promise<Month[]> {
        try {
            const response = await axios.post<Month[]>(`${API_URL}/Months/initialize`);
            return response.data;
        } catch (error) {
            console.error('Aylar oluşturulurken hata:', error);
            throw error;
        }
    }
}; 