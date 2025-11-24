import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../../services/api';
import { Search, Filter, Download, UserPlus, Mail, Phone, Coins, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTemplate from '../../components/PageTemplate';
import { useNavigate } from 'react-router-dom';

const AllUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm)
    );

    const handleEdit = (user) => {
        // Navigate to user profile page with user data
        navigate('/users/profile', { state: { user } });
    };

    const handleDeleteClick = (user) => {
        setDeleteModal({ show: true, user });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.user) return;

        setDeleting(true);
        try {
            await deleteUser(deleteModal.user.id);
            // Remove user from local state
            setUsers(users.filter(u => u.id !== deleteModal.user.id));
            setDeleteModal({ show: false, user: null });
            alert('User deleted successfully!');
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleExport = () => {
        navigate('/users/export');
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
            title="All Users"
            description="Manage and monitor all registered users"
            icon={UserPlus}
            actions={
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg"
                >
                    <Download size={20} />
                    Export Users
                </motion.button>
            }
        >
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-all font-medium">
                    <Filter size={20} />
                    Filter
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Coins</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {(user.name || 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-500">ID: #{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} />
                                                {user.phone_number}
                                            </div>
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail size={14} />
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Coins size={16} className="text-yellow-500" />
                                            <span className="font-semibold text-yellow-600">{user.coins}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit user"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete user"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => !deleting && setDeleteModal({ show: false, user: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete <strong>{deleteModal.user?.name}</strong>?
                                This will permanently remove the user and all associated data.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? 'Deleting...' : 'Delete User'}
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ show: false, user: null })}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTemplate>
    );
};

export default AllUsers;
