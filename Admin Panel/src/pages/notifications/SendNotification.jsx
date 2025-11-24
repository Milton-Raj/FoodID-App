import React, { useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Bell, Send, Users, Target, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { sendNotification } from '../../services/api';

const SendNotification = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_audience: 'all',
        priority: 'normal',
        send_now: true,
        scheduled_date: '',
        scheduled_time: ''
    });
    const [sending, setSending] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            let notificationData = {
                title: formData.title,
                message: formData.message,
                target_audience: formData.target_audience,
                priority: formData.priority,
                send_now: formData.send_now
            };

            // If scheduling, combine date and time
            if (!formData.send_now && formData.scheduled_date && formData.scheduled_time) {
                const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
                notificationData.scheduled_for = scheduledDateTime;
            }

            await sendNotification(notificationData);

            alert(formData.send_now ? 'Notification sent successfully!' : 'Notification scheduled successfully!');

            // Reset form
            setFormData({
                title: '',
                message: '',
                target_audience: 'all',
                priority: 'normal',
                send_now: true,
                scheduled_date: '',
                scheduled_time: ''
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Failed to send notification. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <PageTemplate
            title="Send Notification"
            description="Send push notifications to users"
            icon={Bell}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <form onSubmit={handleSend}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notification Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                        placeholder="Enter notification title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows="4"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none resize-none"
                                        placeholder="Enter notification message..."
                                    />
                                    <p className="text-sm text-gray-500 mt-1">{formData.message.length}/200 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Target Audience *
                                    </label>
                                    <select
                                        value={formData.target_audience}
                                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="active">Active Users Only</option>
                                        <option value="inactive">Inactive Users</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['low', 'normal', 'high'].map(priority => (
                                            <button
                                                key={priority}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority })}
                                                className={`px-4 py-3 rounded-xl font-semibold transition-all capitalize ${formData.priority === priority
                                                    ? 'bg-primary-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {priority}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Send Time
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, send_now: true })}
                                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${formData.send_now
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Send Now
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, send_now: false })}
                                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${!formData.send_now
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                </div>

                                {!formData.send_now && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Calendar size={16} className="inline mr-1" />
                                                Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.scheduled_date}
                                                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                                required={!formData.send_now}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Clock size={16} className="inline mr-1" />
                                                Time *
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.scheduled_time}
                                                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                                                required={!formData.send_now}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                    {sending ? 'Sending...' : (formData.send_now ? 'Send Notification' : 'Schedule Notification')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bell size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-1">
                                        {formData.title || 'Notification Title'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formData.message || 'Your notification message will appear here...'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formData.send_now ? 'Just now' : `Scheduled for ${formData.scheduled_date || 'date'} at ${formData.scheduled_time || 'time'}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Target:</span>
                                <span className="font-semibold text-gray-900 capitalize">{formData.target_audience}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Priority:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${formData.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    formData.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {formData.priority}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageTemplate>
    );
};

export default SendNotification;
