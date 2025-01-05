import React from 'react';
import styled from 'styled-components';
import { Week, Month } from '../types/calendar';

interface DayGridProps {
  month: string;
  selectedDays: Set<string>;
  onDayClick: (dateKey: string) => void;
  weeks: Week[];
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: 16px;
`;

const Day = styled.div<{ isSelected: boolean; isInWeek: boolean; weekColor?: string }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  background: ${props => props.isSelected 
    ? '#4f46e5' 
    : props.isInWeek 
      ? `${props.weekColor}33`
      : '#f3f4f6'};
  color: ${props => props.isSelected ? 'white' : '#1f2937'};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

export function DayGrid({ month, selectedDays, onDayClick, weeks }: DayGridProps) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const selectedDaysArray = React.useMemo(() => {
    try {
      return Array.from(selectedDays || new Set<string>());
    } catch (error) {
      console.error('Selected days dönüşüm hatası:', error);
      return [];
    }
  }, [selectedDays]);

  const getWeekForDay = (day: number): Week | undefined => {
    return weeks.find(week => week.days.includes(day));
  };

  return (
    <Grid>
      {days.map(day => {
        const dateKey = `${month}-${day}`;
        const week = getWeekForDay(day);
        
        return (
          <Day
            key={day}
            isSelected={Boolean(selectedDaysArray?.includes(dateKey))}
            isInWeek={!!week}
            weekColor={week?.color}
            onClick={() => onDayClick(dateKey)}
          >
            {day}
          </Day>
        );
      })}
    </Grid>
  );
}

export default DayGrid;