import React, { useEffect, useState } from 'react';
import { getScans } from '../services/api';
import { Search, Filter, Calendar, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ScansPage = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedScan, setSelectedScan] = useState(null);

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const data = await getScans();
                setScans(data);
            } catch (error) {
                console.error('Failed to fetch scans:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchScans();
    }, []);

    const filteredScans = scans.filter(scan =>
        scan.food_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Scans</h1>
                        <p className="text-gray-500">Browse and analyze all food recognition scans</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-gray-200">
                            <Calendar size={20} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Last 30 days</span>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by food name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-all font-medium">
                        <Filter size={20} />
                        Filter
                    </button>
                </div>
            </motion.div>

            {/* Scans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredScans.map((scan, index) => (
                    <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        onClick={() => setSelectedScan(scan)}
                    >
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            <img
                                src={scan.image_path?.startsWith('http') ? scan.image_path : `http://localhost:8000/static/${scan.image_path?.split('/').pop()}`}
                                alt={scan.food_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Food+Image';
                                }}
                            />
                            {/* Confidence Badge */}
                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                                <TrendingUp size={14} className="text-primary-400" />
                                <span className="text-white text-sm font-semibold">{Math.round(scan.confidence)}%</span>
                            </div>
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-semibold text-gray-900">
                                    <Eye size={16} />
                                    View Details
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{scan.food_name}</h3>

                            {/* User Info */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {(scan.users?.name || 'U')[0].toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {scan.users?.name || scan.users?.phone_number || 'Unknown User'}
                                </span>
                            </div>

                            {/* Nutrition Info */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary-600">
                                        {JSON.parse(scan.nutrition_json || '{}').calories || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">Calories</p>
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">
                                        {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">Scanned</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredScans.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No scans found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </motion.div>
            )}
        </div>
    );
};

export default ScansPage;
