import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/db';
import { BookOpen } from 'lucide-react';

const Login = () => {
  const [code, setCode] = useState(''); // Renamed from studentCode to code
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const navigate = useNavigate();

  const handleLogin = async (e) => { // Made async
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state
    // Add artificial delay for UI transition feel
    await new Promise(r => setTimeout(r, 600));
    
    // The original code had `studentCode` and `password`.
    // The instruction implies `authService.login` now takes a single `code` argument.
    // Assuming `code` is the new single input for login.
    const result = await authService.login(code); 
    
    if (result) {
      if (result.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } else {
      setError('Invalid login code or your account is deactivated.');
    }
    setIsLoading(false); // Clear loading state
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex justify-center mb-6">
          <BookOpen className="w-12 h-12 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">Access Your Portal</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Student/Teacher Code</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. S12345 or T001"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 text-slate-400"
              placeholder="Disabled for demo"
              disabled
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : 'Log In'}
          </button>
        </form>
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-800">
          <p className="font-semibold mb-1">Demo Instructions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Any code/password works</li>
            <li>Use <code className="bg-white px-1 rounded">teacher</code> as code for Teacher view</li>
            <li>Random codes default to Student view</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
