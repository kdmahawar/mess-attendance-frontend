import { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../api';
import toast from 'react-hot-toast';
import { getISTNow, getMonthStr, formatDateDisplay } from '../utils/dates';

// ─── Tab: Attendance View ──────────────────────────────────
function AttendanceTab() {
  const ist = getISTNow();
  const todayStr = `${ist.getFullYear()}-${String(ist.getMonth()+1).padStart(2,'0')}-${String(ist.getDate()).padStart(2,'0')}`;
  const [date, setDate] = useState(todayStr);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDate = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await api.get(`/attendance/admin/date?date=${date}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDate(); }, [date]);

  const handleExport = async () => {
    try {
      const res = await api.get(`/attendance/admin/export?date=${date}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${date}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const MealCard = ({ title, icon, color, total, users }) => (
    <div className={`rounded-xl border p-4 ${color.bg} ${color.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h4 className={`font-display font-bold ${color.text}`}>{title}</h4>
        </div>
        <span className={`text-2xl font-display font-extrabold ${color.text}`}>{total}</span>
      </div>
      {users.length === 0 ? (
        <p className="text-xs text-surface-400">No one marked</p>
      ) : (
        <div className="space-y-1">
          {users.map((u, i) => (
            <div key={u.user_id} className="flex items-center gap-2 text-sm text-surface-700">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${color.badge}`}>
                {i + 1}
              </span>
              <span>{u.display_name}</span>
              <span className="text-surface-400 text-xs">@{u.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          />
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-surface-800 text-white text-xs font-semibold hover:bg-surface-700 transition-colors whitespace-nowrap"
        >
          📥 Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-surface-400 text-sm">Loading...</div>
      ) : data ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">
            {formatDateDisplay(data.date)}
          </p>
          <MealCard
            title="Lunch" icon="☀️" total={data.lunch.total} users={data.lunch.users}
            color={{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' }}
          />
          <MealCard
            title="Dinner" icon="🌙" total={data.dinner.total} users={data.dinner.users}
            color={{ bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-500' }}
          />
        </div>
      ) : null}
    </div>
  );
}

// ─── Tab: Monthly Summary ──────────────────────────────────
function SummaryTab() {
  const ist = getISTNow();
  const [month, setMonth] = useState(getMonthStr(ist));
  const [summary, setSummary] = useState({});

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/attendance/admin/summary?month=${month}`);
      setSummary(res.data.summary);
    } catch (err) {
      toast.error('Failed to load summary');
    }
  };

  useEffect(() => { fetchSummary(); }, [month]);

  const handleExportMonth = async () => {
    try {
      const res = await api.get(`/attendance/admin/export?month=${month}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${month}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Monthly CSV downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const entries = Object.entries(summary).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          />
        </div>
        <button
          onClick={handleExportMonth}
          className="px-4 py-2.5 rounded-xl bg-surface-800 text-white text-xs font-semibold hover:bg-surface-700 transition-colors whitespace-nowrap"
        >
          📥 Export
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-sm text-surface-400 py-6">No attendance data for this month</p>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-[10px] uppercase tracking-wider">
                <th className="text-left px-3 py-2.5 font-bold">Date</th>
                <th className="text-center px-3 py-2.5 font-bold">☀️ Lunch</th>
                <th className="text-center px-3 py-2.5 font-bold">🌙 Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {entries.map(([date, counts]) => (
                <tr key={date} className="hover:bg-surface-50 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-surface-700">{formatDateDisplay(date)}</td>
                  <td className="text-center px-3 py-2.5">
                    <span className="inline-block min-w-[28px] rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs py-0.5">
                      {counts.lunch || 0}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className="inline-block min-w-[28px] rounded-md bg-violet-50 text-violet-700 font-bold text-xs py-0.5">
                      {counts.dinner || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Manage Users ─────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', display_name: '', role: 'user' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setForm({ username: '', password: '', display_name: '', role: 'user' });
    setEditUser(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.display_name.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      if (editUser) {
        const updateData = { display_name: form.display_name, role: form.role };
        if (form.password.trim()) updateData.password = form.password;
        await api.put(`/users/${editUser.id}`, updateData);
        toast.success('User updated');
      } else {
        if (!form.username.trim() || !form.password.trim()) {
          toast.error('Username and password are required');
          return;
        }
        await api.post('/users', form);
        toast.success('User created');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This will also delete their attendance records.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: user.is_active ? 0 : 1 });
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const startEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, password: '', display_name: u.display_name, role: u.role });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Add/Edit Form */}
      {showForm ? (
        <div className="bg-white rounded-xl border border-surface-200 p-4 space-y-3">
          <h4 className="font-display font-bold text-sm text-surface-800">
            {editUser ? 'Edit User' : 'Add New User'}
          </h4>
          {!editUser && (
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
            />
          )}
          <input
            placeholder="Display Name"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
          />
          <input
            type="password"
            placeholder={editUser ? 'New password (leave blank to keep)' : 'Password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:border-brand-400 outline-none bg-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors">
              {editUser ? 'Update' : 'Create User'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 rounded-lg bg-surface-100 text-surface-600 text-xs font-semibold hover:bg-surface-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-surface-300 text-sm font-semibold text-surface-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
        >
          + Add New User
        </button>
      )}

      {/* User List */}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className={`bg-white rounded-xl border p-3 flex items-center justify-between transition-all ${
            u.is_active ? 'border-surface-200' : 'border-red-200 bg-red-50/50 opacity-70'
          }`}>
            <div>
              <p className="font-semibold text-sm text-surface-800">{u.display_name}</p>
              <p className="text-[11px] text-surface-400">@{u.username} • {u.role}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleToggleActive(u)}
                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                  u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}
              >
                {u.is_active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(u.id, u.display_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Page ─────────────────────────────────────────────
const TABS = [
  { key: 'attendance', label: 'Attendance', icon: '📋' },
  { key: 'summary', label: 'Summary', icon: '📊' },
  { key: 'users', label: 'Users', icon: '👥' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('attendance');

  return (
    <div className="min-h-dvh bg-surface-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-5 page-enter">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-surface-200 p-1 mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-surface-500 hover:bg-surface-50'
              }`}
            >
              <span className="mr-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'summary' && <SummaryTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
}
