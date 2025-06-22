import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calculator,
  Home,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!loading && user && (location.pathname === '/login' || location.pathname === '/signup')) {
      console.log('Redirecting authenticated user from auth page to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setProfileDropdownOpen(false);
    };

    if (profileDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
  ];

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await signOut();
      setProfileDropdownOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading spinner only briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-neutral flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-neutral">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold font-heading text-gradient">
                  Recostly
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-2 hover:bg-white/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-colored-primary">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                        <div className="text-xs text-neutral-500 capitalize">{user.tier}</div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-400" />
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 card animate-scale-in z-dropdown">
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                        <div className="mt-1">
                          <span className={`badge ${
                            user.tier === 'premium' ? 'badge-primary' : 
                            user.tier === 'basic' ? 'badge-secondary' : 'badge-outline'
                          }`}>
                            {user.tier}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Calculations
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Account Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-neutral-500 hover:text-neutral-700 p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-lg">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block pl-3 pr-4 py-3 text-base font-medium border-l-4 transition-colors ${
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 inline mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-neutral-200">
              {user ? (
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <div className="text-base font-medium text-neutral-800">
                      {user.name}
                    </div>
                    <div className="text-sm text-neutral-500">{user.email}</div>
                    <div className="mt-1">
                      <span className={`badge ${
                        user.tier === 'premium' ? 'badge-primary' : 
                        user.tier === 'basic' ? 'badge-secondary' : 'badge-outline'
                      }`}>
                        {user.tier}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Calculations
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main content with proper spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;