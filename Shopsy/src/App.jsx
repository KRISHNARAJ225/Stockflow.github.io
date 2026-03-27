import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import { validateToken, logoutUser } from './Service.js/AuthService';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CustomerPage from './components/CustomerPage';
import CategoryPage from './components/CategoryPage';
import ProductPage from './components/ProductPage';
import OrdersPage from './components/OrdersPage';
import UserPage from './components/UserPage';
import CalendarPage from './components/CalendarPage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import Layout from './components/Layout';
import './App.css';

const AppContent = () => {
  const { setAuthToken, clearData, token } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [validating, setValidating] = useState(true);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#1b2559');
  const [zoomLevel, setZoomLevel] = useState(() => parseInt(localStorage.getItem('zoomLevel') || '100', 10));

  const handleSettingsChange = ({ accentColor: c, zoomLevel: z }) => {
    if (c !== undefined) setAccentColor(c);
    if (z !== undefined) setZoomLevel(z);
  };

  // Validate stored token on mount
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const isValid = await validateToken(storedToken);
        if (!isValid) {
          // Token expired — force logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setAuthToken(null);
          setCurrentUser(null);
        } else {
          setAuthToken(storedToken);
        }
      }
      setValidating(false);
    };
    checkToken();
  }, []);

  const handleLogin = (apiResponse) => {
    // Response shape: { HttpStatus, message, data: { token, username, email, role } }
    const data = apiResponse?.data;
    const token = data?.token;
    const user = {
      name: data?.username || '',
      email: data?.email || '',
      role: data?.role || 'user',
    };
    if (token) setAuthToken(token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await logoutUser(token);
    setAuthToken(null);
    clearData();
    setCurrentUser(null);
    navigate('/dashboard');
  };

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.slice(1); // Remove leading slash
    return path || 'dashboard';
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
        <div className="w-8 h-8 border-4 border-[#1b2559] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="App">
          <Layout
            currentUser={currentUser}
            activePage={getCurrentPage()}
            navigate={navigate}
            onLogout={handleLogout}
            accentColor={accentColor}
            zoomLevel={zoomLevel}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/settings" element={<SettingsPage currentUser={currentUser} onSettingsChange={handleSettingsChange} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <DataProvider>
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
}

export default App;
