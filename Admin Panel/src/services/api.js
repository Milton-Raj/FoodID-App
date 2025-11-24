import axios from 'axios';

// Use localhost for admin panel since it's a web app
const API_URL = 'http://localhost:8000/api/admin';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export default api;
