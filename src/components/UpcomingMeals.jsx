import { formatDateDisplay } from '../utils/dates';

export default function UpcomingMeals({ meals = [] }) {
  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg shadow-surface-200/40 border border-surface-100 p-5 text-center">
        <p className="text-sm text-surface-400">No upcoming meals marked</p>
      </div>
    );
  }

  // Group by date
  const grouped = {};
  for (const m of meals) {
    if (!grouped[m.date]) grouped[m.date] = [];
    grouped[m.date].push(m.meal_type);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-surface-200/40 border border-surface-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-100">
        <h3 className="font-display font-bold text-surface-800">Upcoming Meals</h3>
      </div>
      <div className="divide-y divide-surface-100 max-h-64 overflow-y-auto">
        {Object.entries(grouped).slice(0, 10).map(([date, types]) => (
          <div key={date} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-surface-700">{formatDateDisplay(date)}</span>
            <div className="flex gap-1.5">
              {types.includes('lunch') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                  ☀️ Lunch
                </span>
              )}
              {types.includes('dinner') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-600">
                  🌙 Dinner
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
