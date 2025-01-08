import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Rocket, Menu, X, User, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Navbar = () => {
  const { currentUser, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Rocket className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900">FounderConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                {userProfile?.role === 'founder' ? (
                  <Link to="/post-idea" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                    Post Idea
                  </Link>
                ) : (
                  <Link to="/browse-ideas" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                    Browse Ideas
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                  >
                    <User className="h-5 w-5" />
                    <span>{userProfile?.name}</span>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-indigo-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {userProfile?.role === 'founder' ? (
                  <Link
                    to="/post-idea"
                    className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Idea
                  </Link>
                ) : (
                  <Link
                    to="/browse-ideas"
                    className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse Ideas
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;