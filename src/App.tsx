import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CalculationProvider } from './contexts/CalculationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import SharedCalculation from './pages/SharedCalculation';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Auth Route Component (redirects authenticated users)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CalculationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* Shared calculation route - accessible to everyone */}
              <Route path="/shared/:id" element={<SharedCalculation />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <AuthRoute>
                    <Signup />
                  </AuthRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </CalculationProvider>
    </AuthProvider>
  );
}

export default App;