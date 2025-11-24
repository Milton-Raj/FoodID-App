import React, { useEffect, useState } from 'react';
import PageTemplate from '../../components/PageTemplate';
import { BarChart3, TrendingUp, Zap, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { getScanAnalytics, getScanCategories, getConfidenceDistribution } from '../../services/api';

const ScanAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [categories, setCategories] = useState([]);
    const [confidenceData, setConfidenceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setError(null);
            const [analyticsData, categoriesData, confidenceDistData] = await Promise.all([
                getScanAnalytics(),
                getScanCategories(),
                getConfidenceDistribution()
            ]);

            setAnalytics(analyticsData);
            setCategories(categoriesData);
            setConfidenceData(confidenceDistData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setError(error.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <PageTemplate title="Scan Analytics" description="Comprehensive scan insights and trends" icon={BarChart3}>
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </PageTemplate>
        );
    }

    if (error) {
        return (
            <PageTemplate title="Scan Analytics" description="Comprehensive scan insights and trends" icon={BarChart3}>
                <div className="bg-white p-12 rounded-2xl text-center">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        Retry
                    </button>
                </div>
            </PageTemplate>
        );
    }

    if (!analytics) {
        return (
            <PageTemplate title="Scan Analytics" description="Comprehensive scan insights and trends" icon={BarChart3}>
                <div className="bg-white p-12 rounded-2xl text-center">
                    <p className="text-gray-500">No analytics data available</p>
                </div>
            </PageTemplate>
        );
    }

    return (
        <PageTemplate
            title="Scan Analytics"
            description="Comprehensive scan insights and trends"
            icon={BarChart3}
        >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Total Scans"
                    value={analytics.total_scans?.toLocaleString() || '0'}
                    icon={Activity}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    delay={0}
                />
                <StatCard
                    title="Scans Today"
                    value={analytics.scans_today?.toLocaleString() || '0'}
                    icon={Zap}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    delay={0.1}
                />
                <StatCard
                    title="This Week"
                    value={analytics.scans_this_week?.toLocaleString() || '0'}
                    icon={TrendingUp}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    delay={0.2}
                />
                <StatCard
                    title="Avg Confidence"
                    value={`${analytics.average_confidence || 0}%`}
                    icon={Target}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Popular Foods */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Most Scanned Foods</h3>
                    <div className="space-y-3">
                        {analytics.popular_foods && analytics.popular_foods.length > 0 ? (
                            analytics.popular_foods.slice(0, 8).map((food, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-900">{food.name}</span>
                                    </div>
                                    <span className="text-gray-600">{food.count} scans</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No food data available</p>
                        )}
                    </div>
                </motion.div>

                {/* Food Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Food Categories</h3>
                    <div className="space-y-3">
                        {categories && categories.length > 0 ? (
                            categories.slice(0, 6).map((cat, index) => {
                                const colors = [
                                    'bg-red-500',
                                    'bg-green-500',
                                    'bg-yellow-500',
                                    'bg-blue-500',
                                    'bg-purple-500',
                                    'bg-pink-500'
                                ];

                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                                            <span className="text-sm text-gray-700">{cat.category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">{cat.count}</p>
                                            <p className="text-xs text-gray-500">{cat.percentage?.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-8">No category data available</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Confidence Distribution & Nutrition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Confidence Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Confidence Levels</h3>
                    <div className="space-y-4">
                        {confidenceData && confidenceData.length > 0 ? (
                            confidenceData.map((range, index) => {
                                const colors = [
                                    'bg-green-500',
                                    'bg-blue-500',
                                    'bg-yellow-500',
                                    'bg-orange-500',
                                    'bg-red-500'
                                ];

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-700">{range.range}</span>
                                            <span className="font-semibold text-gray-900">{range.percentage?.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${range.percentage || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-8">No confidence data available</p>
                        )}
                    </div>
                </motion.div>

                {/* Nutrition Insights */}
                {analytics.nutrition_insights && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Nutrition Insights</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-200">
                                <p className="text-xs text-red-600 font-semibold mb-1">Avg Calories</p>
                                <p className="text-2xl font-bold text-red-700">
                                    {analytics.nutrition_insights.avg_calories?.toFixed(0) || 0} kcal
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold mb-1">Avg Protein</p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {analytics.nutrition_insights.avg_protein?.toFixed(1) || 0}g
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200">
                                <p className="text-xs text-yellow-600 font-semibold mb-1">Avg Carbs</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {analytics.nutrition_insights.avg_carbs?.toFixed(1) || 0}g
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                                <p className="text-xs text-purple-600 font-semibold mb-1">Avg Fat</p>
                                <p className="text-2xl font-bold text-purple-700">
                                    {analytics.nutrition_insights.avg_fat?.toFixed(1) || 0}g
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </PageTemplate>
    );
};

export default ScanAnalytics;
