import { useState } from 'react';
import { formatDateDisplay, isPastDate, isCutoffPassed } from '../utils/dates';
import api from '../api';
import toast from 'react-hot-toast';

export default function MealSelector({ date, currentMeals = [], onUpdate }) {
  const [loading, setLoading] = useState(false);

  if (!date) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-surface-200/40 border border-surface-100 p-6 text-center">
        <div className="text-surface-300 mb-2">
          <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <p className="text-sm text-surface-400">Select a date from calendar</p>
      </div>
    );
  }

  const past = isPastDate(date);
  const lunchMarked = currentMeals.includes('lunch');
  const dinnerMarked = currentMeals.includes('dinner');
  const lunchCutoff = isCutoffPassed(date, 'lunch');
  const dinnerCutoff = isCutoffPassed(date, 'dinner');

  const handleMark = async (meal) => {
    setLoading(true);
    try {
      const { data } = await api.post('/attendance/mark', { date, meals: [meal] });
      const r = data.results[0];
      if (r.status === 'success') {
        toast.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} marked!`);
        onUpdate();
      } else {
        toast.error(r.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (meal) => {
    setLoading(true);
    try {
      const { data } = await api.post('/attendance/cancel', { date, meals: [meal] });
      const r = data.results[0];
      if (r.status === 'success') {
        toast.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} cancelled`);
        onUpdate();
      } else {
        toast.error(r.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const MealRow = ({ type, label, icon, marked, cutoffPassed, color }) => (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
      marked
        ? `${color.bg} ${color.border} ${color.ring}`
        : 'bg-surface-50 border-surface-200'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className={`font-semibold text-sm ${marked ? color.text : 'text-surface-700'}`}>{label}</p>
          <p className="text-[11px] text-surface-400">
            Cutoff: {type === 'lunch' ? '8:00 AM' : '4:00 PM'}
            {cutoffPassed && <span className="text-red-400 ml-1">• Locked</span>}
          </p>
        </div>
      </div>
      <div>
        {past ? (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${marked ? `${color.badge}` : 'bg-surface-200 text-surface-500'}`}>
            {marked ? 'Present' : 'Absent'}
          </span>
        ) : marked ? (
          <button
            onClick={() => handleCancel(type)}
            disabled={loading || cutoffPassed}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => handleMark(type)}
            disabled={loading || cutoffPassed}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-40 transition-colors ${color.btn}`}
          >
            Mark
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-surface-200/40 border border-surface-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-surface-800">{formatDateDisplay(date)}</h3>
        {past && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 bg-surface-100 px-2 py-0.5 rounded-md">Past</span>
        )}
      </div>
      <div className="p-3 space-y-2">
        <MealRow
          type="lunch"
          label="Lunch"
          icon="☀️"
          marked={lunchMarked}
          cutoffPassed={lunchCutoff}
          color={{
            bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-1 ring-emerald-200',
            text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700',
            btn: 'bg-emerald-500 hover:bg-emerald-600',
          }}
        />
        <MealRow
          type="dinner"
          label="Dinner"
          icon="🌙"
          marked={dinnerMarked}
          cutoffPassed={dinnerCutoff}
          color={{
            bg: 'bg-violet-50', border: 'border-violet-200', ring: 'ring-1 ring-violet-200',
            text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700',
            btn: 'bg-violet-500 hover:bg-violet-600',
          }}
        />
      </div>
    </div>
  );
}
