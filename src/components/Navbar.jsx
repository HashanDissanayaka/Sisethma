import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/db';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHome ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Sisethma Logo" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Teachers', 'Classes', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`text-sm font-medium hover:text-purple-500 transition-colors ${isScrolled || !isHome ? 'text-slate-600' : 'text-slate-200'}`}
              >
                {item}
              </button>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">Admin Portal</Link>
                )}
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-purple-500 transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="px-5 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-700 transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ?
              <X className={isScrolled || !isHome ? 'text-slate-900' : 'text-white'} /> :
              <Menu className={isScrolled || !isHome ? 'text-slate-900' : 'text-white'} />
            }
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 bg-white z-40 flex items-center justify-center md:hidden"
            >
              <div className="flex flex-col items-center gap-8">
                {['Home', 'Teachers', 'Classes', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-2xl font-medium text-slate-800"
                  >
                    {item}
                  </button>
                ))}
                
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-red-600">Admin Portal</Link>
                    )}
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-purple-600">Dashboard</Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-2xl font-medium text-red-500">Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-purple-600">Login</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
