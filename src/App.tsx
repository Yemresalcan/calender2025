import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import MonthCard from './components/MonthCard';
import { months } from './utils/calendarData';
import styled from 'styled-components';

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

function App() {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<Event[]>([]);

  const handleDayClick = (dateKey: string) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(dateKey)) {
      newSelectedDays.delete(dateKey);
    } else {
      newSelectedDays.add(dateKey);
    }
    setSelectedDays(newSelectedDays);
  };

  const handleWeekClick = (weekKey: string) => {
    const newSelectedWeeks = new Set(selectedWeeks);
    if (newSelectedWeeks.has(weekKey)) {
      newSelectedWeeks.delete(weekKey);
    } else {
      newSelectedWeeks.add(weekKey);
    }
    setSelectedWeeks(newSelectedWeeks);
  };

  const nextMonth = () => {
    setCurrentMonthIndex((prev) => (prev + 1) % 13);
  };

  const prevMonth = () => {
    setCurrentMonthIndex((prev) => (prev - 1 + 13) % 13);
  };

  return (
    <AppContainer>
      <CalendarContainer>
        <CalendarTitle>13 Aylık Takvim</CalendarTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((month, index) => (
            <MonthCard
              key={month.name}
              month={month}
              isSelected={selectedMonth === index}
              selectedDays={selectedDays}
              selectedWeeks={selectedWeeks}
              onDayClick={handleDayClick}
              onWeekClick={handleWeekClick}
              onClick={() => setSelectedMonth(index)}
              events={events}
            />
          ))}
        </div>
      </CalendarContainer>
    </AppContainer>
  );
}

export default App;