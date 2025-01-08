import React, { useState, useEffect } from 'react';
import { calendarService } from '../services/calendarService';

interface TaskManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

interface Month {
  id: string;
  name: string;
  order: number;
}

interface WeeklyTask {
  id: string;
  monthId: string;
  weekNumber: number;
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

export function TaskManager({ isOpen, onClose, onOpen }: TaskManagerProps) {
  const [months, setMonths] = useState<Month[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [taskText, setTaskText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<WeeklyTask | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMonths();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMonth) {
      loadTasks(selectedMonth);
    }
  }, [selectedMonth]);

  useEffect(() => {
    const handleEditTask = (event: CustomEvent<WeeklyTask>) => {
      if (event.detail) {
        onOpen();
        setSelectedMonth(event.detail.monthId);
        setSelectedWeek(event.detail.weekNumber.toString());
        setTaskText(event.detail.taskText);
        setSelectedColor(event.detail.color);
        setEditingTask(event.detail);
      }
    };
    
    window.addEventListener('editTask', handleEditTask as EventListener);
    return () => window.removeEventListener('editTask', handleEditTask as EventListener);
  }, [onOpen]);

  const handleEditTask = (task: WeeklyTask) => {
    setSelectedMonth(task.monthId);
    setSelectedWeek(task.weekNumber.toString());
    setTaskText(task.taskText);
    setSelectedColor(task.color);
    setEditingTask(task);
  };

  const loadMonths = async () => {
    try {
      const response = await calendarService.getAllMonths();
      setMonths(response);
    } catch (error) {
      console.error('Aylar yüklenirken hata:', error);
    }
  };

  const loadTasks = async (monthId: string) => {
    try {
      const response = await calendarService.getWeeklyTasks(monthId);
      setTasks(response);
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error);
    }
  };

  const getWeekDates = (monthName: string, monthOrder: number) => {
    const startWeek = (monthOrder - 1) * 4 + 1;
    return [
      { value: startWeek.toString(), label: `25-${startWeek.toString().padStart(2, '0')} ${monthName}` },
      { value: (startWeek + 1).toString(), label: `25-${(startWeek + 1).toString().padStart(2, '0')} ${monthName}` },
      { value: (startWeek + 2).toString(), label: `25-${(startWeek + 2).toString().padStart(2, '0')} ${monthName}` },
      { value: (startWeek + 3).toString(), label: `25-${(startWeek + 3).toString().padStart(2, '0')} ${monthName}` }
    ];
  };

  const handleAddTask = async () => {
    if (!selectedMonth || !selectedWeek || !taskText.trim()) return;

    setIsLoading(true);
    try {
      const weekNumber = parseInt(selectedWeek);
      const weekInMonth = ((weekNumber - 1) % 4) + 1; // 1-4 arası
      const startDay = ((weekInMonth - 1) * 7) + 1; // Her haftanın başlangıç günü
      const days = Array.from({ length: 7 }, (_, i) => startDay + i); // 7 günlük hafta

      await calendarService.addWeeklyTask({
        monthId: selectedMonth,
        weekNumber: weekInMonth, // Ay içindeki hafta numarası
        startDate: `2025-${months.find(m => m.id === selectedMonth)?.order.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`,
        endDate: `2025-${months.find(m => m.id === selectedMonth)?.order.toString().padStart(2, '0')}-${(startDay + 6).toString().padStart(2, '0')}`,
        days: days,
        color: selectedColor,
        taskText: taskText.trim()
      });

      await loadTasks(selectedMonth);
      setTaskText('');
      setSelectedWeek('');
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error('Görev eklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !selectedMonth || !selectedWeek || !taskText.trim()) return;

    setIsLoading(true);
    try {
      const weekNumber = parseInt(selectedWeek);
      const startDay = (weekNumber - 1) * 7 + 1;
      const days = Array.from({ length: 7 }, (_, i) => startDay + i);

      await calendarService.updateWeeklyTask(editingTask.id, {
        monthId: selectedMonth,
        weekNumber,
        startDate: `2025-01-${startDay.toString().padStart(2, '0')}`,
        endDate: `2025-01-${(startDay + 6).toString().padStart(2, '0')}`,
        days,
        color: selectedColor,
        taskText: taskText.trim()
      });

      await loadTasks(selectedMonth);
      setTaskText('');
      setSelectedWeek('');
      setEditingTask(null);
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    try {
      await calendarService.deleteWeeklyTask(taskId);
      await loadTasks(selectedMonth);
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error('Görev silinirken hata:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Görev Yönetimi</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Ay Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ay Seçin
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Ay seçin...</option>
                {months.map((month) => (
                  <option key={month.id} value={month.id}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hafta Seçimi */}
            {selectedMonth && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hafta Seçin
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Hafta seçin...</option>
                  {getWeekDates(
                    months.find(m => m.id === selectedMonth)?.name || '',
                    months.find(m => m.id === selectedMonth)?.order || 1
                  ).map((week) => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Görev Girişi */}
            {selectedWeek && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                <button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  disabled={isLoading}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading ? (editingTask ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingTask ? 'Görevi Güncelle' : 'Görev Ekle')}
                </button>
              </>
            )}

            {/* Görev Listesi */}
            {tasks.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Mevcut Görevler</h3>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg border flex justify-between items-center"
                      style={{ borderLeftColor: task.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex-1">
                        <span>{task.taskText}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {task.startDate} - {task.endDate}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 