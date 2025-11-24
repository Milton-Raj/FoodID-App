import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Receipt, Download, Search, Filter, TrendingUp, TrendingDown, Coins, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCoinTransactions, getTransactionStats, exportTransactions } from '../../services/api';

const TransactionLogs = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterType]);

    const fetchData = async () => {
        try {
            const [txnData, statsData] = await Promise.all([
                getCoinTransactions(100, filterType === 'all' ? null : filterType),
                getTransactionStats()
            ]);

            setTransactions(txnData.transactions || []);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const blob = await exportTransactions(format);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `coin_transactions_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert('Export completed successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export transactions. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const filteredTransactions = transactions.filter(txn =>
        txn.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.user_phone?.includes(searchTerm) ||
        txn.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (loading) {
        return (
            <PageTemplate title="Transaction Logs" description="View all coin transactions" icon={Receipt}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Transaction Logs"
            description="Comprehensive history of all coin transactions"
            icon={Receipt}
            actions={
                <div className="flex gap-3">
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleExport('json')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        <Download size={20} />
                        Export JSON
                    </button>
                </div>
            }
        >
            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total Transactions"
                        value={stats.total_transactions?.toLocaleString() || '0'}
                        icon={Receipt}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Coins Added"
                        value={`+${stats.total_coins_added?.toLocaleString() || '0'}`}
                        icon={TrendingUp}
                        color="bg-gradient-to-br from-green-500 to-green-600"
                    />
                    <StatCard
                        title="Coins Removed"
                        value={`-${stats.total_coins_removed?.toLocaleString() || '0'}`}
                        icon={TrendingDown}
                        color="bg-gradient-to-br from-red-500 to-red-600"
                    />
                    <StatCard
                        title="Net Coins"
                        value={stats.net_coins?.toLocaleString() || '0'}
                        icon={Coins}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                    />
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by user, phone, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${filterType === 'all'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary-500'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('add')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${filterType === 'add'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-green-500'
                            }`}
                    >
                        Added
                    </button>
                    <button
                        onClick={() => setFilterType('subtract')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${filterType === 'subtract'
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-red-500'
                            }`}
                    >
                        Removed
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Coins</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((txn, index) => (
                                    <motion.tr
                                        key={txn.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-600">#{txn.id}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{txn.user_name}</p>
                                                <p className="text-sm text-gray-500">{txn.user_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${txn.transaction_type === 'add'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {txn.transaction_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {txn.coins > 0 ? (
                                                    <TrendingUp size={16} className="text-green-600" />
                                                ) : (
                                                    <TrendingDown size={16} className="text-red-600" />
                                                )}
                                                <span className={`font-bold ${txn.coins > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {txn.coins > 0 ? '+' : ''}{txn.coins}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {txn.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {txn.admin_id || 'System'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(txn.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-gray-500">
                Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
        </PageTemplate>
    );
};

export default TransactionLogs;
