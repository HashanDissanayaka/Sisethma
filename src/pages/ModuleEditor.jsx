import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { authService, addModule, updateModule, addQuiz, updateQuiz, getModules, getQuizzes } from '../services/db';
import { ArrowLeft, Save, Plus, Trash2, Video, FileText, HelpCircle } from 'lucide-react';

const ModuleEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const subjectIdParam = searchParams.get('subjectId');
  const gradeParam = searchParams.get('grade');
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    subject_id: null,
    grade: null,
    category: 'Foundation',
    description: '',
    videoUrl: '',
    notes: ''
  });

  const [questions, setQuestions] = useState([]);
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quizSettings, setQuizSettings] = useState({ time_limit: 300, max_attempts: 3 });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    if (isEditing) {
      const fetchData = async () => {
        const modules = await getModules();
        const existingModule = modules.find(m => m.id === parseInt(id));
        if (existingModule) {
          
          // Strip out the wrapping div we injected when saving notes
          let rawNotes = existingModule.content_json?.notes || '';
          if (rawNotes.startsWith('<div class="teacher-notes">')) {
              rawNotes = rawNotes.replace('<div class="teacher-notes">', '').replace('</div>', '').replace(/<br\/>/g, '\n');
          }

          setFormData({
            title: existingModule.title || '',
            subject_id: existingModule.subject_id || null,
            grade: existingModule.grade || null,
            category: existingModule.category || 'Foundation',
            description: existingModule.description || '',
            videoUrl: existingModule.content_json?.videoUrl || '',
            notes: rawNotes
          });

          const quizzes = await getQuizzes();
          const existingQuiz = quizzes.find(q => q.module_id === parseInt(id));
          if (existingQuiz) {
            setIncludeQuiz(true);
            setQuestions(existingQuiz.questions || []);
            setQuizSettings({
              time_limit: existingQuiz.time_limit || 300,
              max_attempts: existingQuiz.max_attempts || 3
            });
          }
        } else {
          navigate('/dashboard'); // Module not found
        }
      };
      fetchData();
    } else {
      if (!subjectIdParam || !gradeParam) {
        navigate('/dashboard'); // Cannot create a module without a subject and grade
      } else {
        setFormData(prev => ({ ...prev, subject_id: parseInt(subjectIdParam), grade: parseInt(gradeParam) }));
      }
    }
  }, [id, isEditing, navigate, subjectIdParam, gradeParam]);


  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now(), question: '', options: ['', '', '', ''], answer: 0 }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let rawNotes = formData.notes || '';
    let formatedNotes = rawNotes ? `<div class="teacher-notes">${rawNotes.replace(/\n/g, '<br/>')}</div>` : '';

    const newModuleData = {
      subject_id: parseInt(formData.subject_id),
      grade: parseInt(formData.grade),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      content_json: {
        videoUrl: formData.videoUrl,
        notes: formatedNotes,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
      }
    };

    let savedModule;
    if (isEditing) {
      savedModule = await updateModule(parseInt(id), newModuleData);
    } else {
      savedModule = await addModule(newModuleData);
    }

    if (includeQuiz && questions.length > 0 && savedModule) {
      const newQuizData = {
        questions: questions,
        time_limit: parseInt(quizSettings.time_limit),
        max_attempts: parseInt(quizSettings.max_attempts)
      };
      
      if (isEditing) {
         await updateQuiz(parseInt(id), newQuizData);
      } else {
         await addQuiz({ ...newQuizData, module_id: savedModule.id });
      }
    }

    alert(`Module ${isEditing ? 'updated' : 'added'} successfully!`);
    navigate(formData.subject_id && formData.grade ? `/subject/${formData.subject_id}/grade/${formData.grade}` : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link to={formData.subject_id && formData.grade ? `/subject/${formData.subject_id}/grade/${formData.grade}` : "/dashboard"} className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-purple-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{isEditing ? 'Edit Module' : 'Create New Module'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-2">1. Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Module Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder="e.g. Introduction to HTML" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder="e.g. Web Design" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Short Description *</label>
                <textarea required rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder="A brief summary of what students will learn..."></textarea>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-2">2. Lesson Content</h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Video size={18} className="text-purple-600" /> Video URL (Optional Embed Link)
                </label>
                <input type="url" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder="e.g. https://www.youtube.com/embed/..." />
                <p className="text-xs text-slate-500 mt-1">For YouTube, use the embed URL format.</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <FileText size={18} className="text-purple-600" /> Lesson Notes / Handout
                </label>
                <textarea rows="6" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder="Write or paste your lesson notes here..."></textarea>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between border-b pb-2 mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle size={22} className="text-purple-600" /> 3. Module Quiz (Optional)
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeQuiz} onChange={e => setIncludeQuiz(e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="font-medium text-slate-700">Add a Quiz</span>
              </label>
            </div>

            {includeQuiz && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time Limit (Seconds)</label>
                    <input type="number" value={quizSettings.time_limit} onChange={e => setQuizSettings({ ...quizSettings, time_limit: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Attempts</label>
                    <input type="number" value={quizSettings.max_attempts} onChange={e => setQuizSettings({ ...quizSettings, max_attempts: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200" />
                  </div>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-6 border border-purple-100 bg-purple-50/30 rounded-xl relative group">
                    <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-slate-800 mb-2">Question {qIndex + 1}</label>
                      <input required type="text" value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder="Enter question text..." />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">Options & Correct Answer</label>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input type="radio" required name={`correct-${q.id}`} checked={Number(q.answer) === oIndex} onChange={() => handleQuestionChange(qIndex, 'answer', oIndex)} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                          <input required type="text" value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500" placeholder={`Option ${oIndex + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={handleAddQuestion} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-colors flex items-center justify-center gap-2">
                  <Plus size={20} /> Add Question
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button type="submit" className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center gap-2 text-lg">
              <Save size={24} /> {isEditing ? 'Save Changes' : 'Publish Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleEditor;
