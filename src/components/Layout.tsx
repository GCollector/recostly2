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
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  // Scroll to top on route change - this is the proper place for it
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  // Same navigation for both logged-in and logged-out users (no pricing in header)
  const loggedOutNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
  ];

  const loggedInNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  const navigation = user ? loggedInNavigation : loggedOutNavigation;

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

  // REMOVED: No loading spinner - app loads immediately
  // The background authentication will handle user state updates

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold font-heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
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
                    className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-slate-100 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-medium font-sans text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium font-sans text-slate-900">{user.name}</div>
                        <div className="text-xs font-sans text-slate-500 capitalize">{user.tier}</div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="text-sm font-medium font-sans text-slate-900">{user.name}</div>
                        <div className="text-sm font-sans text-slate-500">{user.email}</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-sans ${
                            user.tier === 'premium' ? 'bg-amber-100 text-amber-800' : 
                            user.tier === 'basic' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {user.tier}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-sm font-sans text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Account Settings
                      </Link>
                      <Link
                        to="/pricing"
                        className="flex items-center px-4 py-3 text-sm font-sans text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <CreditCard className="h-4 w-4 mr-3" />
                        Pricing & Plans
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-sans text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
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
                    className="text-slate-600 hover:text-slate-900 text-sm font-medium font-sans transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
          <div className="sm:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block pl-3 pr-4 py-3 text-base font-medium font-sans border-l-4 transition-colors ${
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 inline mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-slate-200">
              {user ? (
                <div className="space-y-1">
                  <div className="px-4 py-2">
                    <div className="text-base font-medium font-sans text-slate-800">
                      {user.name}
                    </div>
                    <div className="text-sm font-sans text-slate-500">{user.email}</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-sans ${
                        user.tier === 'premium' ? 'bg-amber-100 text-amber-800' : 
                        user.tier === 'basic' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {user.tier}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-base font-medium font-sans text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    to="/pricing"
                    className="block px-4 py-2 text-base font-medium font-sans text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pricing & Plans
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium font-sans text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-base font-medium font-sans text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-base font-medium font-sans text-slate-500 hover:text-slate-800 hover:bg-slate-100"
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