import {
    LayoutDashboard, Users, BarChart3, Coins,
    UserPlus, Bell, Shield, Settings, Lock
} from 'lucide-react';

export const menuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard'
    },
    {
        id: 'users',
        label: 'User Management',
        icon: Users,
        subItems: [
            { label: 'All Users', path: '/users/all' },
            { label: 'Export Users', path: '/users/export' }
        ]
    },
    {
        id: 'analytics',
        label: 'Scan Analytics',
        icon: BarChart3,
        path: '/analytics'
    },
    {
        id: 'coins',
        label: 'Coin System',
        icon: Coins,
        subItems: [
            { label: 'Coin Rules', path: '/coins/rules' },
            { label: 'Coins Adjustment', path: '/users/coins' },
            { label: 'Transaction Logs', path: '/coins/transactions' }
        ]
    },
    {
        id: 'referrals',
        label: 'Referral Management',
        icon: UserPlus,
        path: '/referrals'
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        subItems: [
            { label: 'Send Notification', path: '/notifications/send' },
            { label: 'Scheduled Notifications', path: '/notifications/scheduled' },
            { label: 'Notification History', path: '/notifications/history' }
        ]
    },
    {
        id: 'admin',
        label: 'Admin Management',
        icon: Shield,
        subItems: [
            { label: 'Roles & Permissions', path: '/admin/roles' },
            { label: 'Admin Users', path: '/admin/users' },
            { label: 'Admin Activity Logs', path: '/admin/logs' }
        ]
    },
    {
        id: 'settings',
        label: 'App Settings',
        icon: Settings,
        path: '/settings'
    },
    {
        id: 'security',
        label: 'Logs & Security',
        icon: Lock,
        path: '/security'
    }
];
