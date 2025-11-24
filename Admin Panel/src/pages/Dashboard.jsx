import React, { useEffect, useState } from 'react';
import { getStats } from '../services/api';
import { Users, Scan, Coins, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, delay }) => {
    const mockData = Array.from({ length: 7 }, (_, i) => ({
        value: Math.floor(Math.random() * 100) + 50
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</h3>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp size={14} className="text-primary-600" />
                            <span className="text-xs font-semibold text-primary-600">+{trend}% this week</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>

            {/* Mini Chart */}
            <div className="h-16 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill={`url(#gradient-${title})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`flex items-center gap-3 p-4 rounded-xl ${color} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </motion.button>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ total_users: 0, total_scans: 0, total_coins: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening with your app today.</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend={12}
                    delay={0.1}
                />
                <StatCard
                    title="Total Scans"
                    value={stats.total_scans}
                    icon={Scan}
                    color="bg-gradient-to-br from-primary-500 to-primary-600"
                    trend={8}
                    delay={0.2}
                />
                <StatCard
                    title="Coins in Circulation"
                    value={stats.total_coins}
                    icon={Coins}
                    color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                    trend={15}
                    delay={0.3}
                />
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="text-primary-600" size={20} />
                    <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction
                        icon={Users}
                        label="View All Users"
                        color="bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                    <QuickAction
                        icon={Scan}
                        label="Recent Scans"
                        color="bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                    <QuickAction
                        icon={Coins}
                        label="Transactions"
                        color="bg-gradient-to-r from-yellow-500 to-yellow-600"
                    />
                    <QuickAction
                        icon={Activity}
                        label="Analytics"
                        color="bg-gradient-to-r from-purple-500 to-purple-600"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
