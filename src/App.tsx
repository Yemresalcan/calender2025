import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import MonthCard from './components/MonthCard';
import { authService } from './services/authService';
import { calendarService } from './services/calendarService';
import { Month } from './types/calendar';
import styled from 'styled-components';
import { Login } from './components/Login';
import { MonthModal } from './components/MonthModal';

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

function App() {
  const [months, setMonths] = useState<Month[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<Month | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setIsAuthenticated(true);
      authService.setupAxiosInterceptors();
      loadMonths();
    }
  }, []);

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
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <AppContainer>
      <CalendarContainer>
        <CalendarTitle>
          13 Aylık Takvim
          <Button onClick={() => setIsModalOpen(true)}>Yeni Ay Ekle</Button>
        </CalendarTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((month, index) => (
            <MonthCard
              key={month.id}
              month={month}
              isSelected={selectedMonth === index}
              selectedDays={selectedDays}
              onDayClick={handleDayClick}
              onClick={() => setSelectedMonth(index)}
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
        initialData={editingMonth}
      />
    </AppContainer>
  );
}

export default App;