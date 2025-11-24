import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Gift, Plus, Edit, Trash2, Power, PowerOff, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReferrals, createReferral, updateReferral, deleteReferral, toggleReferral } from '../../services/api';

const ReferralManagement = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingReferral, setEditingReferral] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        user_id: '',
        expires_at: '',
        is_active: true
    });

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const data = await getReferrals();
            setReferrals(data);
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingReferral(null);
        setFormData({ code: '', user_id: '', expires_at: '', is_active: true });
        setShowModal(true);
    };

    const handleEdit = (ref) => {
        setEditingReferral(ref);
        setFormData({
            code: ref.code,
            user_id: ref.user_id || '',
            expires_at: ref.expires_at ? ref.expires_at.split('T')[0] : '',
            is_active: ref.is_active
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                user_id: formData.user_id ? parseInt(formData.user_id, 10) : null,
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
            };
            if (editingReferral) {
                await updateReferral(editingReferral.id, payload);
            } else {
                await createReferral(payload);
            }
            setShowModal(false);
            fetchReferrals();
            alert(`Referral ${editingReferral ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            console.error('Failed to save referral:', error);
            alert('Failed to save referral. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this referral?')) return;
        try {
            await deleteReferral(id);
            fetchReferrals();
            alert('Referral deleted');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete');
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleReferral(id);
            fetchReferrals();
        } catch (error) {
            console.error('Toggle error:', error);
            alert('Failed to toggle');
        }
    };

    if (loading) {
        return (
            <PageTemplate title="Referral Management" description="Manage referral codes" icon={Gift}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Referral Management"
            description="Create, edit, and toggle referral codes"
            icon={Gift}
            actions={
                <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-all">
                    <Plus size={20} /> Add Referral
                </button>
            }
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Expires</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {referrals.length > 0 ? (
                                referrals.map((ref, idx) => (
                                    <motion.tr key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{ref.code}</td>
                                        <td className="px-6 py-4 text-gray-600">{ref.user_id || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{ref.expires_at ? new Date(ref.expires_at).toLocaleDateString() : 'Never'}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggle(ref.id)} className={`px-3 py-1 rounded-full text-xs font-semibold ${ref.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {ref.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(ref)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(ref.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No referrals found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{editingReferral ? 'Edit' : 'Create'} Referral</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
                                    <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none" placeholder="e.g. ABC123" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">User ID (optional)</label>
                                    <input type="number" value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At (optional)</label>
                                    <input type="date" value={formData.expires_at} onChange={e => setFormData({ ...formData, expires_at: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500" />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"><Save size={18} />{editingReferral ? 'Update' : 'Create'}</button>
                                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTemplate>
    );
};

export default ReferralManagement;
