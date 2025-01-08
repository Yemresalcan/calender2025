import React, { useState, useEffect } from 'react';
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
  const [monthOrder, setMonthOrder] = useState(0);

  const getWeekDates = (monthName: string, monthOrder: number) => {
    // Her ay için 4 hafta, başlangıç haftası ayın sırasına göre belirlenir
    const startWeek = (monthOrder - 1) * 4 + 1;
    return [
      { value: startWeek.toString(), label: `25-${startWeek.toString().padStart(2, '0')} ${monthName}` },
      { value: (startWeek + 1).toString(), label: `25-${(startWeek + 1).toString().padStart(2, '0')} ${monthName}` },
      { value: (startWeek + 2).toString(), label: `25-${(startWeek + 2).toString().padStart(2, '0')} ${monthName}` },
      { value: (startWeek + 3).toString(), label: `25-${(startWeek + 3).toString().padStart(2, '0')} ${monthName}` }
    ];
  };

  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    // Seçili ayın adını al
    const fetchMonthName = async () => {
      try {
        const months = await calendarService.getAllMonths();
        const month = months.find(m => m.id === monthId);
        if (month) {
          setCurrentMonth(month.name);
          setMonthOrder(month.order);
        }
      } catch (error) {
        console.error('Ay bilgisi alınırken hata:', error);
      }
    };
    
    fetchMonthName();
  }, [monthId]);

  const handleAddTask = async () => {
    if (!selectedWeek || !taskText.trim()) return;

    try {
      const weekNumber = parseInt(selectedWeek);
      const weekInMonth = ((weekNumber - 1) % 4) + 1; // 1-4 arası
      const startDay = ((weekInMonth - 1) * 7) + 1; // Her haftanın başlangıç günü
      const days = Array.from({ length: 7 }, (_, i) => startDay + i); // 7 günlük hafta

      await calendarService.addWeeklyTask({
        monthId,
        weekNumber: weekInMonth, // Ay içindeki hafta numarası
        startDate: `2025-${monthOrder.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`,
        endDate: `2025-${monthOrder.toString().padStart(2, '0')}-${(startDay + 6).toString().padStart(2, '0')}`,
        days: days,
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
              {getWeekDates(currentMonth, monthOrder).map((week) => (
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