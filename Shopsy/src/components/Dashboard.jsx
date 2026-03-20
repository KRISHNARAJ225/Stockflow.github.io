import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Users,
  ReceiptText,
  Briefcase,
  DollarSign,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Dashboard = () => {
  const { customers, orders } = useData();
  const [revenueView, setRevenueView] = useState('weekly');

  const totalCustomers = customers.length;
  const totalTransactions = orders.length;
  const totalSales = orders.reduce((sum, order) => 
    sum + order.products.reduce((acc, p) => acc + p.quantity, 0)
  , 0);
  const totalIncome = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  // Line Chart Data
  const salesPerformanceData = [
    { name: 'Jan', 2024: 15, 2025: 20 },
    { name: 'Feb', 2024: 18, 2025: 28 },
    { name: 'Mar', 2024: 21, 2025: 35 },
    { name: 'Apr', 2024: 24, 2025: 38 },
    { name: 'May', 2024: 28, 2025: 40 },
    { name: 'Jun', 2024: 25, 2025: 45 },
    { name: 'Jul', 2024: 30, 2025: 50 },
    { name: 'Aug', 2024: 28, 2025: 48 },
    { name: 'Sep', 2024: 32, 2025: 52 },
    { name: 'Oct', 2024: 36, 2025: 56 },
    { name: 'Nov', 2024: 40, 2025: 60 },
    { name: 'Dec', 2024: 44, 2025: 65 },
  ];

  // Pie Chart Data
  const paymentMethodsData = [
    { name: 'E-Wallet', value: 36, color: '#1B2559' },
    { name: 'Cash', value: 24, color: '#828DF8' },
    { name: 'QRIS', value: 18, color: '#E0E5F2' },
    { name: 'Debit Card', value: 22, color: '#4318FF' },
  ];

  // Bar Chart Data - Weekly
  const weeklyRevenueData = [
    { name: 'Sun', TargetRevenue: 2000, ActualRevenue: 900 },
    { name: 'Mon', TargetRevenue: 2800, ActualRevenue: 1700 },
    { name: 'Tue', TargetRevenue: 2200, ActualRevenue: 1500 },
    { name: 'Wed', TargetRevenue: 3000, ActualRevenue: 2400 },
    { name: 'Thr', TargetRevenue: 2500, ActualRevenue: 2900 },
    { name: 'Fri', TargetRevenue: 2000, ActualRevenue: 3300 },
    { name: 'Sat', TargetRevenue: 2500, ActualRevenue: 0 },
  ];

  // Bar Chart Data - Monthly
  const monthlyRevenueData = [
    { name: 'Jan', TargetRevenue: 8000, ActualRevenue: 8500 },
    { name: 'Feb', TargetRevenue: 8500, ActualRevenue: 7200 },
    { name: 'Mar', TargetRevenue: 9000, ActualRevenue: 9600 },
    { name: 'Apr', TargetRevenue: 8000, ActualRevenue: 8900 },
    { name: 'May', TargetRevenue: 9500, ActualRevenue: 9800 },
    { name: 'Jun', TargetRevenue: 10000, ActualRevenue: 11200 },
  ];

  const currentRevenueData = revenueView === 'weekly' ? weeklyRevenueData : monthlyRevenueData;

  // Table Data
  const topTransactions = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 6)
    .map(order => ({
      id: `#ORD-${order.id.toString().padStart(4, '0')}`,
      customer: order.customerName,
      date: order.orderDate,
      items: order.products.reduce((acc, p) => acc + p.quantity, 0),
      purchase: `$${(order.totalAmount || 0).toFixed(2)}`
    }));

  return (
    <div className="space-y-6">
      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-blue-500 transition-colors">Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{totalCustomers.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-[#F4F7FE] rounded-full flex items-center justify-center text-[#4318FF] group-hover:scale-110 group-hover:bg-[#4318FF] group-hover:text-white transition-all duration-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Transaction */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 hover:border-pink-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-pink-500 transition-colors">Total Transaction</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-pink-600 transition-colors">{totalTransactions.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-[#FFF3F8] rounded-full flex items-center justify-center text-[#FF2E93] group-hover:scale-110 group-hover:bg-[#FF2E93] group-hover:text-white transition-all duration-300">
            <ReceiptText className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-orange-500 transition-colors">Total Sales</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-orange-500 transition-colors">{totalSales.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-[#FFF6EE] rounded-full flex items-center justify-center text-[#FF9E4A] group-hover:scale-110 group-hover:bg-[#FF9E4A] group-hover:text-white transition-all duration-300">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-200 transition-all duration-300 group cursor-pointer">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 group-hover:text-emerald-500 transition-colors">Total Income</p>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">$ {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
          <div className="w-12 h-12 bg-[#E1FDE5] rounded-full flex items-center justify-center text-[#05CD99] group-hover:scale-110 group-hover:bg-[#05CD99] group-hover:text-white transition-all duration-300">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 relative">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sales Performance</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">See how your sales grow month by month in 2024 and 2025</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-[#1B2559]"></div>
                <span className="text-xs font-bold text-slate-700">2024</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-[#05CD99]"></div>
                <span className="text-xs font-bold text-slate-700">2025</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <button className="text-slate-400 ml-2"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="h-72 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="color2025" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05CD99" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#05CD99" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B2559" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1B2559" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="2025" stroke="#05CD99" strokeWidth={3} fillOpacity={1} fill="url(#color2025)" />
                <Area type="monotone" dataKey="2024" stroke="#1B2559" strokeWidth={3} fillOpacity={1} fill="url(#color2024)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Payment Methods</h3>
            <button className="text-slate-400"><MoreHorizontal className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold text-slate-800 tracking-tight">5,120</p>
              </div>
              {/* Floating Labels (Approximate styling) */}
              <div className="absolute top-[25%] left-[10%] bg-white px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm shadow-[#1B2559]/10">36%</div>
              <div className="absolute top-[20%] right-[15%] bg-white px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm shadow-[#828DF8]/10">19%</div>
              <div className="absolute bottom-[35%] right-[10%] bg-white px-2 py-1 rounded text-[10px] font-bold text-slate-600 shadow-sm shadow-[#E0E5F2]/10">24%</div>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 w-full px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#1B2559]"></div>
                <span className="text-xs font-semibold text-slate-600">E-Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#828DF8]"></div>
                <span className="text-xs font-semibold text-slate-600">Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#4318FF]"></div>
                <span className="text-xs font-semibold text-slate-600">Debit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-[#E0E5F2]"></div>
                <span className="text-xs font-semibold text-slate-600">QRIS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Bar Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Revenue Performance</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#E0E5F2]"></div>
                  <span className="text-xs font-medium text-slate-400">Target Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4318FF]"></div>
                  <span className="text-xs font-medium text-slate-400">Actual Revenue</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setRevenueView(revenueView === 'weekly' ? 'monthly' : 'weekly')}
                className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {revenueView === 'weekly' ? 'Weekly' : 'Monthly'} <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              <button className="text-slate-400 p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentRevenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) => `$${val}`}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="TargetRevenue" fill="#E0E5F2" radius={[4, 4, 4, 4]} barSize={12} />
                <Bar dataKey="ActualRevenue" fill="#6956E5" radius={[4, 4, 4, 4]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Transaction Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Top Transaction</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Highlights of the highest transactions made this week</p>
            </div>
            <button className="text-sm font-bold text-[#4318FF] hover:underline">See All</button>
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc]/50">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 rounded-l-xl">Transaction ID</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">Customer ID</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">Date</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 text-center">Items</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 rounded-r-xl">Purchase</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topTransactions.map((trx, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{trx.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-600">{trx.customer}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{trx.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-500 text-center">{trx.items}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{trx.purchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
