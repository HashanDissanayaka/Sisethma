import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, getSubjects, getNotices, getLiveSessions, addLiveSession, getUsers } from '../services/db';
import { BookOpen, User, Plus, Bell, Video, X, Calendar, Clock, ExternalLink, Layers } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [notices, setNotices] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveForm, setLiveForm] = useState({ title: '', link: '', target: 'all', date: '', time: '', subject_id: '' });
  const [activeTab, setActiveTab] = useState('6');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      const loadData = async () => {
         const [usersData, subjectsData, noticesData, liveData] = await Promise.all([
            getUsers(), getSubjects(), getNotices(), getLiveSessions()
         ]);
         const freshUser = usersData.find(u => u.id === currentUser.id);
         setUser(freshUser || currentUser);
         setSubjects(subjectsData);
         setNotices(noticesData);
         setLiveSessions(liveData);
      };
      loadData();
    }
  }, [navigate]);

  const isTeacher = user?.role === 'teacher';
  
  // Subjects logic: Show only assigned subjects. Hide inactive subjects.
  let displaySubjects = subjects.filter(s => user?.assigned_subjects?.some(as => as.subject_id === s.id));
  displaySubjects = displaySubjects.filter(s => s.isActive !== false);

  if (!user) return null;

  // Filter notices to relevant ones
  const displayNotices = notices.filter(n => {
    if (n.isActive === false) return false;
    if (user.role === 'admin' || user.role === 'teacher') return true;
    return n.target === 'all' || n.target === String(user.grade);
  });

  const displayLiveSessions = liveSessions.filter(s => {
    if (s.isActive === false) return false;
    if (user.role === 'admin' || user.role === 'teacher') return true;
    return s.target === 'all' || s.target === String(user.grade);
  });

  const handleLiveSubmit = async (e) => {
    e.preventDefault();
    await addLiveSession(liveForm);
    setShowLiveModal(false);
    setLiveForm({ title: '', link: '', target: 'all', date: '', time: '', subject_id: '' });
    const freshSessions = await getLiveSessions();
    setLiveSessions(freshSessions);
  };

  const renderSubjectCard = (sub) => {
    let assignedGradesText = '';
    if (isTeacher) {
       const assignment = user.assigned_subjects?.find(as => as.subject_id === sub.id);
       if (assignment && assignment.grades && assignment.grades.length > 0) {
          const sorted = [...assignment.grades].sort((a,b)=>a-b);
          assignedGradesText = sorted.length > 3 ? `Grades ${sorted[0]}-${sorted[sorted.length-1]}` : `Grades ${sorted.join(', ')}`;
       } else {
          assignedGradesText = 'No Grades';
       }
    } else {
       assignedGradesText = `Grade ${user.grade}`;
    }

    return (
    <div key={sub.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <BookOpen size={24} />
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
          {assignedGradesText}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{sub.name}</h3>
      <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-grow">{sub.description}</p>
      
      <Link 
        to={`/subject/${sub.id}`}
        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 text-indigo-600 rounded-xl font-bold transition-colors"
      >
        <Layers size={20} />
        {isTeacher ? 'Manage Curriculum' : 'View Modules'}
      </Link>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back, {user.fullname}</h1>
              <p className="text-slate-500 capitalize">{user.role} Portal • Grade {user.grade}</p>
            </div>
          </div>
          {isTeacher && (
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowLiveModal(true)} className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200">
                <Video size={20} />
                Schedule Class
              </button>
            </div>
          )}
        </div>

        {/* Notices Section */}
        {displayNotices.length > 0 && (
          <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {displayNotices.map(notice => (
              <div key={notice.id} className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Bell size={100} />
                </div>
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full shrink-0 relative z-10">
                  <Bell size={24} />
                </div>
                <div className="relative z-10 flex-grow">
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <h3 className="text-xl font-bold text-amber-900">{notice.title}</h3>
                    <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                      {notice.target === 'all' ? 'All Classes' : `Grade ${notice.target}`}
                    </span>
                  </div>
                  <p className="text-amber-800 whitespace-pre-wrap">{notice.message}</p>
                  <p className="text-xs font-medium text-amber-600/70 mt-3 uppercase tracking-wider">{new Date(notice.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live Classes Section */}
        {displayLiveSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Video className="text-rose-500" /> Upcoming Live Classes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayLiveSessions.map(session => (
                <div key={session.id} className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-rose-500 hover:shadow-md transition group overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 font-bold text-xs rounded-full">
                      {session.target === 'all' ? 'All Grades' : `Grade ${session.target}`}
                    </span>
                    <Video size={20} className="text-rose-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{session.title}</h3>
                  {session.subject_id && (
                    <p className="flex items-center gap-2 text-indigo-600 text-sm font-bold mb-3">
                      <BookOpen size={14} /> {subjects.find(s => s.id === session.subject_id)?.name || 'Subject'}
                    </p>
                  )}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Calendar size={16} className="text-slate-400" /> {session.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Clock size={16} className="text-slate-400" /> {session.time}
                    </div>
                  </div>
                  <a 
                    href={session.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-3 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition-all relative z-10"
                  >
                    Join Class <ExternalLink size={18} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{isTeacher ? "Your Assigned Subjects" : "Your Subjects"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySubjects.map(renderSubjectCard)}
            
            {displaySubjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                 {isTeacher ? "No subjects assigned to you. Contact your Administrator to get access!" : "You have not been enrolled in any subjects yet."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Live Class Modal */}
      {showLiveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50">
              <h3 className="text-xl font-bold text-rose-900 flex items-center gap-2">
                <Video size={24} className="text-rose-500" /> Schedule Live Class
              </h3>
              <button onClick={() => setShowLiveModal(false)} className="text-rose-400 hover:text-rose-600 transition p-1 hover:bg-rose-100 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLiveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Topic / Title</label>
                <input required type="text" value={liveForm.title} onChange={e => setLiveForm({...liveForm, title: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g. Science Revision Q&A" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <select value={liveForm.subject_id} onChange={e => setLiveForm({...liveForm, subject_id: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none font-medium text-slate-700">
                  <option value="">— No specific subject —</option>
                  {displaySubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Meeting Link (Zoom, Teams, Meet)</label>
                <input required type="url" value={liveForm.link} onChange={e => setLiveForm({...liveForm, link: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="https://zoom.us/j/..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                <select value={liveForm.target} onChange={e => setLiveForm({...liveForm, target: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none font-medium text-slate-700">
                  <option value="all">Broadcast to All Grades</option>
                  {[6, 7, 8, 9, 10, 11].map(g => <option key={g} value={g}>Grade {g} Students Only</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                  <input required type="date" value={liveForm.date} onChange={e => setLiveForm({...liveForm, date: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none text-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                  <input required type="time" value={liveForm.time} onChange={e => setLiveForm({...liveForm, time: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none text-slate-600" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 text-lg">
                  Schedule Class & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
