import React, { useState } from 'react';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CustomerPage from './components/CustomerPage';
import CategoryPage from './components/CategoryPage';
import ProductPage from './components/ProductPage';
import OrdersPage from './components/OrdersPage';
import UserPage from './components/UserPage';
import CalendarPage from './components/CalendarPage';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = (user) => {
    setCurrentUser(user || { name: 'Admin', email: 'admin@example.com', phone: '1234567890' });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'customer':
        return <CustomerPage />;
      case 'category':
        return <CategoryPage />;
      case 'products':
        return <ProductPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'orders':
        return <OrdersPage />;
      case 'user':
        return <UserPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="App">
          <Layout currentUser={currentUser} activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout}>
            {renderPage()}
          </Layout>
        </div>
      )}
    </DataProvider>
  );
}

export default App;
