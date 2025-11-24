import React, { useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Bell, Send, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const SendNotification = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetType: 'all',
        userIds: '',
        priority: 'normal',
        scheduleType: 'now'
    });

    const handleSend = (e) => {
        e.preventDefault();
        alert('Notification sent successfully!');
        setFormData({
            title: '',
            message: '',
            targetType: 'all',
            userIds: '',
            priority: 'normal',
            scheduleType: 'now'
        });
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
                                        value={formData.targetType}
                                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="active">Active Users Only</option>
                                        <option value="inactive">Inactive Users</option>
                                        <option value="specific">Specific Users</option>
                                    </select>
                                </div>

                                {formData.targetType === 'specific' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            User IDs (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.userIds}
                                            onChange={(e) => setFormData({ ...formData, userIds: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                            placeholder="e.g., 1, 2, 3"
                                        />
                                    </div>
                                )}

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
                                            onClick={() => setFormData({ ...formData, scheduleType: 'now' })}
                                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${formData.scheduleType === 'now'
                                                    ? 'bg-primary-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Send Now
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, scheduleType: 'schedule' })}
                                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${formData.scheduleType === 'schedule'
                                                    ? 'bg-primary-600 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Schedule
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                                >
                                    <Send size={18} />
                                    {formData.scheduleType === 'now' ? 'Send Notification' : 'Schedule Notification'}
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
                                    <p className="text-xs text-gray-400 mt-2">Just now</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Target:</span>
                                <span className="font-semibold text-gray-900 capitalize">{formData.targetType}</span>
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
