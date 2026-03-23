import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, getUsers, addUser, updateUser, deleteUser, getModules, deleteModule, updateModule, getNotices, addNotice, updateNotice, deleteNotice, getLiveSessions, addLiveSession, updateLiveSession, deleteLiveSession, getSubjects, addSubject, updateSubject, deleteSubject } from '../services/db';
import { Users, FileText, Trash2, Edit, Plus, UserPlus, BookOpen, GraduationCap, Briefcase, Bell, Send, Eye, EyeOff, Video, Calendar, Clock, CheckSquare, Layers, CalendarDays, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'teachers', 'subjects', 'modules', 'notices'
  const [activeModuleGrade, setActiveModuleGrade] = useState('6');
  
  // Data state
  const [usersList, setUsersList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [modulesList, setModulesList] = useState([]);
  const [noticesList, setNoticesList] = useState([]);
  const [liveSessionsList, setLiveSessionsList] = useState([]);

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    fullname: '',
    student_code: '',
    role: 'student',
    grade: 6
  });

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', grade: 6, description: '' });

  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', target: 'all' });

  const [showLiveForm, setShowLiveForm] = useState(false);
  const [editingLiveId, setEditingLiveId] = useState(null);
  const [liveForm, setLiveForm] = useState({ title: '', link: '', target: 'all', date: '', time: '', subject_id: '' });

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStudent, setEnrollStudent] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);

  const navigate = useNavigate();

  const loadData = async () => {
    const [users, subjects, modules, notices, liveSessions] = await Promise.all([
       getUsers(), getSubjects(), getModules(), getNotices(), getLiveSessions()
    ]);
    setUsersList(users);
    setSubjectsList(subjects);
    setModulesList(modules);
    setNoticesList(notices);
    setLiveSessionsList(liveSessions);
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/login');
    } else {
      setUser(currentUser);
      loadData();
    }
  }, [navigate]);

  // Prepare module grouping
  const groupedModules = modulesList.reduce((acc, mod) => {
    const g = String(mod.grade || 'Other');
    acc[g] = acc[g] || [];
    acc[g].push(mod);
    return acc;
  }, {});
  
  const availableModuleGradesStr = Object.keys(groupedModules).sort((a,b) => Number(a)-Number(b)).join(',');
  const availableModuleGrades = availableModuleGradesStr ? availableModuleGradesStr.split(',') : [];

  // Ensure active module grade tab is valid
  useEffect(() => {
    if (activeTab === 'modules' && availableModuleGrades.length > 0 && !availableModuleGrades.includes(activeModuleGrade)) {
       setActiveModuleGrade(availableModuleGrades[0]);
    }
  }, [availableModuleGradesStr, activeModuleGrade, activeTab]);

  if (!user) return null;

  // --- Handlers for Users ---
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...userForm,
      grade: userForm.role === 'student' ? Number(userForm.grade) : null
    };

    if (editingUserId) {
      await updateUser(editingUserId, payload);
    } else {
      await addUser(payload);
    }
    setShowUserForm(false);
    setEditingUserId(null);
    setUserForm({ fullname: '', student_code: '', role: 'student', grade: 6 });
    await loadData();
  };

  const handleEditUser = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      fullname: u.fullname,
      student_code: u.student_code,
      role: u.role,
      grade: u.grade || 6
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
      await loadData();
    }
  };

  const handleToggleUser = async (u) => {
    await updateUser(u.id, { isActive: u.isActive === false ? true : false });
    await loadData();
  };

  const handleOpenEnroll = (student) => {
    setEnrollStudent(student);
    setSelectedModules(student.assigned_subjects ? JSON.parse(JSON.stringify(student.assigned_subjects)) : []);
    setShowEnrollModal(true);
  };

  const handleToggleEnrollment = (subjectId) => {
    const isEnrolled = selectedModules.some(s => s.subject_id === subjectId);
    if (isEnrolled) {
      setSelectedModules(selectedModules.filter(s => s.subject_id !== subjectId));
    } else {
      setSelectedModules([...selectedModules, { subject_id: subjectId, grades: enrollStudent.role === 'teacher' ? [6,7,8,9,10,11] : [] }]);
    }
  };

  const handleToggleGradeForSubject = (subjectId, grade) => {
    setSelectedModules(prev =>
      prev.map(s => {
         if (s.subject_id === subjectId) {
            const hasGrade = s.grades.includes(grade);
            const newGrades = hasGrade ? s.grades.filter(g => g !== grade) : [...s.grades, grade];
            return { ...s, grades: newGrades };
         }
         return s;
      })
    );
  };

  const handleSaveEnrollment = async () => {
    await updateUser(enrollStudent.id, { assigned_subjects: selectedModules });
    setShowEnrollModal(false);
    setEnrollStudent(null);
    await loadData();
  };

  // --- Handlers for Subjects ---
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...subjectForm, grade: Number(subjectForm.grade) };
    if (editingSubjectId) await updateSubject(editingSubjectId, payload);
    else await addSubject(payload);
    setShowSubjectForm(false);
    setEditingSubjectId(null);
    setSubjectForm({ name: '', grade: 6, description: '' });
    await loadData();
  };

  const handleEditSubject = (s) => {
    setEditingSubjectId(s.id);
    setSubjectForm({ name: s.name, grade: s.grade, description: s.description });
    setShowSubjectForm(true);
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this subjects and ALL its modules? This cannot be undone.")) {
      await deleteSubject(id);
      await loadData();
    }
  };

  const handleToggleSubject = async (s) => {
    await updateSubject(s.id, { isActive: s.isActive === false ? true : false });
    await loadData();
  };

  // --- Handlers for Modules ---
  const handleDeleteModule = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this module? This cannot be undone.")) {
      await deleteModule(id);
      await loadData();
    }
  };

  const handleToggleModule = async (m) => {
    await updateModule(m.id, { isActive: m.isActive === false ? true : false });
    await loadData();
  };

  // --- Handlers for Notices ---
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (editingNoticeId) {
      await updateNotice(editingNoticeId, noticeForm);
    } else {
      await addNotice(noticeForm);
    }
    setShowNoticeForm(false);
    setEditingNoticeId(null);
    setNoticeForm({ title: '', message: '', target: 'all' });
    await loadData();
  };

  const handleEditNotice = (n) => {
    setEditingNoticeId(n.id);
    setNoticeForm({ title: n.title, message: n.message, target: n.target });
    setShowNoticeForm(true);
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm("Delete this notice?")) {
      await deleteNotice(id);
      await loadData();
    }
  };

  const handleToggleNotice = async (n) => {
    await updateNotice(n.id, { isActive: n.isActive === false ? true : false });
    await loadData();
  };

  // --- Handlers for Live Sessions ---
  const handleLiveSubmit = async (e) => {
    e.preventDefault();
    if (editingLiveId) {
      await updateLiveSession(editingLiveId, liveForm);
    } else {
      await addLiveSession(liveForm);
    }
    setShowLiveForm(false);
    setEditingLiveId(null);
    setLiveForm({ title: '', link: '', target: 'all', date: '', time: '', subject_id: '' });
    await loadData();
  };

  const handleEditLive = (s) => {
    setEditingLiveId(s.id);
    setLiveForm({ title: s.title, link: s.link, target: s.target, date: s.date, time: s.time, subject_id: s.subject_id || '' });
    setShowLiveForm(true);
  };

  const handleDeleteLive = async (id) => {
    if (window.confirm("Delete this live session?")) {
      await deleteLiveSession(id);
      await loadData();
    }
  };

  const handleToggleLive = async (s) => {
    await updateLiveSession(s.id, { isActive: s.isActive === false ? true : false });
    await loadData();
  };

  // --- Render Helpers ---
  const renderUsersTable = (roleFilter) => {
    const filteredUsers = usersList.filter(u => u.role === roleFilter);
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Login Code</th>
                {roleFilter === 'student' && <th className="p-4 font-medium">Grade</th>}
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={`border-b border-slate-50 hover:bg-slate-50 ${u.isActive === false ? 'opacity-50 grayscale' : ''}`}>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    {u.fullname}
                    {u.isActive === false && <span className="bg-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold uppercase">Inactive</span>}
                  </td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-sm font-mono">{u.student_code}</span></td>
                  {roleFilter === 'student' && <td className="p-4 text-slate-500 font-medium">Grade {u.grade}</td>}
                  <td className="p-4 flex gap-2 justify-end">
                    {u.id !== user.id && (
                      <button onClick={() => handleToggleUser(u)} className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition" title={u.isActive === false ? 'Activate' : 'Deactivate'}>
                        {u.isActive === false ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                    <button onClick={() => handleEditUser(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title={`Edit ${roleFilter}`}><Edit size={18} /></button>
                    {u.id !== user.id && (
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title={`Delete ${roleFilter}`}><Trash2 size={18} /></button>
                    )}
                    {(roleFilter === 'student' || roleFilter === 'teacher') && (
                      <button onClick={() => handleOpenEnroll(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Manage Assigned Subjects"><CheckSquare size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="4" className="text-center p-8 text-slate-500">No {roleFilter}s found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Control Panel</h1>
            <p className="text-slate-500">Manage all students, teachers, system modules, and notices globally.</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <div className="bg-blue-50 text-blue-700 px-6 py-3 rounded-xl flex items-center gap-3 font-bold">
              <Users size={24} /> {usersList.filter(u=>u.role !== 'admin').length} Users
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-xl flex items-center gap-3 font-bold">
              <Layers size={24} /> {subjectsList.length} Subjects
            </div>
            <div className="bg-purple-50 text-purple-700 px-6 py-3 rounded-xl flex items-center gap-3 font-bold">
              <BookOpen size={24} /> {modulesList.length} Modules
            </div>
            <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-xl flex items-center gap-3 font-bold">
              <Bell size={24} /> {noticesList.length} Notices
            </div>
            <div className="bg-rose-50 text-rose-700 px-6 py-3 rounded-xl flex items-center gap-3 font-bold">
              <Video size={24} /> {liveSessionsList.length} Live Classes
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-slate-200 pb-4">
          <button 
            onClick={() => { setActiveTab('students'); setShowUserForm(false); setShowNoticeForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'students' ? 'bg-slate-900 text-white shadow-md scale-105 border-0' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <GraduationCap size={20} /> Students
          </button>
          <button 
            onClick={() => { setActiveTab('teachers'); setShowUserForm(false); setShowSubjectForm(false); setShowNoticeForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'teachers' ? 'bg-slate-900 text-white shadow-md scale-105 border-0' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Briefcase size={20} /> Teachers
          </button>
          <button 
            onClick={() => { setActiveTab('subjects'); setShowUserForm(false); setShowSubjectForm(false); setShowNoticeForm(false); setShowLiveForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'subjects' ? 'bg-slate-900 text-white shadow-md scale-105 border-0' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Layers size={20} /> Subjects
          </button>
          <button 
            onClick={() => { setActiveTab('modules'); setShowUserForm(false); setShowSubjectForm(false); setShowNoticeForm(false); setShowLiveForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'modules' ? 'bg-slate-900 text-white shadow-md scale-105 border-0' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <FileText size={20} /> Modules
          </button>
          <button 
            onClick={() => { setActiveTab('notices'); setShowUserForm(false); setShowNoticeForm(false); setShowLiveForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'notices' ? 'bg-slate-900 text-white shadow-md scale-105 border-0' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Bell size={20} /> Notices
          </button>
          <button 
            onClick={() => { setActiveTab('liveClasses'); setShowUserForm(false); setShowNoticeForm(false); setShowLiveForm(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'liveClasses' ? 'bg-slate-900 text-white shadow-md scale-105 border-0' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <Video size={20} /> Live Classes
          </button>
          <Link to="/timetable"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            <CalendarDays size={20} /> Timetable
          </Link>
          <Link to="/quiz-generator"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all bg-white text-purple-600 border border-purple-200 hover:bg-purple-50"
          >
            <Sparkles size={20} /> AI Quizzes
          </Link>
        </div>

        {/* --- USERS TAB CONTENT (Students or Teachers) --- */}
        {(activeTab === 'students' || activeTab === 'teachers') && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900 capitalize">Registered {activeTab}</h2>
              <button 
                onClick={() => {
                  setEditingUserId(null); 
                  setUserForm({ fullname: '', student_code: '', role: activeTab === 'students' ? 'student' : 'teacher', grade: 6 });
                  setShowUserForm(!showUserForm);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-sm"
              >
                {showUserForm ? 'Cancel' : <><UserPlus size={18} /> Add {activeTab === 'students' ? 'Student' : 'Teacher'}</>}
              </button>
            </div>

            {showUserForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-fuchsia-500"></div>
                <h3 className="text-xl font-bold mb-4">{editingUserId ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input required type="text" value={userForm.fullname} onChange={e => setUserForm({...userForm, fullname: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Login Code</label>
                    <input required type="text" value={userForm.student_code} onChange={e => setUserForm({...userForm, student_code: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select required value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-slate-50">
                      {activeTab === 'students' && <option value="student">Student</option>}
                      {activeTab === 'teachers' && <option value="teacher">Teacher</option>}
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {userForm.role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
                      <select required value={userForm.grade} onChange={e => setUserForm({...userForm, grade: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500">
                        {[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="lg:col-span-full flex justify-end mt-2">
                    <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex flex-row items-center gap-2"><UserPlus size={16}/> Save User</button>
                  </div>
                </form>
              </div>
            )}

            {showEnrollModal && enrollStudent && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 bg-indigo-50">
                    <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2"><CheckSquare size={20} /> Manage Subjects</h3>
                    <p className="text-indigo-600 text-sm mt-1">Assigning subjects for: <strong>{enrollStudent.fullname} ({enrollStudent.role})</strong></p>
                  </div>
                  <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    {subjectsList.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No applicable subjects currently exist.</p>
                    ) : (
                      subjectsList.map(s => {
                        const enrollment = selectedModules.find(sub => sub.subject_id === s.id);
                        const isEnrolled = !!enrollment;
                        
                        return (
                          <div key={s.id} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <div className="mt-0.5">
                                <input 
                                  type="checkbox" 
                                  checked={isEnrolled}
                                  onChange={() => handleToggleEnrollment(s.id)}
                                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{s.name}</p>
                              </div>
                            </label>
                            
                            {isEnrolled && enrollStudent.role === 'teacher' && (
                              <div className="ml-8 mt-2 flex flex-wrap gap-2">
                                {[1,2,3,4,5,6,7,8,9,10,11].map(g => (
                                   <button 
                                     key={g} 
                                     onClick={(e) => { e.preventDefault(); handleToggleGradeForSubject(s.id, g); }}
                                     className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${enrollment.grades?.includes(g) ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                   >
                                      Grade {g}
                                   </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={() => setShowEnrollModal(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancel</button>
                    <button onClick={handleSaveEnrollment} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm">Save Enrollments</button>
                  </div>
                </div>
              </div>
            )}

            {renderUsersTable(activeTab === 'students' ? 'student' : 'teacher')}
          </div>
        )}

        {/* --- SUBJECTS TAB --- */}
        {activeTab === 'subjects' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">System Subjects</h2>
              <button 
                onClick={() => {
                  setEditingSubjectId(null); 
                  setSubjectForm({ name: '', description: '' });
                  setShowSubjectForm(!showSubjectForm);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                {showSubjectForm ? 'Cancel' : <><Plus size={18} /> Add Subject</>}
              </button>
            </div>

            {showSubjectForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500"></div>
                <h3 className="text-xl font-bold mb-4">{editingSubjectId ? 'Edit Subject' : 'Add New Subject'}</h3>
                <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                    <input required type="text" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" placeholder="E.g. Mathematics" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea required rows="2" value={subjectForm.description} onChange={e => setSubjectForm({...subjectForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500" placeholder="Brief subject description..."></textarea>
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex flex-row items-center gap-2"><Send size={16}/> Save Subject</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {subjectsList.map((s) => (
                   <div key={s.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${s.isActive === false ? 'border-dashed border-slate-300 opacity-60 grayscale' : 'border-slate-100'} flex flex-col hover:shadow-md transition`}>
                       <div className="flex justify-end items-start mb-4">
                           <div className="flex gap-1">
                              <button onClick={() => handleToggleSubject(s)} className="p-1 text-slate-400 hover:text-amber-500 transition">
                                {s.isActive === false ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                              <button onClick={() => handleEditSubject(s)} className="p-1 text-slate-400 hover:text-blue-500 transition"><Edit size={18}/></button>
                              <button onClick={() => handleDeleteSubject(s.id)} className="p-1 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                           </div>
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 mb-2">{s.name}</h3>
                       <p className="text-slate-600 text-sm flex-grow">{s.description}</p>
                   </div>
               ))}
               {subjectsList.length === 0 && (
                   <div className="col-span-full py-8 text-center text-slate-500">No subjects created yet.</div>
               )}
            </div>
          </div>
        )}

        {/* --- MODULES TAB --- */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">System Modules</h2>
            </div>
            {/* ... remaining code continues unaltered ... */}

            {modulesList.length === 0 ? (
              <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-100">No modules in the system.</div>
            ) : (
              <>
                {/* Module Grade Tabs Navigation */}
                <div className="flex flex-wrap gap-3 mb-6 border-b border-slate-200 pb-4">
                  {availableModuleGrades.map(grade => (
                    <button 
                      key={grade}
                      onClick={() => setActiveModuleGrade(grade)}
                      className={`px-5 py-2 rounded-full font-bold transition-all ${
                        activeModuleGrade === grade 
                          ? 'bg-purple-600 text-white shadow-md scale-105' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-purple-600 hover:border-purple-200'
                      }`}
                    >
                      Grade {grade}
                    </button>
                  ))}
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                          <th className="p-4 font-medium">Title</th>
                          <th className="p-4 font-medium">Category</th>
                          <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedModules[activeModuleGrade]?.map((m) => (
                          <tr key={m.id} className={`border-b border-slate-50 hover:bg-slate-50 ${m.isActive === false ? 'opacity-50 grayscale' : ''}`}>
                            <td className="p-4 font-bold text-slate-900 w-1/2 flex flex-col items-start gap-1">
                              {m.title}
                              {m.isActive === false && <span className="bg-slate-200 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold uppercase">Inactive</span>}
                            </td>
                            <td className="p-4 text-slate-500">{m.category}</td>
                            <td className="p-4 flex gap-2 justify-end">
                              <button onClick={() => handleToggleModule(m)} className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition" title={m.isActive === false ? 'Activate' : 'Deactivate'}>
                                {m.isActive === false ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                              <Link to={`/module/edit/${m.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Module"><Edit size={18} /></Link>
                              <button onClick={() => handleDeleteModule(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Module"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- NOTICES TAB --- */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Broadcast Notices</h2>
              <button 
                onClick={() => {
                  setShowNoticeForm(!showNoticeForm);
                  if (showNoticeForm) setEditingNoticeId(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition shadow-sm"
              >
                {showNoticeForm ? 'Cancel' : <><Plus size={18} /> New Notice</>}
              </button>
            </div>

            {showNoticeForm && (
              <div className="bg-white p-6 rounded-2xl shadow-md border border-amber-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600">
                  <Bell size={20} /> {editingNoticeId ? 'Edit Announcement' : 'Publish Announcement'}
                </h3>
                <form onSubmit={handleNoticeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Notice Title</label>
                      <input required type="text" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500" placeholder="E.g. Class Rescheduled" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                      <select required value={noticeForm.target} onChange={e => setNoticeForm({...noticeForm, target: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500 bg-white">
                        <option value="all">All Grades (Students & Teachers)</option>
                        {[6,7,8,9,10,11].map(g => <option key={g} value={String(g)}>Grade {g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message Content</label>
                    <textarea required rows="3" value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-amber-500" placeholder="Type your notice here..."></textarea>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button type="submit" className="px-6 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 flex flex-row items-center gap-2">
                      {editingNoticeId ? 'Update Notice' : <><Send size={16}/> Broadcast</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticesList.map((n) => (
                <div key={n.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${n.isActive === false ? 'border-dashed border-slate-300 opacity-60 grayscale' : 'border-slate-100'} flex flex-col hover:shadow-md transition`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 items-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${n.target === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {n.target === 'all' ? 'All Grades' : `Grade ${n.target}`}
                      </span>
                      {n.isActive === false && <span className="bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-full font-bold uppercase">Inactive</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleToggleNotice(n)} className="p-1 text-slate-400 hover:text-amber-500 transition" title={n.isActive === false ? 'Activate' : 'Deactivate'}>
                        {n.isActive === false ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button onClick={() => handleEditNotice(n)} className="p-1 text-slate-400 hover:text-blue-500 transition"><Edit size={18}/></button>
                      <button onClick={() => handleDeleteNotice(n.id)} className="p-1 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{n.title}</h3>
                  <p className="text-slate-600 mb-4 flex-grow whitespace-pre-wrap">{n.message}</p>
                  <div className="text-xs text-slate-400 text-right">
                    {new Date(n.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {noticesList.length === 0 && (
                <div className="col-span-full text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-100">No broadcasted notices.</div>
              )}
            </div>
          </div>
        )}

        {/* --- LIVE CLASSES TAB --- */}
        {activeTab === 'liveClasses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Live Classes</h2>
              <button 
                onClick={() => {
                  setShowLiveForm(!showLiveForm);
                  if (showLiveForm) setEditingLiveId(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition shadow-sm"
              >
                {showLiveForm ? 'Cancel' : <><Plus size={18} /> New Live Class</>}
              </button>
            </div>

            {showLiveForm && (
              <div className="bg-white p-6 rounded-2xl shadow-md border border-rose-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-600">
                  <Video size={20} /> {editingLiveId ? 'Edit Live Class' : 'Schedule Live Class'}
                </h3>
                <form onSubmit={handleLiveSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Title</label>
                      <input required type="text" value={liveForm.title} onChange={e => setLiveForm({...liveForm, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500" placeholder="E.g. Grade 6 Science Live" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                      <select value={liveForm.subject_id} onChange={e => setLiveForm({...liveForm, subject_id: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500 bg-white">
                        <option value="">— No specific subject —</option>
                        {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                      <select required value={liveForm.target} onChange={e => setLiveForm({...liveForm, target: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500 bg-white">
                        <option value="all">All Grades (Students &amp; Teachers)</option>
                        {[6,7,8,9,10,11].map(g => <option key={g} value={String(g)}>Grade {g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link</label>
                      <input required type="url" value={liveForm.link} onChange={e => setLiveForm({...liveForm, link: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500" placeholder="https://zoom.us/j/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input required type="date" value={liveForm.date} onChange={e => setLiveForm({...liveForm, date: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                        <input required type="time" value={liveForm.time} onChange={e => setLiveForm({...liveForm, time: e.target.value})} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button type="submit" className="px-6 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 flex flex-row items-center gap-2">
                      {editingLiveId ? 'Update Live Class' : <><Send size={16}/> Schedule & Broadcast</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveSessionsList.map((s) => (
                <div key={s.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${s.isActive === false ? 'border-dashed border-slate-300 opacity-60 grayscale' : 'border-slate-100 border-l-4 border-l-rose-500'} flex flex-col hover:shadow-md transition`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 items-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${s.target === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                        {s.target === 'all' ? 'All Grades' : `Grade ${s.target}`}
                      </span>
                      {s.isActive === false && <span className="bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-full font-bold uppercase">Inactive</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleToggleLive(s)} className="p-1 text-slate-400 hover:text-amber-500 transition" title={s.isActive === false ? 'Activate' : 'Deactivate'}>
                        {s.isActive === false ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button onClick={() => handleEditLive(s)} className="p-1 text-slate-400 hover:text-blue-500 transition"><Edit size={18}/></button>
                      <button onClick={() => handleDeleteLive(s.id)} className="p-1 text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
                  <div className="space-y-1 mb-4 flex-grow">
                     {s.subject_id && (
                       <p className="text-rose-600 text-sm font-semibold flex items-center gap-2">
                         <BookOpen size={14}/> {subjectsList.find(sub => sub.id === s.subject_id)?.name || 'Unknown Subject'}
                       </p>
                     )}
                     <p className="text-slate-600 text-sm flex items-center gap-2"><Calendar size={14}/> {s.date}</p>
                     <p className="text-slate-600 text-sm flex items-center gap-2"><Clock size={14}/> {s.time}</p>
                     <p className="text-slate-600 text-sm truncate mt-2 font-mono bg-slate-50 p-1 rounded border overflow-hidden"><a href={s.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{s.link}</a></p>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    Created {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {liveSessionsList.length === 0 && (
                <div className="col-span-full text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-100">No live classes scheduled.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
