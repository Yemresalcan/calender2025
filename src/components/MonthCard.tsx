import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Month } from '../types/calendar';
import { calendarService } from '../services/calendarService';
import { TaskPopup } from './TaskPopup';
import { ConfirmDialog } from './ConfirmDialog';

interface MonthCardProps {
  month: {
    id: string;
    name: string;
    days: number;
    order: number;
    startDay: number;
  };
  onUpdate: () => void;
}

interface WeeklyTask {
  id: string;
  days: number[];
  color: string;
  taskText: string;
}

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-top: 1rem;
`;

const Day = styled.div<{ backgroundColor?: string }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.backgroundColor || '#f3f4f6'};
  border-radius: 4px;
  font-size: 0.875rem;
  color: ${props => props.backgroundColor ? 'white' : '#374151'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
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

export function MonthCard({ month, onUpdate }: MonthCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(month.name);
  const [isLoading, setIsLoading] = useState(false);
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<WeeklyTask | null>(null);
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [month.id]);

  useEffect(() => {
    const eventHandler = () => {
      loadTasks();
    };
    
    window.addEventListener('taskUpdated', eventHandler);
    return () => window.removeEventListener('taskUpdated', eventHandler);
  }, []);

  const loadTasks = async () => {
    try {
      const response = await calendarService.getWeeklyTasks(month.id);
      setTasks(response);
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error);
    }
  };

  const handleSave = async () => {
    if (newName.trim() === '') return;
    
    setIsLoading(true);
    try {
      await calendarService.updateMonth(month.id, {
        ...month,
        name: newName.trim()
      });
      setIsEditing(false);
      onUpdate(); // Ana komponenti güncelle
    } catch (error) {
      console.error('Ay güncellenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayClick = (day: number) => {
    const task = tasks.find(t => t.days.includes(day));
    if (task) {
      setSelectedTask(task);
      setIsTaskPopupOpen(true);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await calendarService.deleteWeeklyTask(selectedTask.id);
      await loadTasks();
      setIsTaskPopupOpen(false);
      setIsConfirmDialogOpen(false);
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error('Görev silinirken hata:', error);
    }
  };

  const renderCalendarDays = () => {
    const emptyDays = Array(month.startDay).fill(null);
    const monthDays = Array.from({ length: 28 }, (_, i) => i + 1);
    const allDays = [...emptyDays, ...monthDays];

    return (
      <>
        <WeekDays>
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <WeekDay key={day}>{day}</WeekDay>
          ))}
        </WeekDays>

        <DayGrid>
          {allDays.map((day, index) => {
            if (day === null) {
              return <Day key={`empty-${index}`} className="bg-gray-50" />;
            }

            const task = tasks.find(t => {
              if (!day) return false;
              
              return t.days.includes(day);
            });

            return (
              <Day 
                key={day}
                backgroundColor={task?.color}
                onClick={() => handleDayClick(day)}
                title={task ? task.taskText : undefined}
              >
                {day}
              </Day>
            );
          })}
        </DayGrid>
      </>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <div className="flex gap-2 items-center w-full">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
            >
              {isLoading ? '...' : 'Kaydet'}
            </button>
            <button
              onClick={() => {
                setNewName(month.name);
                setIsEditing(false);
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-800">{month.name}</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
            >
              Düzenle
            </button>
          </>
        )}
      </div>

      {renderCalendarDays()}

      {isTaskPopupOpen && selectedTask && (
        <TaskPopup
          task={selectedTask}
          onClose={() => setIsTaskPopupOpen(false)}
          onEdit={() => {
            window.dispatchEvent(new CustomEvent('editTask', { detail: selectedTask }));
          }}
          onDelete={() => setIsConfirmDialogOpen(true)}
        />
      )}

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Görevi Sil"
        message="Bu görevi silmek istediğinizden emin misiniz?"
        onConfirm={handleDeleteTask}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}