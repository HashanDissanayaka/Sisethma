import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, getSubjects, getTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from '../services/db';
import { ArrowLeft, Plus, Trash2, Edit, CalendarDays, Clock, BookOpen, X, Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

const emptyForm = { day: 'Monday', time: '09:00', subject_id: '', grade: '6', teacher: '', room: '' };

const Timetable = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('6');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = authService.getCurrentUser();
    if (!u) { navigate('/login'); return; }
    setUser(u);
    if (u.role === 'student') setSelectedGrade(String(u.grade));
    const load = async () => {
      const [subs, tt] = await Promise.all([getSubjects(), getTimetable()]);
      setSubjects(subs.filter(s => s.isActive !== false));
      setEntries(tt);
    };
    load();
  }, [navigate]);

  const reload = async () => {
    const tt = await getTimetable();
    setEntries(tt);
  };

  const filteredEntries = entries.filter(e => String(e.grade) === selectedGrade);

  const getEntryForSlot = (day, time) =>
    filteredEntries.find(e => e.day === day && e.time === time);

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, grade: Number(form.grade), subject_id: form.subject_id ? Number(form.subject_id) : null };
    if (editingId) {
      await updateTimetableEntry(editingId, payload);
    } else {
      await addTimetableEntry(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    await reload();
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setForm({ day: entry.day, time: entry.time, subject_id: String(entry.subject_id || ''), grade: String(entry.grade), teacher: entry.teacher || '', room: entry.room || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this timetable entry?')) {
      await deleteTimetableEntry(id);
      await reload();
    }
  };

  const isAdmin = user?.role === 'admin';

  if (!user) return null;

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-3 bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <CalendarDays className="text-indigo-600" size={32} /> Class Timetable
              </h1>
              <p className="text-slate-500 mt-1">Weekly schedule for all classes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Grade Tabs */}
            {(isAdmin || user?.role === 'teacher') && (
              <div className="flex gap-2 flex-wrap">
                {[6,7,8,9,10,11].map(g => (
                  <button key={g} onClick={() => setSelectedGrade(String(g))}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedGrade === String(g) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
                  >Gr.{g}</button>
                ))}
              </div>
            )}
            {isAdmin && (
              <button onClick={() => { setShowForm(true); setEditingId(null); setForm({...emptyForm, grade: selectedGrade}); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">
                <Plus size={18} /> Add Entry
              </button>
            )}
          </div>
        </div>

        {/* Grade Label for students */}
        {user?.role === 'student' && (
          <div className="mb-4">
            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm">Grade {user.grade} Schedule</span>
          </div>
        )}

        {/* Timetable Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-3 font-bold text-left w-24 sticky left-0 bg-indigo-600 z-10">
                    <Clock size={14} className="inline mr-1" />Time
                  </th>
                  {DAYS.map(d => (
                    <th key={d} className="p-3 font-bold text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, idx) => {
                  const rowEntries = DAYS.map(d => getEntryForSlot(d, slot));
                  const hasAny = rowEntries.some(Boolean);
                  if (!hasAny && !isAdmin) return null;
                  return (
                    <tr key={slot} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-3 font-mono text-slate-400 text-xs font-bold sticky left-0 bg-inherit z-10 border-r border-slate-100">{slot}</td>
                      {DAYS.map(day => {
                        const entry = getEntryForSlot(day, slot);
                        return (
                          <td key={day} className="p-2 text-center align-middle min-w-[120px]">
                            {entry ? (
                              <div className="group relative bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-left transition hover:shadow-md hover:border-indigo-400">
                                <p className="font-bold text-indigo-800 text-xs leading-tight">
                                  {subjectMap[entry.subject_id] || 'Class'}
                                </p>
                                {entry.teacher && <p className="text-indigo-500 text-xs mt-0.5">{entry.teacher}</p>}
                                {entry.room && <p className="text-slate-400 text-xs">{entry.room}</p>}
                                {isAdmin && (
                                  <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                    <button onClick={() => handleEdit(entry)} className="p-1 bg-white rounded text-blue-500 hover:text-blue-700 shadow-sm"><Edit size={12} /></button>
                                    <button onClick={() => handleDelete(entry.id)} className="p-1 bg-white rounded text-red-500 hover:text-red-700 shadow-sm"><Trash2 size={12} /></button>
                                  </div>
                                )}
                              </div>
                            ) : isAdmin ? (
                              <button onClick={() => { setShowForm(true); setEditingId(null); setForm({...emptyForm, grade: selectedGrade, day, time: slot}); }}
                                className="w-full h-10 rounded-xl border border-dashed border-slate-200 text-slate-300 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50 transition flex items-center justify-center">
                                <Plus size={14} />
                              </button>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredEntries.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No timetable entries for Grade {selectedGrade} yet.</p>
              {isAdmin && <p className="text-sm mt-1">Click <strong>Add Entry</strong> or the <strong>+ icons</strong> in the grid to add classes.</p>}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200" /> Scheduled class
          {isAdmin && <><div className="w-4 h-4 rounded border border-dashed border-slate-300" /> Empty slot (click to add)</>}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-indigo-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                <CalendarDays size={20} className="text-indigo-500" />
                {editingId ? 'Edit Entry' : 'Add Timetable Entry'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Day</label>
                  <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                  <select value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Grade</label>
                  <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    {[1,2,3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                  <select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">— None —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Teacher Name</label>
                  <input type="text" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} placeholder="e.g. Mr. Perera" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Room / Hall</label>
                  <input type="text" value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="e.g. Room 3" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-60">
                  {saving ? 'Saving...' : <><Save size={16} /> Save Entry</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
