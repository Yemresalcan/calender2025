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

interface WeeklyTaskCreate {
  monthId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: number[];
  color: string;
  taskText: string;
}

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
    },

    async getWeeklyTasks(monthId: string): Promise<any[]> {
        try {
            const response = await axios.get(`${API_URL}/Months/${monthId}/tasks`);
            return response.data;
        } catch (error) {
            console.error('Görevler yüklenirken hata:', error);
            throw error;
        }
    },

    async addWeeklyTask(task: WeeklyTaskCreate): Promise<void> {
        try {
            await axios.post(`${API_URL}/Months/tasks`, {
                monthId: task.monthId,
                weekNumber: task.weekNumber,
                startDate: task.startDate,
                endDate: task.endDate,
                days: task.days,
                color: task.color,
                taskText: task.taskText
            });
        } catch (error) {
            console.error('Görev eklenirken hata:', error);
            throw error;
        }
    },

    async updateWeeklyTask(taskId: string, taskData: Partial<WeeklyTaskCreate>): Promise<void> {
        try {
            await axios.put(`${API_URL}/Months/tasks/${taskId}`, {
                monthId: taskData.monthId,
                weekNumber: taskData.weekNumber,
                startDate: taskData.startDate,
                endDate: taskData.endDate,
                days: taskData.days,
                color: taskData.color,
                taskText: taskData.taskText
            });
        } catch (error) {
            console.error('Görev güncellenirken hata:', error);
            throw error;
        }
    },

    async deleteWeeklyTask(taskId: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/Months/tasks/${taskId}`);
        } catch (error) {
            console.error('Görev silinirken hata:', error);
            throw error;
        }
    }
}; 