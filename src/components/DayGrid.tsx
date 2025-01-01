import React from 'react';
import { getDaysInMonth } from '../utils/dateHelpers';
import styled from 'styled-components';
import { months } from '../utils/calendarData';

interface DayGridProps {
  selectedDays: Set<string>;
  month: string;
  onDayClick: (day: string) => void;
  onDayHover?: (weekData?: WeekData) => void;
}

const DayGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
`;

const DayCell = styled.div<{ weekColor?: string; isSelected: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  
  ${({ weekColor, isSelected }) => {
    if (isSelected) {
      return `
        background: ${weekColor || '#4f46e5'};
        color: white;
        font-weight: 600;
      `;
    }
    if (weekColor) {
      return `
        background: ${weekColor}20;
        color: ${weekColor};
        &:hover {
          background: ${weekColor}40;
        }
      `;
    }
    return `
      color: #4b5563;
      &:hover {
        background: #f3f4f6;
      }
    `;
  }}
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-weight: 500;
  color: #64748b;
  padding: 8px 0;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const EventDot = styled.div<{ color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-top: 2px;
`;

const DayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DayGrid: React.FC<DayGridProps> = ({ selectedDays, month, onDayClick, onDayHover }) => {
  const currentMonth = months.find(m => m.name === month);
  
  const getWeekData = (day: number): WeekData | undefined => {
    return currentMonth?.weeks.find(w => w.days.includes(day));
  };

  return (
    <DayGridContainer>
      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
        const dateKey = `${month}-${day.toString().padStart(2, '0')}`;
        const isSelected = selectedDays.has(dateKey);
        const weekData = getWeekData(day);
        
        return (
          <DayCell
            key={dateKey}
            onClick={() => {
              onDayClick(dateKey);
              onDayHover?.(weekData);
            }}
            isSelected={isSelected}
            weekColor={weekData?.color}
          >
            {day}
          </DayCell>
        );
      })}
    </DayGridContainer>
  );
};

export default DayGrid;