import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Shield, Activity, LogIn, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/admin',
    headers: { 'Content-Type': 'application/json' },
});

const LogsSecurity = () => {
    const [stats, setStats] = useState(null);
    const [loginHistory, setLoginHistory] = useState([]);
    const [securityEvents, setSecurityEvents] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [loginStats, loginHist, events, sessions] = await Promise.all([
                api.get('/security/login-history/stats'),
                api.get('/security/login-history?limit=50'),
                api.get('/security/events?limit=50'),
                api.get('/security/sessions'),
            ]);

            setStats(loginStats.data);
            setLoginHistory(loginHist.data);
            setSecurityEvents(events.data);
            setActiveSessions(sessions.data);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
            alert('Failed to load security data. Make sure database migration is complete.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'blocked': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageTemplate
            title="Logs & Security"
            description="Monitor security events and system activity"
            icon={Shield}
        >
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                        }`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('login')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'login' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                        }`}
                >
                    Login History
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'events' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                        }`}
                >
                    Security Events
                </button>
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'sessions' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'
                        }`}
                >
                    Active Sessions
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Activity size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Attempts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_attempts}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <LogIn size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Success Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.success_rate}%</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Shield size={24} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Failed Attempts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.failed_attempts}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <UsersIcon size={24} className="text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Blocked</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.blocked_attempts}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Login History Tab */}
            {activeTab === 'login' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loginHistory.length > 0 ? loginHistory.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{log.username}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.login_status)}`}>
                                                {log.login_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{log.ip_address}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No login history available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Security Events Tab */}
            {activeTab === 'events' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Event Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {securityEvents.length > 0 ? securityEvents.map((event, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{event.event_type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{event.username || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(event.severity)}`}>
                                                {event.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{event.ip_address}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(event.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No security events available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Active Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Activity</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Expires</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeSessions.length > 0 ? activeSessions.map((session, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {session.admin_users?.username || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{session.ip_address}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(session.last_activity).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(session.expires_at).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No active sessions
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PageTemplate>
    );
};

export default LogsSecurity;
