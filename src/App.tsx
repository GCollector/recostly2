import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  return (
    <AuthProvider>
      <CalculationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/shared/:id" element={<SharedCalculation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Layout>
        </Router>
      </CalculationProvider>
    </AuthProvider>
  );
}

export default App;