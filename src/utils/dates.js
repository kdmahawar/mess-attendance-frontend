// Get current date in IST
export function getISTNow() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + istOffset);
}

export function getISTToday() {
  const ist = getISTNow();
  return formatDate(ist);
}

export function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export function getMonthStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Check if cutoff has passed
export function isCutoffPassed(dateStr, mealType) {
  const ist = getISTNow();
  const today = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);

  if (target > today) return false;
  if (target < today) return true;

  const hour = ist.getHours();
  const cutoff = mealType === 'lunch' ? 8 : 16;
  return hour >= cutoff;
}

export function isPastDate(dateStr) {
  const ist = getISTNow();
  const today = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  return target < today;
}
