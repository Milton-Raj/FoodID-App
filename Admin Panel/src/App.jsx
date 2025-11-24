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
import TransactionLogs from './pages/coins/TransactionLogs';

// Notifications
import SendNotification from './pages/notifications/SendNotification';
import ScheduledNotifications from './pages/notifications/ScheduledNotifications';
import NotificationHistory from './pages/notifications/NotificationHistory';

// Referrals
import ReferralManagement from './pages/referrals/ReferralManagement';

// Admin Management
import RolesPermissions from './pages/admin/RolesPermissions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';

// Settings & Security
import AppSettings from './pages/settings/AppSettings';
import LogsSecurity from './pages/security/LogsSecurity';

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
                    <Route path="/coins/transactions" element={<TransactionLogs />} />

                    {/* Referrals */}
                    <Route path="/referrals" element={<ReferralManagement />} />

                    {/* Notifications */}
                    <Route path="/notifications/send" element={<SendNotification />} />
                    <Route path="/notifications/scheduled" element={<ScheduledNotifications />} />
                    <Route path="/notifications/history" element={<NotificationHistory />} />

                    {/* Admin Management */}
                    <Route path="/admin/roles" element={<RolesPermissions />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/logs" element={<AdminActivityLogs />} />

                    {/* Settings & Security */}
                    <Route path="/settings" element={<AppSettings />} />
                    <Route path="/security" element={<LogsSecurity />} />

                    {/* Logs & Security */}
                    <Route path="/logs" element={<LogsSecurity />} />

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
