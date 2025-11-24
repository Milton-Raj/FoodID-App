import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Settings, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/admin',
    headers: { 'Content-Type': 'application/json' },
});

const AppSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            alert('Failed to load settings. Make sure database migration is complete.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (category) => {
        setSaving(true);
        try {
            const categorySettings = settings[category] || [];
            const updates = {};
            categorySettings.forEach(setting => {
                updates[setting.setting_key] = setting.setting_value;
            });

            await api.put('/settings/bulk/update', { settings: updates });
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: prev[category]?.map(s =>
                s.setting_key === key ? { ...s, setting_value: value } : s
            )
        }));
    };

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'features', label: 'Features' },
        { id: 'coins', label: 'Coin System' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'security', label: 'Security' },
    ];

    const renderSettingInput = (setting, category) => {
        const { setting_key, setting_value, setting_type, description } = setting;

        if (setting_type === 'boolean') {
            return (
                <div key={setting_key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{setting_key.replace(/_/g, ' ').toUpperCase()}</h4>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={setting_value === 'true'}
                            onChange={(e) => updateSetting(category, setting_key, e.target.checked ? 'true' : 'false')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>
            );
        }

        if (setting_type === 'number') {
            return (
                <div key={setting_key} className="p-4 bg-gray-50 rounded-xl">
                    <label className="block font-semibold text-gray-900 mb-2">
                        {setting_key.replace(/_/g, ' ').toUpperCase()}
                    </label>
                    <p className="text-sm text-gray-500 mb-2">{description}</p>
                    <input
                        type="number"
                        value={setting_value}
                        onChange={(e) => updateSetting(category, setting_key, e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                    />
                </div>
            );
        }

        return (
            <div key={setting_key} className="p-4 bg-gray-50 rounded-xl">
                <label className="block font-semibold text-gray-900 mb-2">
                    {setting_key.replace(/_/g, ' ').toUpperCase()}
                </label>
                <p className="text-sm text-gray-500 mb-2">{description}</p>
                <input
                    type="text"
                    value={setting_value}
                    onChange={(e) => updateSetting(category, setting_key, e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none"
                />
            </div>
        );
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
            title="App Settings"
            description="Configure application settings and preferences"
            icon={Settings}
        >
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    {settings[activeTab]?.length > 0 ? (
                        settings[activeTab].map(setting => renderSettingInput(setting, activeTab))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No settings available for this category</p>
                            <p className="text-sm text-gray-400 mt-2">Run database migration to create settings</p>
                        </div>
                    )}
                </div>

                {settings[activeTab]?.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSave(activeTab)}
                        disabled={saving}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                )}
            </div>
        </PageTemplate>
    );
};

export default AppSettings;
