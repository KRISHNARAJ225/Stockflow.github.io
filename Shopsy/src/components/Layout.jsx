import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Tag,
  Package,
  ReceiptText,
  Users,
  User,
  Moon,
  Settings,
  HelpCircle,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  Menu,
  Maximize,
  Sun,
  Calendar
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Layout = ({ children, activePage, setActivePage, onLogout, currentUser }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);

  const { products, customers, notifications } = useData();

  useEffect(() => {
    if (notifications?.length > 0) {
      setToast(notifications[0]);
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(e.target.value.length > 0);
  };

  const filteredSearchMap = {
    products: products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    customers: customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
  };

  const handleSearchResultClick = (type, item) => {
    setSearchQuery(item.name);
    setShowSearchDropdown(false);
    setActivePage(type === 'product' ? 'products' : 'customer');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'category', label: 'Categories', icon: Tag },
    { id: 'products', label: 'Product', icon: Package },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'orders', label: 'Transaction', icon: ReceiptText },
  ];

  const othersItems = [
    { id: 'customer', label: 'Customer', icon: Users },
    { id: 'user', label: 'User', icon: User },
  ];

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-[#1e1e2d] text-white' : 'bg-[#f4f7fe] text-slate-800'}`}>
      {/* Sidebar - Farmaku Style */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-[260px]'} flex flex-col fixed h-full z-30 transition-all duration-300 ${darkMode ? 'bg-[#151521] border-slate-800' : 'bg-white border-slate-100 border-r shadow-sm'}`}>
        <div className="h-20 flex items-center px-6 border-b border-transparent justify-between">
          <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <div className="w-8 h-8 rounded bg-[#1b2559] flex items-center justify-center shrink-0">
              <div className="w-4 h-4 text-white relative flex justify-center items-center">
                <div className="w-1 h-4 bg-white absolute"></div>
                <div className="w-4 h-1 bg-white absolute"></div>
              </div>
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-[#1b2559]'} whitespace-nowrap`}>StockFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 rounded-lg ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'} transition-colors ml-auto flex-shrink-0`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {/* MENU */}
          <div className="mb-8">
            {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 transition-opacity duration-200">MENU</p>}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-[#1b2559] text-white shadow-md shadow-[#1b2559]/20'
                        : `${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-current'}`} />
                      {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">{item.label}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* OTHERS */}
          <div className="mb-8">
            {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 transition-opacity duration-200">OTHERS</p>}
            <div className="space-y-1">
              {othersItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-[#1b2559] text-white shadow-md shadow-[#1b2559]/20'
                        : `${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-current'}`} />
                      {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">{item.label}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PREFERENCES */}
          <div>
            {!isSidebarCollapsed && <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 transition-opacity duration-200">PREFERENCES</p>}
            <div className="space-y-1">
              {/* Dark Mode Toggle */}
              <div 
                onClick={() => isSidebarCollapsed && setDarkMode(!darkMode)}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center cursor-pointer' : 'justify-between'} px-4 py-3 rounded-xl group ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-all duration-200`}
              >
                <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  <Moon className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide">Dark Mode</span>}
                </div>
                {/* Toggle Switch */}
                {!isSidebarCollapsed && (
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-[#1b2559]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform duration-300 shadow-sm ${darkMode ? 'left-4.5 translate-x-[18px]' : 'left-0.5'}`}></div>
                  </button>
                )}
              </div>

              <button className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">Settings</span>}
                </div>
              </button>

              <button className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">Help</span>}
                </div>
              </button>

              <button 
                onClick={onLogout}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${darkMode ? 'text-red-400 hover:bg-slate-800 hover:text-red-300' : 'text-red-500 hover:bg-red-50'}`}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 group-hover:text-current" />
                  {!isSidebarCollapsed && <span className="text-[14px] font-medium tracking-wide whitespace-nowrap">Log Out</span>}
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-[260px]'} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Header */}
        <header className={`h-20 transition-all duration-300 ${darkMode ? 'bg-[#1e1e2d]/90' : 'bg-[#f4f7fe]/90'} backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20`}>
          <div className="flex items-center gap-12">
            <div>
              <p className="text-xs text-slate-400 font-medium">Welcome,</p>
              <h2 className={`text-2xl font-black tracking-tight bg-gradient-to-r from-[#1b2559] to-[#4318FF] text-transparent bg-clip-text animate-pulse decoration-clone ${darkMode ? 'from-white to-blue-300' : ''}`}>
                {currentUser?.name || 'Admin User'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className={`hidden lg:flex items-center rounded-xl shadow-sm border px-4 py-2.5 w-80 relative ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search anything"
                className={`bg-transparent border-none outline-none text-sm w-full font-medium ${darkMode ? 'text-white' : 'text-slate-600'}`}
              />
              
              {showSearchDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border overflow-hidden z-50 ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
                  {filteredSearchMap.products.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Products</p>
                      {filteredSearchMap.products.map(p => (
                        <div key={p.id} onClick={() => handleSearchResultClick('product', p)} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#1b2559] hover:text-white text-slate-700'}`}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredSearchMap.customers.length > 0 && (
                    <div className={`py-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customers</p>
                      {filteredSearchMap.customers.map(c => (
                        <div key={c.id} onClick={() => handleSearchResultClick('customer', c)} className={`px-4 py-2 text-sm cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-[#1b2559] hover:text-white text-slate-700'}`}>
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredSearchMap.products.length === 0 && filteredSearchMap.customers.length === 0 && (
                    <div className="px-4 py-4 text-sm text-slate-500 text-center">No results found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`relative p-2 rounded-full transition-all ${darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen()} 
                className={`hidden md:block relative p-2 rounded-full transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <Maximize className="w-5 h-5" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                   
                  className={`relative p-2 rounded-full transition-all ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications?.length > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f4f7fe] dark:border-[#151521]"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 mt-3 w-72 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border py-2 z-50 ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <h3 className={`text-sm font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications?.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50'} transition-colors`}>
                          <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.message}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(n.date).toLocaleDateString()} {new Date(n.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      )) : (
                        <div className="px-4 py-6 text-center text-sm text-slate-400 font-medium">No new notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <div 
                  className="flex items-center gap-3 pl-4 ml-1 border-l border-slate-200 dark:border-slate-700 cursor-pointer group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt={currentUser?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-bold ${darkMode ? 'text-white group-hover:text-blue-300' : 'text-slate-800 group-hover:text-[#1b2559]'} transition-colors`}>{currentUser?.name?.split(' ')[0] || 'Admin'}</p>
                  </div>
                </div>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-3 w-64 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border py-2 z-50 ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} bg-slate-50/50 dark:bg-slate-800/20`}>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser?.name || 'Admin User'}</p>
                      <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.email || 'admin@example.com'}</p>
                      {currentUser?.phone && <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-blue-400' : 'text-[#4318FF]'}`}>{currentUser.phone}</p>}
                    </div>
                    <div className="py-2">
                       <button 
                        onClick={onLogout}
                        className={`w-full text-left px-4 py-2.5 text-sm font-bold ${darkMode ? 'text-slate-300 hover:bg-[#1b2559] hover:text-white' : 'text-slate-600 hover:bg-[#1b2559] hover:text-white'} transition-colors`}
                      >
                        Change Password
                      </button>
                    </div>
                    <div className={`py-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <button 
                        onClick={onLogout}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Notification System */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-bounce-in shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100">
          <div className={`rounded-xl border p-4 flex items-center gap-4 w-80 relative overflow-hidden ${darkMode ? 'bg-[#151521] border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full bg-[#4318FF]`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-500/10' : 'bg-[#F4F7FE]'}`}>
              <Bell className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-[#4318FF]'}`} />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>New Update</h4>
              <p className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
