import React, { useState, useEffect } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Coins, Plus, Minus, Search, TrendingUp, TrendingDown, Loader, CheckCircle, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, adjustUserCoins, getCoinHistory, getAdjustmentStats } from '../../services/api';

const ManualAdjustments = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [adjustmentType, setAdjustmentType] = useState('add');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [recentAdjustments, setRecentAdjustments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchHistory();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const data = await getCoinHistory(10);
            setRecentAdjustments(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await getAdjustmentStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleAdjustment = async () => {
        if (!selectedUser || !amount || !reason) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await adjustUserCoins({
                user_id: selectedUser.id,
                amount: parseInt(amount),
                adjustment_type: adjustmentType,
                reason: reason
            });

            // Update local user data
            setUsers(users.map(u =>
                u.id === selectedUser.id
                    ? { ...u, coins: response.new_balance }
                    : u
            ));

            // Show success message
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            // Reset form
            setAmount('');
            setReason('');
            setSelectedUser(null);
            setSearchTerm('');

            // Refresh data
            fetchHistory();
            fetchStats();
        } catch (error) {
            console.error('Failed to adjust coins:', error);
            alert('Failed to adjust coins. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone_number?.includes(searchTerm)
    );

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <PageTemplate
            title="Manual Coin Adjustments"
            description="Manually adjust user coin balances"
            icon={Coins}
        >
            {/* Success Message */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3"
                    >
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <p className="font-semibold text-green-900">Coins adjusted successfully!</p>
                            <p className="text-sm text-green-700">The user's balance has been updated.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Adjustments"
                        value={stats.total_adjustments?.toLocaleString() || '0'}
                        icon={BarChart3}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Total Added"
                        value={`+${stats.total_added?.toLocaleString() || '0'}`}
                        icon={TrendingUp}
                        color="bg-gradient-to-br from-green-500 to-green-600"
                    />
                    <StatCard
                        title="Total Subtracted"
                        value={`-${stats.total_subtracted?.toLocaleString() || '0'}`}
                        icon={TrendingDown}
                        color="bg-gradient-to-br from-red-500 to-red-600"
                    />
                    <StatCard
                        title="Net Adjustment"
                        value={stats.net_adjustment?.toLocaleString() || '0'}
                        icon={Coins}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Adjustment Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Make Adjustment</h3>

                    {/* User Search */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select User
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            />
                        </div>

                        {searchTerm && filteredUsers.length > 0 && (
                            <div className="mt-2 bg-white border-2 border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                {filteredUsers.slice(0, 5).map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setSearchTerm('');
                                        }}
                                        className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b last:border-b-0"
                                    >
                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.phone_number} • {user.coins} coins</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedUser && (
                            <div className="mt-3 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl">
                                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                                <p className="text-sm text-gray-600">Current Balance: <span className="font-bold text-yellow-600">{selectedUser.coins} coins</span></p>
                            </div>
                        )}
                    </div>

                    {/* Adjustment Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Adjustment Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAdjustmentType('add')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${adjustmentType === 'add'
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Plus size={18} />
                                Add Coins
                            </button>
                            <button
                                onClick={() => setAdjustmentType('subtract')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${adjustmentType === 'subtract'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Minus size={18} />
                                Subtract Coins
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="1"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for adjustment..."
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none resize-none"
                        />
                    </div>

                    <button
                        onClick={handleAdjustment}
                        disabled={loading || !selectedUser || !amount || !reason}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Apply Adjustment'
                        )}
                    </button>
                </motion.div>

                {/* Recent Adjustments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Adjustments</h3>
                    <div className="space-y-3">
                        {recentAdjustments.length > 0 ? (
                            recentAdjustments.map((adj, index) => (
                                <motion.div
                                    key={adj.id || index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary-200 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{adj.users?.name || 'Unknown User'}</p>
                                            <p className="text-sm text-gray-500">{adj.reason}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${adj.adjustment_type === 'add'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {adj.adjustment_type === 'add' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {adj.adjustment_type === 'add' ? '+' : '-'}{adj.amount}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{new Date(adj.created_at).toLocaleDateString()}</span>
                                        <span>by {adj.admin_id}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No recent adjustments</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </PageTemplate>
    );
};

export default ManualAdjustments;
