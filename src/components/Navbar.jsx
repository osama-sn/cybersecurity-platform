import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, User } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white">CyberLearn</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`transition-colors ${isActive('/') ? 'text-purple-300' : 'text-white/70 hover:text-white'}`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`transition-colors ${isActive('/about') ? 'text-purple-300' : 'text-white/70 hover:text-white'}`}
          >
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <User size={16} className="text-white/70" />
            <span className="text-sm text-white/70">Osama Essam</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors md:hidden"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors ${isActive('/') ? 'text-purple-300' : 'text-white/70 hover:text-white'}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`transition-colors ${isActive('/about') ? 'text-purple-300' : 'text-white/70 hover:text-white'}`}
            >
              About
            </Link>
            <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
              <User size={16} className="text-white/70" />
              <span className="text-sm text-white/70">Osama Essam</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
