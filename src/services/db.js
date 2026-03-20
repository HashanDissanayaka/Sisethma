import { supabase } from './supabaseClient';

// --- AUTH HANDLERS ---
export const authService = {
  login: async (student_code) => {
    // For the migration demo, we use student_code directly with no password.
    const { data, error } = await supabase
      .from('lms_users')
      .select('*')
      .eq('student_code', student_code)
      .single();
      
    if (error || !data) return null;
    
    // Check if isActive explicitly false
    if (data.isActive === false) return null;
    
    sessionStorage.setItem('lms_user', JSON.stringify(data));
    return data;
  },
  logout: () => {
    sessionStorage.removeItem('lms_user');
  },
  getCurrentUser: () => {
    const user = sessionStorage.getItem('lms_user');
    return user ? JSON.parse(user) : null;
  }
};

// --- USERS DB HANDLERS ---
export const getUsers = async () => {
  const { data, error } = await supabase.from('lms_users').select('*').order('id', { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
};

export const addUser = async (newUser) => {
  if (newUser.role === 'student' || newUser.role === 'teacher') {
      newUser.assigned_subjects = newUser.assigned_subjects || [];
  }
  const { data, error } = await supabase.from('lms_users').insert(newUser).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateUser = async (id, updatedUser) => {
  const { data, error } = await supabase.from('lms_users').update(updatedUser).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  // Update local session storage if operating on self
  const currentUser = authService.getCurrentUser();
  if (currentUser && currentUser.id === id) {
      sessionStorage.setItem('lms_user', JSON.stringify(data));
  }
  return data;
};

export const deleteUser = async (id) => {
  const { error } = await supabase.from('lms_users').delete().eq('id', id);
  if (error) console.error(error);
};

// --- SUBJECTS DB HANDLERS ---
export const getSubjects = async () => {
  const { data, error } = await supabase.from('lms_subjects').select('*').order('id', { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
};

export const addSubject = async (newSubject) => {
  const { data, error } = await supabase.from('lms_subjects').insert(newSubject).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateSubject = async (id, updatedSubject) => {
  const { data, error } = await supabase.from('lms_subjects').update(updatedSubject).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const deleteSubject = async (id) => {
  const { error } = await supabase.from('lms_subjects').delete().eq('id', id);
  if (error) console.error(error);
};

// --- MODULES DB HANDLERS ---
export const getModules = async () => {
  const { data, error } = await supabase.from('lms_modules').select('*').order('id', { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
};

export const addModule = async (newModule) => {
  const { data, error } = await supabase.from('lms_modules').insert(newModule).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateModule = async (id, updatedModule) => {
  const { data, error } = await supabase.from('lms_modules').update(updatedModule).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const deleteModule = async (id) => {
  const { error } = await supabase.from('lms_modules').delete().eq('id', id);
  if (error) console.error(error);
};

// --- NOTICES DB HANDLERS ---
export const getNotices = async () => {
  const { data, error } = await supabase.from('lms_notices').select('*').order('id', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
};

export const addNotice = async (newNotice) => {
  const { data, error } = await supabase.from('lms_notices').insert(newNotice).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateNotice = async (id, updatedNotice) => {
  const { data, error } = await supabase.from('lms_notices').update(updatedNotice).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const deleteNotice = async (id) => {
  const { error } = await supabase.from('lms_notices').delete().eq('id', id);
  if (error) console.error(error);
};

// --- LIVE CLASSES DB HANDLERS ---
export const getLiveSessions = async () => {
  const { data, error } = await supabase.from('lms_live_classes').select('*').order('id', { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
};

export const addLiveSession = async (newSession) => {
  const { data, error } = await supabase.from('lms_live_classes').insert(newSession).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateLiveSession = async (id, updatedSession) => {
  const { data, error } = await supabase.from('lms_live_classes').update(updatedSession).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const deleteLiveSession = async (id) => {
  const { error } = await supabase.from('lms_live_classes').delete().eq('id', id);
  if (error) console.error(error);
};

// --- QUIZZES DB HANDLERS ---
export const getQuizzes = async () => {
  const { data, error } = await supabase.from('lms_quizzes').select('*');
  if (error) { console.error(error); return []; }
  return data;
};

export const addQuiz = async (newQuiz) => {
  const { data, error } = await supabase.from('lms_quizzes').insert(newQuiz).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateQuiz = async (moduleId, updatedQuiz) => {
  const { data, error } = await supabase.from('lms_quizzes').update(updatedQuiz).eq('module_id', moduleId).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

// --- PROGRESS DB HANDLERS ---
export const getProgress = async (userId) => {
  const { data, error } = await supabase.from('lms_progress').select('*').eq('user_id', userId);
  if (error) { console.error(error); return []; }
  return data;
};

export const markModuleComplete = async (userId, moduleId) => {
  const { data, error } = await supabase
    .from('lms_progress')
    .upsert({ user_id: userId, module_id: moduleId }, { onConflict: 'user_id,module_id' })
    .select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const unmarkModuleComplete = async (userId, moduleId) => {
  const { error } = await supabase.from('lms_progress').delete().eq('user_id', userId).eq('module_id', moduleId);
  if (error) console.error(error);
};

// --- TIMETABLE DB HANDLERS ---
export const getTimetable = async () => {
  const { data, error } = await supabase.from('lms_timetable').select('*').order('grade').order('day').order('time');
  if (error) { console.error(error); return []; }
  return data;
};

export const addTimetableEntry = async (entry) => {
  const { data, error } = await supabase.from('lms_timetable').insert(entry).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const updateTimetableEntry = async (id, entry) => {
  const { data, error } = await supabase.from('lms_timetable').update(entry).eq('id', id).select().single();
  if (error) { console.error(error); return null; }
  return data;
};

export const deleteTimetableEntry = async (id) => {
  const { error } = await supabase.from('lms_timetable').delete().eq('id', id);
  if (error) console.error(error);
};
