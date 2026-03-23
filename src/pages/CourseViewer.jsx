import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService, getModules, getQuizzes, getProgress, markModuleComplete, unmarkModuleComplete } from '../services/db';
import { ArrowLeft, PlayCircle, FileText, CheckCircle, HelpCircle, RotateCcw, Trophy } from 'lucide-react';

const CourseViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [moduleQuiz, setModuleQuiz] = useState(null);
    const [activeTab, setActiveTab] = useState('video');
    const [user, setUser] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completing, setCompleting] = useState(false);

    // Quiz state
    const [selectedAnswers, setSelectedAnswers] = useState({});  // { [questionId]: selectedOption }
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(null);
    const [quizError, setQuizError] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const loadCourse = async () => {
            const [modules, quizzes, progress] = await Promise.all([
                getModules(), getQuizzes(), getProgress(currentUser.id)
            ]);
            const foundModule = modules.find(m => m.id === parseInt(id));
            if (foundModule) {
                setModule(foundModule);
                const foundQuiz = quizzes.find(q => q.module_id === foundModule.id);
                setModuleQuiz(foundQuiz);
                setIsCompleted(progress.some(p => p.module_id === foundModule.id));

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
                navigate('/dashboard');
            }
        };
        loadCourse();
    }, [id, navigate]);

    const handleToggleComplete = async () => {
        if (!user || !module) return;
        setCompleting(true);
        if (isCompleted) {
            await unmarkModuleComplete(user.id, module.id);
            setIsCompleted(false);
        } else {
            await markModuleComplete(user.id, module.id);
            setIsCompleted(true);
        }
        setCompleting(false);
    };

    // Normalize the "correct answer" to always be the string value of the option,
    // supporting both the AI format (string) and the manual format (index).
    const getCorrectAnswerString = (q) => {
        if (typeof q.answer === 'number') {
            return q.options[q.answer] ?? '';
        }
        return String(q.answer);
    };

    const handleSelectAnswer = (questionId, optionText) => {
        if (quizSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionText }));
    };

    const handleSubmitQuiz = () => {
        if (!moduleQuiz) return;
        const unanswered = moduleQuiz.questions.filter(q => selectedAnswers[q.id] === undefined);
        if (unanswered.length > 0) {
            setQuizError(`Please answer all questions. You have ${unanswered.length} unanswered.`);
            return;
        }
        setQuizError('');
        let correct = 0;
        moduleQuiz.questions.forEach(q => {
            if (selectedAnswers[q.id] === getCorrectAnswerString(q)) correct++;
        });
        setQuizScore(correct);
        setQuizSubmitted(true);
    };

    const handleResetQuiz = () => {
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        setQuizError('');
    };

    if (!module) return <div className="min-h-screen bg-slate-50 pt-32 text-center">Loading...</div>;

    const { content_json } = module;
    const isStudent = user?.role === 'student';

    const renderQuiz = () => {
        if (!moduleQuiz) return null;
        const total = moduleQuiz.questions.length;

        if (quizSubmitted) {
            const pct = Math.round((quizScore / total) * 100);
            const passed = pct >= 60;
            return (
                <div>
                    <div className={`rounded-2xl p-8 text-center mb-8 ${passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                        <Trophy size={48} className={`mx-auto mb-4 ${passed ? 'text-emerald-500' : 'text-red-400'}`} />
                        <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-emerald-800' : 'text-red-800'}`}>
                            {passed ? 'ðŸŽ‰ Well Done!' : 'Keep Studying!'}
                        </h2>
                        <p className={`text-lg ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
                            You scored <strong>{quizScore}/{total}</strong> ({pct}%)
                        </p>
                    </div>
                    <div className="space-y-6 mb-8">
                        {moduleQuiz.questions.map((q, idx) => {
                            const correctAnswer = getCorrectAnswerString(q);
                            const chosen = selectedAnswers[q.id];
                            const isCorrect = chosen === correctAnswer;
                            return (
                                <div key={q.id} className={`rounded-xl p-5 border-2 ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                                    <h3 className="font-bold text-slate-800 mb-4">{idx + 1}. {q.question}</h3>
                                    <div className="space-y-2">
                                        {q.options.map((opt, optIdx) => {
                                            const isChosen = opt === chosen;
                                            const isRight = opt === correctAnswer;
                                            let cls = 'flex items-center gap-3 p-3 rounded-lg border text-sm font-medium ';
                                            if (isRight) cls += 'border-emerald-400 bg-emerald-100 text-emerald-800';
                                            else if (isChosen && !isRight) cls += 'border-red-400 bg-red-100 text-red-800 line-through';
                                            else cls += 'border-slate-200 bg-white text-slate-500';
                                            return (
                                                <div key={optIdx} className={cls}>
                                                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold shrink-0">
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    {opt}
                                                    {isRight && <span className="ml-auto text-emerald-600 font-bold">âœ“</span>}
                                                    {isChosen && !isRight && <span className="ml-auto text-red-600 font-bold">âœ—</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={handleResetQuiz}
                        className="w-full py-4 border-2 border-purple-300 text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} /> Try Again
                    </button>
                </div>
            );
        }

        return (
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="text-purple-600" /> Knowledge Check
                </h2>
                <p className="text-slate-500 mb-8 border-b pb-4">
                    Answer all {total} questions. Time limit: {moduleQuiz.time_limit}s.
                </p>
                <div className="space-y-8">
                    {moduleQuiz.questions.map((q, idx) => {
                        const chosen = selectedAnswers[q.id];
                        return (
                            <div key={q.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">{idx + 1}. {q.question}</h3>
                                <div className="space-y-3">
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = chosen === opt;
                                        return (
                                            <label
                                                key={optIdx}
                                                onClick={() => handleSelectAnswer(q.id, opt)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? 'border-purple-400 bg-purple-50 text-purple-800'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                                                }`}
                                            >
                                                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                {opt}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {quizError && (
                        <p className="text-red-600 font-medium bg-red-50 px-4 py-3 rounded-lg border border-red-200">{quizError}</p>
                    )}

                    <button
                        onClick={handleSubmitQuiz}
                        className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 mt-4"
                    >
                        Submit Answers
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-5xl">

                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-purple-600 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{module.title}</h1>
                        <p className="text-slate-500 flex items-center gap-2 text-sm mt-1">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">{module.category}</span>
                            Grade {module.grade} Module
                        </p>
                    </div>
                    {/* Mark Complete Button */}
                    {isStudent && (
                        <button
                            onClick={handleToggleComplete}
                            disabled={completing}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                                isCompleted
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                            }`}
                        >
                            <CheckCircle size={20} />
                            {completing ? 'Saving...' : isCompleted ? 'Completed âœ“' : 'Mark Complete'}
                        </button>
                    )}
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
                                onClick={() => { setActiveTab('quiz'); handleResetQuiz(); }}
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
                            renderQuiz()
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CourseViewer;
