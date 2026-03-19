import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CourseViewer from './pages/CourseViewer';
import ModuleEditor from './pages/ModuleEditor';
import SubjectView from './pages/SubjectView';
import AdminDashboard from './pages/AdminDashboard';
import GradeModulesView from './pages/GradeModulesView';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-200 selection:text-purple-900">
        <Navbar />
        <ChatWidget />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subject/:id" element={<SubjectView />} />
          <Route path="/course/:id" element={<CourseViewer />} />
          <Route path="/subject/:subjectId/grade/:grade" element={<GradeModulesView />} />
          <Route path="/module/new" element={<ModuleEditor />} />
          <Route path="/module/edit/:id" element={<ModuleEditor />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
