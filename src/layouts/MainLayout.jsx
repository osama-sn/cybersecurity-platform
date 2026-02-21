import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const MainLayout = () => {
  // Start open on desktop (md = 768px), closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { mode, toggleMode, isLearningMode } = useMode();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    console.log('🔓 Attempting to logout...');
    setProfileMenuOpen(false);

    try {
      await logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    } finally {
      console.log('🔄 Navigating to login page...');
      navigate('/login');
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-cyber-900 text-cyber-200 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full relative tranisition-all duration-300">
        {/* Header */}
        <header className="h-16 border-b border-cyber-700 bg-cyber-900/95 backdrop-blur flex items-center justify-between px-4 z-40">
          <button
            className="p-2 text-cyber-400 hover:text-white transition-colors"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 md:flex-none" />

          <div className="flex items-center gap-1.5 md:gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider bg-cyber-800 text-cyber-300 hover:bg-cyber-700 transition-colors border border-cyber-600 shrink-0"
            >
              <span className="hidden sm:inline">{language === 'ar' ? 'English' : 'العربية'}</span>
              <span className="sm:hidden">{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className={`
                px-2 md:px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors shrink-0
                ${isLearningMode
                  ? 'bg-cyber-primary/10 text-cyber-primary border border-cyber-primary/20'
                  : 'bg-cyber-secondary/10 text-cyber-secondary border border-cyber-secondary/20'}
              `}
            >
              <span className="hidden sm:inline">{mode} Mode</span>
              <span className="sm:hidden">{isLearningMode ? '📚' : '📖'}</span>
            </button>

            {/* Profile / Auth */}
            <div className="flex items-center gap-1 md:gap-2">
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  {/* Profile Button */}
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-cyber-600 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-cyber-700 flex items-center justify-center border border-cyber-600">
                        <User size={16} />
                      </div>
                    )}
                    <ChevronDown
                      size={14}
                      className={`text-cyber-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-64 bg-cyber-800 border border-cyber-700 rounded-lg shadow-xl shadow-black/40 overflow-hidden z-50 text-start`}>
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-cyber-700">
                        <p className="text-sm font-medium text-white truncate">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-cyber-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-cyber-300 hover:bg-cyber-700 hover:text-white transition-colors"
                        >
                          <Settings size={16} />
                          {language === 'ar' ? 'الإعدادات' : 'Settings'}
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-cyber-700 py-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          <LogOut size={16} />
                          {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    className="hidden sm:block text-xs md:text-sm font-medium hover:text-cyber-primary px-2 md:px-3 py-1.5"
                    onClick={() => navigate('/login')}
                  >
                    {t('sidebar.login')}
                  </button>
                  <button
                    className="text-xs md:text-sm font-medium bg-cyber-primary text-cyber-900 px-2 md:px-3 py-1.5 rounded-md hover:bg-cyber-primary/90 transition-colors shrink-0"
                    onClick={() => navigate('/signup')}
                  >
                    <span className="hidden sm:inline">Sign Up</span>
                    <span className="sm:hidden flex items-center gap-1"><User size={14} /> Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
