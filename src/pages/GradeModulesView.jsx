import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjects, getModules, authService } from '../services/db';
import { BookOpen, ArrowLeft, Plus, PlayCircle } from 'lucide-react';

const GradeModulesView = () => {
  const { subjectId, grade } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [modules, setModules] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const loadData = async () => {
      const subIdNum = Number(subjectId);
      const gradeNum = Number(grade);
      
      const [subjectsList, modulesList] = await Promise.all([getSubjects(), getModules()]);
      
      const sub = subjectsList.find(s => s.id === subIdNum);
      if (!sub) {
        navigate('/dashboard');
        return;
      }
      setSubject(sub);
      
      // Filter modules belonging to this subject AND grade
      let mods = modulesList.filter(m => m.subject_id === subIdNum && m.grade === gradeNum);
      // Hide inactive modules for students
      if (currentUser.role === 'student') {
          mods = mods.filter(m => m.isActive !== false);
      }
      setModules(mods);
    };
    loadData();
  }, [subjectId, grade, navigate]);

  if (!subject || !user) return null;

  const isTeacher = user.role === 'teacher';

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
               <Link to={`/subject/${subject.id}`} className="p-3 bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-slate-800 transition">
                  <ArrowLeft size={24} />
               </Link>
               <div>
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                       Grade {grade}
                     </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mt-2 flex items-center gap-3">
                     <BookOpen className="text-indigo-600" size={32} />
                     {subject.name}
                  </h1>
               </div>
            </div>
            
            {isTeacher && (
               <Link to={`/module/new?subjectId=${subject.id}&grade=${grade}`} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm hover:shadow-md">
                  <Plus size={20} /> Add Module
               </Link>
            )}
        </div>
        
        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.length === 0 ? (
               <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-slate-100 text-slate-500">
                  {isTeacher ? "Get started by adding the first learning module to this grade." : "No modules have been published for this grade yet."}
               </div>
            ) : (
                modules.map(mod => (
                  <div key={mod.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition ${mod.isActive === false ? 'opacity-60 grayscale border-dashed' : ''}`}>
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                          {mod.title}
                          {isTeacher && mod.isActive === false && (
                             <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-xs font-bold rounded-full uppercase">Inactive</span>
                          )}
                      </h3>
                      <p className="text-slate-600 text-sm mb-6">{mod.description}</p>
                    </div>
                    {isTeacher ? (
                      <Link to={`/module/edit/${mod.id}`} className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition flex items-center justify-center gap-2">
                        Edit Module
                      </Link>
                    ) : (
                      <Link to={`/course/${mod.id}`} className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-indigo-700 font-bold rounded-xl transition flex items-center justify-center gap-2">
                        <PlayCircle size={18} /> Continue Learning
                      </Link>
                    )}
                  </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
};

export default GradeModulesView;
