import React, { useState } from 'react';
import styled from 'styled-components';
import { Month, Week } from '../types/calendar';

interface MonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (month: Omit<Month, 'id'>) => void;
  initialData?: Month;
}

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &.primary {
    background: #4f46e5;
    color: white;
  }
  
  &.secondary {
    background: #9ca3af;
    color: white;
  }
`;

const WeekContainer = styled.div`
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
`;

export const MonthModal: React.FC<MonthModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [monthData, setMonthData] = useState<Omit<Month, 'id'>>(() => ({
    name: initialData?.name || '',
    weeks: initialData?.weeks || [
      {
        code: '',
        title: '',
        description: '',
        color: '#60a5fa',
        days: []
      }
    ]
  }));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(monthData);
  };

  const updateWeek = (index: number, weekData: Partial<Week>) => {
    const newWeeks = [...monthData.weeks];
    newWeeks[index] = { ...newWeeks[index], ...weekData };
    setMonthData({ ...monthData, weeks: newWeeks });
  };

  const addWeek = () => {
    setMonthData({
      ...monthData,
      weeks: [
        ...monthData.weeks,
        {
          code: '',
          title: '',
          description: '',
          color: '#60a5fa',
          days: []
        }
      ]
    });
  };

  const removeWeek = (index: number) => {
    const newWeeks = monthData.weeks.filter((_, i) => i !== index);
    setMonthData({ ...monthData, weeks: newWeeks });
  };

  return (
    <Modal>
      <ModalContent>
        <h2>{initialData ? 'Ayı Düzenle' : 'Yeni Ay Ekle'}</h2>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Ay Adı"
            value={monthData.name}
            onChange={e => setMonthData({ ...monthData, name: e.target.value })}
          />

          {monthData.weeks.map((week, index) => (
            <WeekContainer key={index}>
              <Input
                placeholder="Hafta Kodu"
                value={week.code}
                onChange={e => updateWeek(index, { code: e.target.value })}
              />
              <Input
                placeholder="Başlık"
                value={week.title}
                onChange={e => updateWeek(index, { title: e.target.value })}
              />
              <Input
                placeholder="Açıklama"
                value={week.description}
                onChange={e => updateWeek(index, { description: e.target.value })}
              />
              <Input
                type="color"
                value={week.color}
                onChange={e => updateWeek(index, { color: e.target.value })}
              />
              <Input
                placeholder="Günler (virgülle ayırın)"
                value={week.days.join(',')}
                onChange={e => updateWeek(index, { 
                  days: e.target.value.split(',').map(Number).filter(n => !isNaN(n)) 
                })}
              />
              <Button 
                type="button" 
                className="secondary"
                onClick={() => removeWeek(index)}
              >
                Haftayı Sil
              </Button>
            </WeekContainer>
          ))}

          <Button type="button" className="secondary" onClick={addWeek}>
            Hafta Ekle
          </Button>
          <Button type="submit" className="primary">
            {initialData ? 'Güncelle' : 'Ekle'}
          </Button>
          <Button type="button" className="secondary" onClick={onClose}>
            İptal
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
}; 