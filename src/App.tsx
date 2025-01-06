import React, { useState, useEffect } from 'react';
import { MonthCard } from './components/MonthCard';
import { authService } from './services/authService';
import { calendarService } from './services/calendarService';
import { Month } from './types/calendar';
import styled from 'styled-components';
import { Login } from './components/Login';
import { MonthModal } from './components/MonthModal';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { TaskManager } from './components/TaskManager';


const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'my-super-complex-secret-key-2024-!@#$%^&*';
const TOKEN_EXPIRY = '24h';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const CalendarContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const CalendarTitle = styled.h1`
  text-align: center;
  color: #4c1d95;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const CategoryTag = styled.button<{ active: boolean }>`
  padding: 4px 12px;
  border-radius: 15px;
  background: ${props => props.active ? '#4f46e5' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#1f2937'};
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #4338ca;
  }
`;

interface MonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Month) => void;
  initialData?: Month | undefined;
}

function App() {
  const [months, setMonths] = useState<Month[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<Month | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      const tokenExpiry = localStorage.getItem('tokenExpiry');

      if (!token || !tokenExpiry) {
        navigate('/login');
        return;
      }

      if (Date.now() > parseInt(tokenExpiry)) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        navigate('/login');
        return;
      }

      const isValid = await authService.verifyToken(token);
      if (!isValid) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        navigate('/login');
      }
    };

    // Auth gerektirmeyen route'lar
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (!publicRoutes.some(route => location.pathname.startsWith(route))) {
      checkToken();
    }
  }, [location, navigate]);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
      authService.setupAxiosInterceptors();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initializeMonths();
      loadMonths();
    }
  }, [isAuthenticated]);

  const initializeMonths = async () => {
    try {
      const initializedMonths = await calendarService.initializeMonths();
      setMonths(initializedMonths);
    } catch (err) {
      console.error('Aylar oluşturulurken hata:', err);
    }
  };

  const loadMonths = async () => {
    try {
      setIsLoading(true);
      const data = await calendarService.getAllMonths();
      setMonths(data);
      setError(null);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayClick = (dateKey: string) => {
    if (!selectedDays) return;
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(dateKey)) {
      newSelectedDays.delete(dateKey);
    } else {
      newSelectedDays.add(dateKey);
    }
    setSelectedDays(newSelectedDays);
  };

  const handleAddMonth = async (monthData: Omit<Month, 'id'>) => {
    try {
      await calendarService.createMonth(monthData);
      loadMonths();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Ay eklenirken hata oluştu:', err);
    }
  };

  const handleEditMonth = async (monthData: Month) => {
    if (!editingMonth?.id) return;
    try {
      await calendarService.updateMonth(editingMonth.id, monthData);
      loadMonths();
      setIsModalOpen(false);
      setEditingMonth(null);
    } catch (err) {
      console.error('Ay güncellenirken hata oluştu:', err);
    }
  };

  const handleDeleteMonth = async (id: string) => {
    if (!window.confirm('Bu ayı silmek istediğinizden emin misiniz?')) return;
    try {
      await calendarService.deleteMonth(id);
      loadMonths();
    } catch (err) {
      console.error('Ay silinirken hata oluştu:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
      </Routes>
    );
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-4">
          <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xl font-medium text-gray-700">Yükleniyor...</span>
        </div>
      </div>
    </div>
  );
  if (error) return <div>Hata: {error}</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppContainer>
            <CalendarContainer>
              <div className="flex justify-between items-center mb-6">
                <CalendarTitle>
                  13 Aylık Takvim
                </CalendarTitle>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsTaskManagerOpen(true)}
                    className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Görev Ekle
                  </button>
                  <button
                    onClick={() => {
                      authService.logout();
                      setIsAuthenticated(false);
                      navigate('/login');
                    }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Çıkış Yap
                  </button>
                </div>
              </div>

              <TaskManager 
                isOpen={isTaskManagerOpen}
                onClose={() => setIsTaskManagerOpen(false)}
                onOpen={() => setIsTaskManagerOpen(true)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {months.map((month) => (
                  <MonthCard
                    key={month.id}
                    month={month}
                    onUpdate={loadMonths}
                  />
                ))}
              </div>
            </CalendarContainer>

            <MonthModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setEditingMonth(null);
              }}
              onSubmit={editingMonth ? handleEditMonth : handleAddMonth}
              initialData={editingMonth || undefined}
            />
          </AppContainer>
        }
      />
    </Routes>
  );
}

export default App;