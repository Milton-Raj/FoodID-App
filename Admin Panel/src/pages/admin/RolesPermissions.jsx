import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Shield, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoles, createRole, updateRole, deleteRole, getAdminUsers } from '../../services/api';
import { menuItems } from '../../config/menuItems';

const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        role_name: '',
        description: '',
        permissions: {}
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingRole(null);
        setFormData({ role_name: '', description: '', permissions: {} });
        setShowModal(true);
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            role_name: role.role_name,
            description: role.description || '',
            permissions: role.permissions || {}
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingRole) {
                await updateRole(editingRole.id, formData);
            } else {
                await createRole(formData);
            }
            setShowModal(false);
            fetchRoles();
            alert(`Role ${editingRole ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            console.error('Failed to save role:', error);
            alert('Failed to save role. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this role?')) return;
        try {
            await deleteRole(id);
            fetchRoles();
            alert('Role deleted');
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.response?.data?.detail || 'Failed to delete');
        }
    };

    if (loading) {
        return (
            <PageTemplate title="Roles & Permissions" description="Manage admin roles and permissions" icon={Shield}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Roles & Permissions"
            description="Manage admin roles and permissions"
            icon={Shield}
            actions={
                <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-all">
                    <Plus size={20} /> Add Role
                </button>
            }
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {roles.length > 0 ? (
                                roles.map((role, idx) => (
                                    <motion.tr key={role.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{role.role_name}</td>
                                        <td className="px-6 py-4 text-gray-600">{role.description || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(role.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(role)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(role.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No roles found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{editingRole ? 'Edit' : 'Create'} Role</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
                                    <input type="text" value={formData.role_name} onChange={e => setFormData({ ...formData, role_name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none" placeholder="e.g. Admin" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none" rows="3" placeholder="Role description..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Menu Permissions</label>
                                    <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto p-4 border border-gray-100 rounded-xl bg-gray-50">
                                        {menuItems.map(item => (
                                            <label key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions?.menus?.includes(item.id) || false}
                                                    onChange={(e) => {
                                                        const currentMenus = formData.permissions?.menus || [];
                                                        let newMenus;
                                                        if (e.target.checked) {
                                                            newMenus = [...currentMenus, item.id];
                                                        } else {
                                                            newMenus = currentMenus.filter(id => id !== item.id);
                                                        }
                                                        setFormData({
                                                            ...formData,
                                                            permissions: { ...formData.permissions, menus: newMenus }
                                                        });
                                                    }}
                                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"><Save size={18} />{editingRole ? 'Update' : 'Create'}</button>
                                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTemplate>
    );
};

export default RolesPermissions;
