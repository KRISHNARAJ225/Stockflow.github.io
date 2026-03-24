import React, { useState, useEffect } from 'react';
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
import Layout from './components/Layout';
import './App.css';

const AppContent = () => {
  const { setAuthToken, clearData, token } = useData();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [validating, setValidating] = useState(true);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#1b2559');
  const [zoomLevel, setZoomLevel]     = useState(() => parseInt(localStorage.getItem('zoomLevel') || '100', 10));

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
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'customer':  return <CustomerPage />;
      case 'category':  return <CategoryPage />;
      case 'products':  return <ProductPage />;
      case 'calendar':  return <CalendarPage />;
      case 'orders':    return <OrdersPage />;
      case 'user':      return <UserPage />;
      case 'settings':  return <SettingsPage currentUser={currentUser} onSettingsChange={handleSettingsChange} />;
      default:          return <Dashboard />;
    }
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
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={handleLogout}
            accentColor={accentColor}
            zoomLevel={zoomLevel}
          >
            {renderPage()}
          </Layout>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
