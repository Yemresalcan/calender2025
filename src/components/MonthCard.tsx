import React from 'react';
import DayGrid from './DayGrid';
import styled from 'styled-components';
import { Month } from '../types/calendar';

interface MonthCardProps {
  month: Month;
  isSelected: boolean;
  selectedDays: Set<string>;
  onDayClick: (day: string) => void;
  onClick: () => void;
}

const MonthCardContainer = styled.div<{ isSelected: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.isSelected 
    ? '0 0 0 2px #4f46e5, 0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
    : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MonthHeader = styled.div`
  margin-bottom: 16px;
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 8px;
`;

const WeekContainer = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
`;

const WeekTitle = styled.h3`
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 4px;
`;

const WeekDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
`;

const MonthCard: React.FC<MonthCardProps> = ({
  month,
  isSelected,
  selectedDays,
  onDayClick,
  onClick,
}) => {
  const handleDayClick = (day: string) => {
    onDayClick(day);
  };

  return (
    <MonthCardContainer isSelected={isSelected} onClick={onClick}>
      <MonthHeader>
        <MonthTitle>{month.name}</MonthTitle>
      </MonthHeader>
      
      {month.weeks.map((week) => (
        <WeekContainer key={week.code}>
          <WeekTitle style={{ color: week.color }}>
            {week.title}
          </WeekTitle>
          <WeekDescription>
            {week.description}
          </WeekDescription>
        </WeekContainer>
      ))}
      
      <DayGrid
        month={month.name}
        selectedDays={selectedDays}
        onDayClick={handleDayClick}
        weeks={month.weeks}
      />
    </MonthCardContainer>
  );
};

export default MonthCard;