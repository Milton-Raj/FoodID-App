import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Calendar, Clock, Trash2, Edit, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getScheduledNotifications, deleteScheduledNotification } from '../../services/api';

const ScheduledNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getScheduledNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch scheduled notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this scheduled notification?')) return;
        try {
            await deleteScheduledNotification(id);
            fetchNotifications();
            alert('Notification deleted');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete');
        }
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading) {
        return (
            <PageTemplate title="Scheduled Notifications" description="View and manage scheduled notifications" icon={Calendar}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Scheduled Notifications"
            description="View and manage scheduled notifications"
            icon={Calendar}
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Scheduled For</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {notifications.length > 0 ? (
                                notifications.map((notif, idx) => {
                                    const { date, time } = formatDateTime(notif.scheduled_for);
                                    return (
                                        <motion.tr
                                            key={notif.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">{notif.title}</td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{notif.message}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {date}
                                                    <Clock size={14} className="text-gray-400 ml-2" />
                                                    {time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${notif.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                        notif.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {notif.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDelete(notif.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No scheduled notifications found
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

export default ScheduledNotifications;
