import axios from 'axios';

// Use localhost for admin panel since it's a web app
const API_URL = 'http://localhost:8000/api/admin';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Dashboard
export const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};

// Users
export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const getUser = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

export const updateUser = async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
};

export const createUser = async (userData) => {
    const response = await api.post('/users/create', userData);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

// Coin Management
export const adjustUserCoins = async (adjustmentData) => {
    const response = await api.post('/users/coins/adjust', adjustmentData);
    return response.data;
};

export const getCoinHistory = async (limit = 50) => {
    const response = await api.get(`/users/coins/history?limit=${limit}`);
    return response.data;
};

// Export
export const exportUsers = async (format = 'csv') => {
    const response = await api.get(`/users/export/${format}`, {
        responseType: 'blob'
    });
    return response.data;
};

// Scans
export const getScans = async (limit = 50) => {
    const response = await api.get(`/scans?limit=${limit}`);
    return response.data;
};

// Analytics
export const getScanAnalytics = async () => {
    const response = await api.get('/scans/analytics');
    return response.data;
};

export const getScanCategories = async () => {
    const response = await api.get('/scans/categories');
    return response.data;
};

export const getConfidenceDistribution = async () => {
    const response = await api.get('/scans/confidence-distribution');
    return response.data;
};

// Transactions
export const getTransactions = async (limit = 50) => {
    const response = await api.get(`/transactions?limit=${limit}`);
    return response.data;
};

// Coin System - Rules
export const getCoinRules = async () => {
    const response = await api.get('/coins/rules');
    return response.data;
};

export const createCoinRule = async (ruleData) => {
    const response = await api.post('/coins/rules', ruleData);
    return response.data;
};

export const updateCoinRule = async (ruleId, ruleData) => {
    const response = await api.put(`/coins/rules/${ruleId}`, ruleData);
    return response.data;
};

export const deleteCoinRule = async (ruleId) => {
    const response = await api.delete(`/coins/rules/${ruleId}`);
    return response.data;
};

export const toggleCoinRule = async (ruleId) => {
    const response = await api.patch(`/coins/rules/${ruleId}/toggle`);
    return response.data;
};

// Coin System - Adjustments
export const getAdjustmentStats = async () => {
    const response = await api.get('/coins/adjustments/stats');
    return response.data;
};

// Coin System - Transactions
export const getCoinTransactions = async (limit = 100, transactionType = null) => {
    const params = new URLSearchParams({ limit });
    if (transactionType) params.append('transaction_type', transactionType);

    const response = await api.get(`/coins/transactions?${params}`);
    return response.data;
};

export const getTransactionStats = async () => {
    const response = await api.get('/coins/transactions/stats');
    return response.data;
};

export const exportTransactions = async (format = 'csv') => {
    const response = await api.get(`/coins/transactions/export/${format}`, {
        responseType: 'blob'
    });
    return response.data;
};

// Referral Management
export const getReferrals = async () => {
    const response = await api.get('/referrals');
    return response.data;
};

export const createReferral = async (referralData) => {
    const response = await api.post('/referrals', referralData);
    return response.data;
};

export const updateReferral = async (refId, referralData) => {
    const response = await api.put(`/referrals/${refId}`, referralData);
    return response.data;
};

export const deleteReferral = async (refId) => {
    const response = await api.delete(`/referrals/${refId}`);
    return response.data;
};

export const toggleReferral = async (refId) => {
    const response = await api.patch(`/referrals/${refId}/toggle`);
    return response.data;
};

// Scheduled Notifications
export const sendNotification = async (notificationData) => {
    const response = await api.post('/notifications/send', notificationData);
    return response.data;
};

export const getScheduledNotifications = async () => {
    const response = await api.get('/notifications/scheduled');
    return response.data;
};

export const updateScheduledNotification = async (notifId, notificationData) => {
    const response = await api.put(`/notifications/scheduled/${notifId}`, notificationData);
    return response.data;
};

export const deleteScheduledNotification = async (notifId) => {
    const response = await api.delete(`/notifications/scheduled/${notifId}`);
    return response.data;
};

export const getNotificationHistory = async (limit = 100) => {
    const response = await api.get(`/notifications/history?limit=${limit}`);
    return response.data;
};

// Admin Management - Roles
export const getRoles = async () => {
    const response = await api.get('/admin-management/roles');
    return response.data;
};

export const createRole = async (roleData) => {
    const response = await api.post('/admin-management/roles', roleData);
    return response.data;
};

export const updateRole = async (roleId, roleData) => {
    const response = await api.put(`/admin-management/roles/${roleId}`, roleData);
    return response.data;
};

export const deleteRole = async (roleId) => {
    const response = await api.delete(`/admin-management/roles/${roleId}`);
    return response.data;
};

// Admin Management - Users
export const getAdminUsers = async () => {
    const response = await api.get('/admin-management/users');
    return response.data;
};

export const createAdminUser = async (userData) => {
    // userData should include: name, email, password, role_id
    const response = await api.post('/admin-management/users', userData);
    return response.data;
};

export const updateAdminUser = async (userId, userData) => {
    const response = await api.put(`/admin-management/users/${userId}`, userData);
    return response.data;
};

export const deleteAdminUser = async (userId) => {
    const response = await api.delete(`/admin-management/users/${userId}`);
    return response.data;
};

// Admin Management - Activity Logs
export const getActivityLogs = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin-management/logs?${queryString}`);
    return response.data;
};

export const getActivityStats = async () => {
    const response = await api.get('/admin-management/logs/stats');
    return response.data;
};

export default api;

