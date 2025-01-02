import axios from 'axios';
import { Month } from '../types/calendar';

const API_URL = 'http://localhost:5153/api';

export const calendarService = {
    async getAllMonths(): Promise<Month[]> {
        const response = await axios.get(`${API_URL}/Months`);
        return response.data;
    },

    async getMonth(id: string): Promise<Month> {
        const response = await axios.get(`${API_URL}/Months/${id}`);
        return response.data;
    },

    async createMonth(month: Omit<Month, 'id'>): Promise<Month> {
        const response = await axios.post(`${API_URL}/Months`, month);
        return response.data;
    },

    async updateMonth(id: string, month: Month): Promise<void> {
        await axios.put(`${API_URL}/Months/${id}`, month);
    },

    async deleteMonth(id: string): Promise<void> {
        await axios.delete(`${API_URL}/Months/${id}`);
    }
}; 