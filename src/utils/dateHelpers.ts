export const getDaysInMonth = () => {
  return Array.from({ length: 28 }, (_, i) => i + 1);
};

export const getWeekRanges = (month: { name: string }) => {
  // Her ay için 25'inden başlayarak 4 hafta
  const monthNumbers: { [key: string]: number } = {
    "Ocak": 1, "Şubat": 2, "Mart": 3, "Nisan": 4,
    "Mayıs": 5, "Haziran": 6, "Temmuz": 7, "Ağustos": 8,
    "Eylül": 9, "Ekim": 10, "Kasım": 11, "Aralık": 12,
    "Yes": 13
  };

  const monthNum = monthNumbers[month.name];
  
  return Array.from({ length: 4 }, (_, index) => {
    const weekNum = (monthNum * 4) - 3 + index;
    return `25-${weekNum.toString().padStart(2, '0')}`;
  });
};