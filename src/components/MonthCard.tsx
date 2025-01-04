import React from 'react';
import styled from 'styled-components';
import { Month } from '../types/calendar';

interface MonthCardProps {
  month: {
    id: string;
    name: string;
    days: number;
    order: number;
  };
  onEdit: (month: any) => void;
}

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-top: 1rem;
`;

const Day = styled.div`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #374151;
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
`;

export function MonthCard({ month, onEdit }: MonthCardProps) {
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const days = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{month.name}</h3>
        <div className="space-x-2">
          <button
            onClick={() => onEdit(month)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
          >
            Düzenle
          </button>
        </div>
      </div>

      <WeekDays>
        {weekDays.map(day => (
          <WeekDay key={day}>{day}</WeekDay>
        ))}
      </WeekDays>

      <DayGrid>
        {days.map(day => (
          <Day key={day}>{day}</Day>
        ))}
      </DayGrid>
    </div>
  );
}