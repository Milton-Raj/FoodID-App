import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BarChart3, Coins,
    UserPlus, Bell, FileText, Shield, Settings,
    Headphones, Lock, ChevronDown, ChevronRight, LogOut, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuItems as allMenuItems } from '../config/menuItems';

const Sidebar = () => {
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        navigate('/login');
    };

    const [userPermissions, setUserPermissions] = useState(() => {
        const perms = localStorage.getItem('adminPermissions');
        return perms ? JSON.parse(perms) : null;
    });

    // Filter menu items based on permissions
    const menuItems = allMenuItems.filter(item => {
        // If no permissions set (e.g. super admin or not logged in properly), show all
        // In a real app, you might want to default to hiding everything if no permissions found
        if (!userPermissions || !userPermissions.menus) return true;

        // Check if user has permission for this menu
        return userPermissions.menus.includes(item.id);
    });

    const renderMenuItem = (item, index) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedMenus[item.id];

        if (!hasSubItems) {
            return (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <button
                    onClick={() => toggleMenu(item.id)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-dark-700 hover:text-white transition-all duration-200 group"
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={18} className="text-gray-400 group-hover:text-white" />
                        <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="ml-4 mt-1 space-y-1 border-l-2 border-dark-700 pl-4">
                                {item.subItems.map((subItem, subIndex) => (
                                    <NavLink
                                        key={subIndex}
                                        to={subItem.path}
                                        className={({ isActive }) =>
                                            `block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
                                                ? 'bg-primary-600/20 text-primary-400 font-medium'
                                                : 'text-gray-500 hover:text-white hover:bg-dark-700'
                                            }`
                                        }
                                    >
                                        {subItem.label}
                                    </NavLink>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 bg-gradient-to-b from-dark-900 to-dark-800 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl overflow-y-auto"
        >
            {/* Logo Header */}
            <div className="p-6 border-b border-dark-700 sticky top-0 bg-dark-900 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">FoodID</h1>
                        <p className="text-xs text-gray-400">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item, index) => renderMenuItem(item, index))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-dark-700 space-y-3 sticky bottom-0 bg-dark-900">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-dark-700 hover:text-white transition-all duration-200 group"
                >
                    <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Version 1.0.0</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
