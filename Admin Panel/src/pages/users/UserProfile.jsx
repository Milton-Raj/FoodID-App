import React, { useState, useEffect } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { User, Mail, Phone, MapPin, Calendar, Save, X, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../../services/api';

const UserProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(location.state?.user || null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        status: 'active'
    });

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                name: selectedUser.name || '',
                email: selectedUser.email || '',
                phone_number: selectedUser.phone_number || '',
                status: selectedUser.status || 'active'
            });
        }
    }, [selectedUser]);

    const handleLoadProfile = async (userId = 1) => {
        setLoading(true);
        try {
            const user = await getUser(userId);
            setSelectedUser(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                status: user.status || 'active'
            });
        } catch (error) {
            console.error('Failed to load user:', error);
            alert('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedUser) return;

        setSaving(true);
        try {
            const response = await updateUser(selectedUser.id, formData);
            setSelectedUser(response.user);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/users/all');
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
            title="User Profile View"
            description="View and edit detailed user information"
            icon={User}
        >
            {!selectedUser ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <User size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No User Selected</h3>
                    <p className="text-gray-500 mb-6">Select a user from the All Users page or load a sample profile</p>
                    <button
                        onClick={() => handleLoadProfile(1)}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                        Load Sample Profile
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                        >
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                    {(selectedUser.name || 'U')[0].toUpperCase()}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                                <p className="text-sm text-gray-500">ID: #{selectedUser.id}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Total Coins</span>
                                    <span className="font-bold text-yellow-600">{selectedUser.coins || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${formData.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {formData.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Edit Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </PageTemplate>
    );
};

export default UserProfile;
