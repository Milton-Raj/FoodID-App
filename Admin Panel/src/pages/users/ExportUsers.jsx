import React, { useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { Download, CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportUsers } from '../../services/api';

const ExportUsers = () => {
    const [exportFormat, setExportFormat] = useState('csv');
    const [exporting, setExporting] = useState(false);
    const [exportHistory, setExportHistory] = useState([
        { id: 1, format: 'CSV', date: '2024-11-24', records: 1250, status: 'completed' },
        { id: 2, format: 'JSON', date: '2024-11-23', records: 1200, status: 'completed' },
    ]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await exportUsers(exportFormat);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `users_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Add to history
            const newExport = {
                id: Date.now(),
                format: exportFormat.toUpperCase(),
                date: new Date().toISOString().split('T')[0],
                records: 0, // Would be calculated from actual data
                status: 'completed'
            };
            setExportHistory([newExport, ...exportHistory]);

            alert('Export completed successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export users. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <PageTemplate
            title="Export Users"
            description="Export user data in various formats"
            icon={Download}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Export Settings</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Export Format
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['csv', 'json'].map(format => (
                                    <button
                                        key={format}
                                        onClick={() => setExportFormat(format)}
                                        className={`px-4 py-3 rounded-xl font-semibold transition-all uppercase ${exportFormat === format
                                                ? 'bg-primary-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {format}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <h4 className="font-semibold text-blue-900 mb-2">Export Information</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• All user data will be included</li>
                                <li>• Fields: ID, Name, Phone, Email, Coins, Join Date</li>
                                <li>• {exportFormat.toUpperCase()} format selected</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {exporting ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Export Users
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Export History</h3>
                    <div className="space-y-3">
                        {exportHistory.map(export_ => (
                            <div
                                key={export_.id}
                                className="p-4 border-2 border-gray-100 rounded-xl hover:border-primary-200 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900">{export_.format} Export</p>
                                        <p className="text-sm text-gray-500">{export_.records > 0 ? `${export_.records} records` : 'Download ready'}</p>
                                    </div>
                                    {export_.status === 'completed' ? (
                                        <CheckCircle size={20} className="text-green-600" />
                                    ) : (
                                        <XCircle size={20} className="text-red-600" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(export_.date).toLocaleDateString()}</span>
                                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </PageTemplate>
    );
};

export default ExportUsers;
