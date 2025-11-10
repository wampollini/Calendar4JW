export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  return { daysInMonth, startingDayOfWeek };
};

export const getWeekDates = (date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    weekDates.push(new Date(day));
  }
  return weekDates;
};

export const getNextDays = (count = 30) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};