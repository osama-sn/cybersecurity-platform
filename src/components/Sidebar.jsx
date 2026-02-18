import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, Hash, BookOpen, Layers, ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const SidebarItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.modules && item.modules.length > 0;

  const toggleOpen = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <div
        className={`
          flex items-center justify-between p-2 rounded-md hover:bg-cyber-800 transition-colors cursor-pointer
          ${depth > 0 ? 'ml-4' : ''}
        `}
        onClick={hasChildren ? toggleOpen : undefined}
      >
        <div className="flex items-center gap-2 text-cyber-300 hover:text-white">
          {depth === 0 && <Layers size={18} />}
          {depth === 1 && <Hash size={16} />}
          <span className="text-sm font-medium">{item.title}</span>
        </div>
        {hasChildren && (
          <div className="text-cyber-500">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="mt-1 space-y-1">
          {item.modules.map(module => (
            <SidebarItem key={module.id} item={module} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { sections } = useData();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-cyber-900 border-r border-cyber-700
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        ${isOpen ? 'md:w-64' : 'md:w-0 md:border-r-0 md:overflow-hidden'}
        w-64
      `}>
        <div className="p-4 border-b border-cyber-700 flex items-center gap-2">
          <BookOpen className="text-cyber-primary" size={24} />
          <span className="text-xl font-bold tracking-tight text-white font-arabic">النخبة</span>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-65px)] scrollbar-hide">
          <div className="text-xs font-semibold text-cyber-500 uppercase tracking-wider mb-2">
            {t('sidebar.learningPath')}
          </div>

          {sections.map(section => (
            <div key={section.id} className="mb-2">
              <div className="text-cyber-200 font-bold px-2 py-1">{section.title}</div>
            </div>
          ))}

          {sections.length === 0 && (
            <p className="text-sm text-cyber-500 text-center py-4">{t('sidebar.noSections')}</p>
          )}

          {/* Static Links */}
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-cyber-800 text-white' : 'text-cyber-400 hover:text-cyber-200'}`}>
            <span>{t('sidebar.home')}</span>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-cyber-800 text-white' : 'text-cyber-400 hover:text-cyber-200'}`}>
            <span>{t('sidebar.about')}</span>
          </NavLink>

          {/* Admin Link */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-cyber-700">
              <div className="text-xs font-semibold text-cyber-500 uppercase tracking-wider mb-2">
                {t('sidebar.admin')}
              </div>
              <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-2 p-2 rounded-md transition-colors ${isActive ? 'bg-cyber-danger/10 text-cyber-danger border border-cyber-danger/20' : 'text-cyber-400 hover:text-cyber-danger'}`}>
                <ShieldAlert size={18} />
                <span>{t('common.adminArea')}</span>
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

// Helper for NavLink typo fix in above block and actual usage
const NavLik = NavLink;

export default Sidebar;
