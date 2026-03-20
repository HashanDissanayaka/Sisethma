import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, getSubjects, getModules, addQuiz, updateQuiz, getQuizzes } from '../services/db';
import { generateQuizQuestions } from '../services/gemini';
import { Sparkles, Save, ArrowLeft, Loader2, Trash2, Plus, BookOpen } from 'lucide-react';

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [existingQuizzes, setExistingQuizzes] = useState([]);

  const [form, setForm] = useState({ topic: '', grade: '6', subject_id: '', module_id: '', count: 5 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = authService.getCurrentUser();
    if (!u || (u.role !== 'admin' && u.role !== 'teacher')) {
      navigate('/dashboard');
      return;
    }
    setUser(u);
    const load = async () => {
      const [subs, mods, quizzes] = await Promise.all([getSubjects(), getModules(), getQuizzes()]);
      setSubjects(subs.filter(s => s.isActive !== false));
      setAllModules(mods);
      setExistingQuizzes(quizzes);
    };
    load();
  }, [navigate]);

  const filteredModules = allModules.filter(m =>
    (!form.subject_id || m.subject_id === Number(form.subject_id)) &&
    (!form.grade || m.grade === Number(form.grade))
  );

  const handleGenerate = async () => {
    if (!form.topic.trim()) { setError('Please enter a topic.'); return; }
    setError('');
    setLoading(true);
    setSaved(false);
    setQuestions([]);
    try {
      const qs = await generateQuizQuestions({ topic: form.topic, grade: form.grade, count: Number(form.count) });
      setQuestions(qs.map((q, i) => ({ ...q, id: i + 1 })));
    } catch (e) {
      setError('Failed to generate questions. Check your API key or try again. ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.module_id) { setError('Please select a module to attach this quiz to.'); return; }
    if (questions.length === 0) { setError('No questions to save.'); return; }
    setSaving(true);
    const payload = { module_id: Number(form.module_id), time_limit: 120, questions };
    const existing = existingQuizzes.find(q => q.module_id === Number(form.module_id));
    if (existing) {
      await updateQuiz(Number(form.module_id), { questions });
    } else {
      await addQuiz(payload);
    }
    setSaving(false);
    setSaved(true);
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to="/dashboard" className="p-3 bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Sparkles className="text-purple-500" size={32} /> AI Quiz Generator
            </h1>
            <p className="text-slate-500 mt-1">Generate intelligent quiz questions using Gemini AI and attach them to any module.</p>
          </div>
        </div>

        {/* Config Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" /> Generation Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Topic / Chapter *</label>
              <input
                type="text"
                value={form.topic}
                onChange={e => setForm({ ...form, topic: e.target.value })}
                placeholder="e.g. Photosynthesis, Quadratic Equations, World War 2..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Grade Level</label>
              <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value, module_id: '' })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                {[1,2,3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Number of Questions</label>
              <select value={form.count} onChange={e => setForm({ ...form, count: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                {[3,5,7,10].map(n => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Subject (for filtering)</label>
              <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value, module_id: '' })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                <option value="">— All subjects —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Attach to Module *</label>
              <select value={form.module_id} onChange={e => setForm({ ...form, module_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                <option value="">— Select module —</option>
                {filteredModules.map(m => <option key={m.id} value={m.id}>{m.title} (Gr.{m.grade})</option>)}
              </select>
            </div>
          </div>
          {error && <p className="mt-4 text-red-600 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {loading ? 'Generating...' : 'Generate with AI ✨'}
            </button>
          </div>
        </div>

        {/* Generated Questions Preview & Edit */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">Generated Questions — Review & Edit</h2>
              <span className="text-sm text-slate-400">{questions.length} questions</span>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Q{idx + 1}</span>
                    <button onClick={() => removeQuestion(idx)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateQuestion(idx, 'question', e.target.value)}
                    className="w-full font-bold text-slate-800 bg-transparent border-b border-slate-200 pb-2 mb-4 outline-none focus:border-purple-400"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${q.answer === opt ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={e => updateOption(idx, optIdx, e.target.value)}
                          className="flex-1 bg-transparent outline-none text-slate-700"
                        />
                        <button
                          onClick={() => updateQuestion(idx, 'answer', opt)}
                          className={`text-xs px-2 py-0.5 rounded font-bold shrink-0 ${q.answer === opt ? 'text-emerald-700' : 'text-slate-400 hover:text-emerald-600'}`}
                        >
                          {q.answer === opt ? '✓ Correct' : 'Set'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Save */}
            <div className="mt-6 flex justify-end gap-3">
              {saved && <p className="text-emerald-600 font-bold flex items-center gap-2 mr-auto">✓ Quiz saved successfully! Students can now access it in the module.</p>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-60"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Saving...' : 'Save Quiz to Module'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator;
