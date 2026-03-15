import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import MealSelector from '../components/MealSelector';
import UpcomingMeals from '../components/UpcomingMeals';
import api from '../api';
import { getISTNow, getMonthStr } from '../utils/dates';

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [upcoming, setUpcoming] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const ist = getISTNow();
      const month = getMonthStr(ist);
      const [attRes, upRes] = await Promise.all([
        api.get(`/attendance/my?month=${month}`),
        api.get('/attendance/upcoming'),
      ]);
      setAttendance(attRes.data.attendance);
      setUpcoming(upRes.data.upcoming);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentMeals = selectedDate ? (attendance[selectedDate] || []) : [];

  return (
    <div className="min-h-dvh bg-surface-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4 page-enter">
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          attendance={attendance}
        />
        <MealSelector
          date={selectedDate}
          currentMeals={currentMeals}
          onUpdate={fetchData}
        />
        <UpcomingMeals meals={upcoming} />
      </main>
    </div>
  );
}
