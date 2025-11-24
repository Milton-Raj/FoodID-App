import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Calendar, Filter, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { getNotificationHistory } from '../../services/api';

const NotificationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await getNotificationHistory(100);
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
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
            <PageTemplate title="Notification History" description="View sent notifications" icon={Calendar}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Notification History"
            description="View all sent notifications"
            icon={Calendar}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sent At</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Target</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length > 0 ? (
                                history.map((notif, idx) => (
                                    <motion.tr
                                        key={notif.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{notif.title}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{notif.message}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDateTime(notif.sent_at)}</td>
                                        <td className="px-6 py-4 text-gray-600 capitalize">{notif.target_audience || 'all'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${notif.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    notif.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {notif.priority}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No notification history found
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

export default NotificationHistory;
