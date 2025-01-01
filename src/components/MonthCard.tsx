import React, { useState } from 'react';
import { MonthData } from '../utils/calendarData';
import DayGrid from './DayGrid';
import { getWeekRanges } from '../utils/dateHelpers';
import styled from 'styled-components';

interface MonthCardProps {
  month: MonthData;
  isSelected: boolean;
  selectedDays: Set<string>;
  selectedWeeks: Set<string>;
  onDayClick: (day: string) => void;
  onWeekClick: (week: string) => void;
  onClick: () => void;
  events: Event[];
}

const MonthCardContainer = styled.div<{ isSelected: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  ${({ isSelected }) => isSelected && `
    transform: scale(1.02);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.25);
    border: 2px solid #667eea;
  `}
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const MonthTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4c1d95;
  margin-bottom: 1rem;
  text-align: center;
`;

const WeekButton = styled.button<{ isSelected: boolean }>`
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  ${({ isSelected }) => isSelected ? `
    background: #667eea;
    color: white;
    font-weight: 600;
  ` : `
    color: #4b5563;
    &:hover {
      background: #f3f4f6;
    }
  `}
`;

const WeekContainer = styled.div<{ color: string }>`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.color};
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const WeekTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #4c1d95;
  margin-bottom: 0.5rem;
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TaskItem = styled.li<{ type: string }>`
  font-size: 0.9rem;
  color: #4b5563;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => 
      props.type === 'learning' ? '#60a5fa' : 
      props.type === 'project' ? '#34d399' : 
      '#f472b6'};
  }
`;

const WeekCodeButton = styled.button<{ color: string }>`
  text-align: left;
  padding: 0.5rem;
  width: 100%;
  color: ${props => props.color};
  font-size: 0.875rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  background: ${props => props.color}20;

  &:hover {
    background: ${props => props.color}40;
  }
`;

const WeekPopup = styled.div`
  position: absolute;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-width: 250px;
  margin-left: 1rem;
`;

const MonthCard: React.FC<MonthCardProps> = ({ 
  month, 
  isSelected, 
  selectedDays,
  onDayClick,
}) => {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<WeekData>();

  const handleDayClick = (dateKey: string) => {
    onDayClick(dateKey);
    const day = parseInt(dateKey.split('-')[1]);
    const weekData = month.weeks.find(w => w.days.includes(day));
    setActiveWeek(current => current?.code === weekData?.code ? undefined : weekData);
  };

  return (
    <MonthCardContainer isSelected={isSelected}>
      <MonthTitle>{month.name}</MonthTitle>
      
      <div className="space-y-1 mb-4 relative">
        {month.weeks.map(week => (
          <div key={week.code} style={{ position: 'relative' }}>
            <WeekCodeButton
              color={week.color}
              onMouseEnter={() => setHoveredWeek(week.code)}
              onMouseLeave={() => setHoveredWeek(null)}
            >
              {week.code}
            </WeekCodeButton>
            
            {hoveredWeek === week.code && (
              <WeekPopup>
                {week.title}
              </WeekPopup>
            )}
          </div>
        ))}
      </div>

      {activeWeek && (
        <WeekContainer color={activeWeek.color}>
          <WeekTitle>{activeWeek.title}</WeekTitle>
          <div className="text-sm text-gray-500 mb-2">
            Hafta: {activeWeek.code}
          </div>
          <p className="text-sm text-gray-600">
            {activeWeek.description}
          </p>
        </WeekContainer>
      )}
      
      <DayGrid
        month={month.name}
        selectedDays={selectedDays}
        onDayClick={handleDayClick}
      />
    </MonthCardContainer>
  );
};

export default MonthCard;