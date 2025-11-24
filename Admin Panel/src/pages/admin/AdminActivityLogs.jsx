import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { FileText, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getActivityLogs, getActivityStats } from '../../services/api';

const AdminActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [logsData, statsData] = await Promise.all([
                getActivityLogs({ limit: 100 }),
                getActivityStats()
            ]);
            setLogs(logsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <PageTemplate title="Admin Activity Logs" description="View admin actions and activity" icon={FileText}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Admin Activity Logs"
            description="View all admin actions and activity"
            icon={FileText}
        >
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Total Actions</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total_actions}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Actions Today</p>
                        <p className="text-3xl font-bold text-primary-600">{stats.actions_today}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">This Week</p>
                        <p className="text-3xl font-bold text-purple-600">{stats.actions_this_week}</p>
                    </motion.div>
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Resource</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length > 0 ? (
                                logs.map((log, idx) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{log.admin_email || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-gray-600">{log.action}</td>
                                        <td className="px-6 py-4 text-gray-600">{log.resource_type || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDateTime(log.created_at)}</td>
                                        <td className="px-6 py-4 text-gray-600">{log.ip_address || '-'}</td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No activity logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTemplate>
    );
};

export default AdminActivityLogs;
