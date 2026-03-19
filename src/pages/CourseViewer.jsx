import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService, getModules, getQuizzes } from '../services/db';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const CourseViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [moduleQuiz, setModuleQuiz] = useState(null);
    const [activeTab, setActiveTab] = useState('video'); // 'video', 'notes', 'quiz'
    
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const loadCourse = async () => {
            const [modules, quizzes] = await Promise.all([getModules(), getQuizzes()]);
            const foundModule = modules.find(m => m.id === parseInt(id));
            if (foundModule) {
                setModule(foundModule);
                const foundQuiz = quizzes.find(q => q.module_id === foundModule.id);
                setModuleQuiz(foundQuiz);
                
                // Default to video if exists, else notes
                if (foundModule.content_json?.videoUrl) {
                    setActiveTab('video');
                } else if (foundModule.content_json?.notes) {
                    setActiveTab('notes');
                } else if (foundQuiz) {
                    setActiveTab('quiz');
                } else {
                    setActiveTab('notes');
                }
            } else {
                navigate('/dashboard'); // Module not found
            }
        };
        loadCourse();
    }, [id, navigate]);

    if (!module) return <div className="min-h-screen bg-slate-50 pt-32 text-center">Loading...</div>;

    const { content_json } = module;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-5xl">
                
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-purple-600 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{module.title}</h1>
                        <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">{module.category}</span>
                            Grade {module.grade} Module
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto">
                        {content_json?.videoUrl && (
                            <button 
                                onClick={() => setActiveTab('video')}
                                className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'video' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <PlayCircle size={20} />
                                Video Lesson
                            </button>
                        )}
                        {(content_json?.notes || !content_json?.videoUrl) && (
                            <button 
                                onClick={() => setActiveTab('notes')}
                                className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'notes' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <FileText size={20} />
                                Lesson Notes
                            </button>
                        )}
                        {moduleQuiz && (
                            <button 
                                onClick={() => setActiveTab('quiz')}
                                className={`flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap md:whitespace-normal ${activeTab === 'quiz' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                <HelpCircle size={20} />
                                Module Quiz
                            </button>
                        )}
                    </div>

                    {/* Content Display */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
                        {activeTab === 'video' && content_json?.videoUrl ? (
                            <div className="w-full h-full flex flex-col">
                                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <PlayCircle className="text-purple-600" /> Watch Lesson
                                </h2>
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                                    <iframe 
                                        src={content_json.videoUrl} 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full border-0"
                                    ></iframe>
                                </div>
                                {content_json?.image && (
                                   <div className="mt-8 rounded-xl overflow-hidden shadow-md">
                                        <img src={content_json.image} alt="Lesson illustration" className="w-full object-cover max-h-[300px]" />
                                   </div>
                                )}
                            </div>
                        ) : activeTab === 'notes' && content_json?.notes ? (
                            <div className="prose prose-purple max-w-none">
                                <h2 className="text-xl font-bold text-slate-900 border-b pb-4 mb-6 flex items-center gap-2">
                                    <FileText className="text-purple-600" /> Study Notes
                                </h2>
                                <div dangerouslySetInnerHTML={{ __html: content_json.notes }} className="text-slate-700 leading-relaxed max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600" />
                            </div>
                        ) : activeTab === 'notes' ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <FileText size={48} className="mb-4 opacity-50" />
                                <p>No notes available for this module.</p>
                            </div>
                        ) : activeTab === 'quiz' && moduleQuiz ? (
                            <div className="">
                                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <CheckCircle className="text-purple-600" /> Knowledge Check
                                </h2>
                                <p className="text-slate-500 mb-8 border-b pb-4">Test your knowledge on this module. Time limit: {moduleQuiz.time_limit}s.</p>
                                
                                <div className="space-y-8">
                                    {moduleQuiz.questions.map((q, idx) => (
                                        <div key={q.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                            <h3 className="font-bold text-slate-800 mb-4">{idx + 1}. {q.question}</h3>
                                            <div className="space-y-3">
                                                {q.options.map((opt, optIdx) => (
                                                    <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-purple-300 transition-colors">
                                                        <input type="radio" name={`question-${q.id}`} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                                                        <span className="text-slate-700">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 mt-4">
                                        Submit Answers
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;
