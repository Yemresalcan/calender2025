import React, { useState } from 'react';
import { calendarService } from '../services/calendarService';

interface WeeklyTasksProps {
  monthId: string;
  onUpdate: () => void;
}

interface WeeklyTask {
  id: string;
  startDate: string;
  endDate: string;
  days: number[];
  color: string;
  taskText: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
];

export function WeeklyTasks({ monthId, onUpdate }: WeeklyTasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [taskText, setTaskText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const weeks = [
    { value: '1', label: '25-01 Ocak (1-7)' },
    { value: '2', label: '8-14 Ocak' },
    { value: '3', label: '15-21 Ocak' },
    { value: '4', label: '22-28 Ocak' }
  ];

  const handleAddTask = async () => {
    if (!selectedWeek || !taskText.trim()) return;

    try {
      const weekNumber = parseInt(selectedWeek);
      const startDay = (weekNumber - 1) * 7 + 1;
      const days = Array.from({ length: 7 }, (_, i) => startDay + i);

      await calendarService.addWeeklyTask({
        monthId,
        weekNumber,
        startDate: `2025-01-${startDay.toString().padStart(2, '0')}`,
        endDate: `2025-01-${(startDay + 6).toString().padStart(2, '0')}`,
        days,
        color: selectedColor,
        taskText: taskText.trim()
      });

      setIsAdding(false);
      setSelectedWeek('');
      setTaskText('');
      onUpdate();
    } catch (error) {
      console.error('Görev eklenirken hata:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Haftalık Görevler</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
        >
          + Görev Ekle
        </button>
      </div>

      {isAdding && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hafta Seç
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Hafta seçin...</option>
              {weeks.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Görev
            </label>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Görev açıklaması..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Renk
            </label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              İptal
            </button>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 