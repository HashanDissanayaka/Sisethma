import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjects, authService } from '../services/db';
import { BookOpen, ArrowLeft, Folder } from 'lucide-react';

const SubjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [user, setUser] = useState(null);

  let GRADES = [];
  if (user && subject) {
     if (user.role === 'admin') {
        GRADES = [1,2,3,4,5,6,7,8,9,10,11];
     } else if (user.role === 'teacher') {
        const assignment = user.assigned_subjects?.find(as => as.subject_id === subject.id);
        if (assignment && assignment.grades) {
           GRADES = [...assignment.grades].sort((a,b) => a-b);
        }
     } else {
        GRADES = [user.grade];
     }
  }

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      const subId = Number(id);
      const subjects = await getSubjects();
      const sub = subjects.find(s => s.id === subId);
      if (!sub) {
        navigate('/dashboard');
        return;
      }
      setSubject(sub);
    };
    fetchData();
  }, [id, navigate]);

  if (!subject || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
           <button onClick={() => navigate('/dashboard')} className="p-3 bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft size={24} />
           </button>
           <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                 <BookOpen className="text-indigo-600" size={32} />
                 {subject.name}
              </h1>
              <p className="text-slate-500 mt-2 text-lg">{subject.description}</p>
           </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Select Grade Level</h2>
        
        {/* Grades Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {GRADES.map(grade => (
              <Link key={grade} to={`/subject/${subject.id}/grade/${grade}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4 shadow-sm">
                  <Folder size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Grade {grade}
                </h3>
              </Link>
            ))}
        </div>

      </div>
    </div>
  );
};

export default SubjectView;
