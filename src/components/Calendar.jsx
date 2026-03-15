import { useState } from 'react';
import { getDaysInMonth, getFirstDayOfMonth, formatDate, getISTNow } from '../utils/dates';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar({ selectedDate, onSelectDate, attendance = {} }) {
  const ist = getISTNow();
  const [viewYear, setViewYear] = useState(ist.getFullYear());
  const [viewMonth, setViewMonth] = useState(ist.getMonth());

  const todayStr = formatDate(ist);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const goMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} />);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const meals = attendance[dateStr] || [];
    const hasLunch = meals.includes('lunch');
    const hasDinner = meals.includes('dinner');
    const hasMeals = hasLunch || hasDinner;

    cells.push(
      <button
        key={d}
        onClick={() => onSelectDate(dateStr)}
        className={`cal-cell relative flex flex-col items-center justify-center rounded-xl h-11 text-sm font-medium
          ${isSelected
            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
            : isToday
              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300'
              : 'text-surface-700 hover:bg-surface-100 active:bg-surface-200'
          }
        `}
      >
        <span>{d}</span>
        {hasMeals && !isSelected && (
          <div className="flex gap-0.5 mt-0.5">
            {hasLunch && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            {hasDinner && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </div>
        )}
        {hasMeals && isSelected && (
          <div className="flex gap-0.5 mt-0.5">
            {hasLunch && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
            {hasDinner && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-surface-200/40 border border-surface-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <button onClick={() => goMonth(-1)} className="p-2 rounded-lg hover:bg-surface-100 active:bg-surface-200 transition-colors">
          <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-display font-bold text-surface-800">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button onClick={() => goMonth(1)} className="p-2 rounded-lg hover:bg-surface-100 active:bg-surface-200 transition-colors">
          <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-surface-400 pb-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 px-3 pb-3">
        {cells}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2.5 bg-surface-50 border-t border-surface-100">
        <span className="flex items-center gap-1.5 text-[11px] text-surface-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Lunch
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-surface-500">
          <span className="w-2 h-2 rounded-full bg-violet-400" /> Dinner
        </span>
      </div>
    </div>
  );
}
