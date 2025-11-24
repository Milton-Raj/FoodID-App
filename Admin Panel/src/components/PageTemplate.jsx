import React from 'react';
import { motion } from 'framer-motion';

const PageTemplate = ({ title, description, icon: Icon, children, actions }) => {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Icon size={24} className="text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                            {description && <p className="text-gray-500 mt-1">{description}</p>}
                        </div>
                    </div>
                    {actions && (
                        <div className="flex gap-3">
                            {actions}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PageTemplate;
