import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// User Management
import AllUsers from './pages/users/AllUsers';
import UserProfile from './pages/users/UserProfile';
import CoinsAdjustment from './pages/users/CoinsAdjustment';
import ExportUsers from './pages/users/ExportUsers';


// Analytics
import ScanAnalytics from './pages/analytics/ScanAnalytics';

// Coin System
import CoinRules from './pages/coins/CoinRules';
import ManualAdjustments from './pages/coins/ManualAdjustments';
import TransactionLogs from './pages/coins/TransactionLogs';

// Notifications
import SendNotification from './pages/notifications/SendNotification';

// Placeholder component for pages under development
const ComingSoon = ({ title }) => (
  <div className="p-8 bg-gray-50 min-h-screen">
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">This feature is coming soon...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 ml-64">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* User Management */}
                    <Route path="/users/all" element={<AllUsers />} />
                    <Route path="/users/profile" element={<UserProfile />} />
                    <Route path="/users/coins" element={<CoinsAdjustment />} />
                    <Route path="/users/export" element={<ExportUsers />} />

                    {/* Analytics */}
                    <Route path="/analytics" element={<ScanAnalytics />} />

                    {/* Coin System */}
                    <Route path="/coins/rules" element={<CoinRules />} />
                    <Route path="/coins/adjustments" element={<ManualAdjustments />} />
                    <Route path="/coins/transactions" element={<TransactionLogs />} />

                    {/* Referrals */}
                    <Route path="/referrals" element={<ComingSoon title="Referral Management" />} />

                    {/* Notifications */}
                    <Route path="/notifications/send" element={<SendNotification />} />
                    <Route path="/notifications/scheduled" element={<ComingSoon title="Scheduled Notifications" />} />
                    <Route path="/notifications/history" element={<ComingSoon title="Notification History" />} />

                    {/* Reports */}
                    <Route path="/reports" element={<ComingSoon title="Reports" />} />

                    {/* Admin Management */}
                    <Route path="/admin/roles" element={<ComingSoon title="Roles & Permissions" />} />
                    <Route path="/admin/logs" element={<ComingSoon title="Admin Activity Logs" />} />

                    {/* Settings */}
                    <Route path="/settings" element={<ComingSoon title="App Settings" />} />

                    {/* Support */}
                    <Route path="/support" element={<ComingSoon title="Support & Ticket System" />} />

                    {/* Security */}
                    <Route path="/security" element={<ComingSoon title="Logs & Security" />} />

                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
