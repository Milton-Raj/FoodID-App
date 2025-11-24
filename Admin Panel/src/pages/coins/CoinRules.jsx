import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Coins, Plus, Edit, Trash2, Power, PowerOff, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCoinRules, createCoinRule, updateCoinRule, deleteCoinRule, toggleCoinRule } from '../../services/api';

const CoinRules = () => {
    const [rules, setRules] = useState({ earning_rules: [], spending_rules: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('earning');
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        rule_type: 'earning',
        action_name: '',
        coin_amount: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const data = await getCoinRules();
            setRules(data);
        } catch (error) {
            console.error('Failed to fetch rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRule = () => {
        setEditingRule(null);
        setFormData({
            rule_type: activeTab,
            action_name: '',
            coin_amount: '',
            description: '',
            is_active: true
        });
        setShowModal(true);
    };

    const handleEditRule = (rule) => {
        setEditingRule(rule);
        setFormData({
            rule_type: rule.rule_type,
            action_name: rule.action_name,
            coin_amount: rule.coin_amount,
            description: rule.description || '',
            is_active: rule.is_active
        });
        setShowModal(true);
    };

    const handleSaveRule = async () => {
        try {
            if (editingRule) {
                await updateCoinRule(editingRule.id, formData);
            } else {
                await createCoinRule(formData);
            }
            setShowModal(false);
            fetchRules();
            alert(`Rule ${editingRule ? 'updated' : 'created'} successfully!`);
        } catch (error) {
            console.error('Failed to save rule:', error);
            alert('Failed to save rule. Please try again.');
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;

        try {
            await deleteCoinRule(ruleId);
            fetchRules();
            alert('Rule deleted successfully!');
        } catch (error) {
            console.error('Failed to delete rule:', error);
            alert('Failed to delete rule. Please try again.');
        }
    };

    const handleToggleRule = async (ruleId) => {
        try {
            await toggleCoinRule(ruleId);
            fetchRules();
        } catch (error) {
            console.error('Failed to toggle rule:', error);
            alert('Failed to toggle rule. Please try again.');
        }
    };

    const currentRules = activeTab === 'earning' ? rules.earning_rules : rules.spending_rules;

    if (loading) {
        return (
            <PageTemplate title="Coin Rules" description="Manage earning and spending rules" icon={Coins}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Coin Rules"
            description="Manage how users earn and spend coins"
            icon={Coins}
            actions={
                <button
                    onClick={handleAddRule}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus size={20} />
                    Add New Rule
                </button>
            }
        >
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('earning')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'earning'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Earning Rules ({rules.earning_rules.length})
                </button>
                <button
                    onClick={() => setActiveTab('spending')}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'spending'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Spending Rules ({rules.spending_rules.length})
                </button>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Coins</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentRules.length > 0 ? (
                                currentRules.map((rule, index) => (
                                    <motion.tr
                                        key={rule.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{rule.action_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Coins size={16} className="text-yellow-500" />
                                                <span className={`font-bold ${activeTab === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {activeTab === 'earning' ? '+' : '-'}{rule.coin_amount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {rule.description || 'No description'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleRule(rule.id)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${rule.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {rule.is_active ? <Power size={14} /> : <PowerOff size={14} />}
                                                {rule.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditRule(rule)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Edit rule"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete rule"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No {activeTab} rules found. Click "Add New Rule" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingRule ? 'Edit Rule' : 'Add New Rule'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Rule Type
                                    </label>
                                    <select
                                        value={formData.rule_type}
                                        onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                        disabled={editingRule}
                                    >
                                        <option value="earning">Earning</option>
                                        <option value="spending">Spending</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Action Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.action_name}
                                        onChange={(e) => setFormData({ ...formData, action_name: e.target.value })}
                                        placeholder="e.g., scan_food, daily_login"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Coin Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.coin_amount}
                                        onChange={(e) => setFormData({ ...formData, coin_amount: parseInt(e.target.value) })}
                                        placeholder="10"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe this rule..."
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSaveRule}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                                >
                                    <Save size={18} />
                                    {editingRule ? 'Update' : 'Create'} Rule
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
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

export default CoinRules;
