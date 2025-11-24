import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, mockAnalyzeFood, mockGetRecentScans, mockSendOTP, mockVerifyOTP } from '../config';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical device, use your computer's IP address
const DEV_API_URL = API_URL;

// Helper function to get current user ID
const getCurrentUserId = async () => {
    try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id;
        }
        return null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

// Helper for fetch with timeout
const fetchWithTimeout = async (url, options = {}) => {
    const { timeout = 20000 } = options; // 20s timeout

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        console.log(`API Request: ${url}`);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        console.error(`API Request Failed: ${url}`, error);
        throw error;
    }
};

export const api = {
    // Authentication APIs
    sendOTP: async (phoneNumber) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to send OTP');
            }
            return data;
        } catch (error) {
            console.warn('Send OTP Error (falling back to mock):', error);
            return await mockSendOTP(phoneNumber);
        }
    },

    verifyOTP: async (phoneNumber, otpCode) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to verify OTP');
            }
            return data;
        } catch (error) {
            console.warn('Verify OTP Error (falling back to mock):', error);
            return await mockVerifyOTP(phoneNumber, otpCode);
        }
    },
    analyzeFood: async (photoUri, userId = 1) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: photoUri,
                type: 'image/jpeg',
                name: 'food.jpg',
            });

            const response = await fetchWithTimeout(`${DEV_API_URL}/api/scan/analyze?user_id=${userId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to analyze food');
            }
            return data;
        } catch (error) {
            console.error('Analyze Food Error:', error);
            // Throw error to let UI handle it, or at least log it visibly
            throw error;
            // return await mockAnalyzeFood(photoUri);
        }
    },

    getRecentScans: async (userId = 1, limit = 10) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/scan/recent?user_id=${userId}&limit=${limit}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to fetch recent scans');
            }
            return data;
        } catch (error) {
            console.error('Get Recent Scans Error:', error);
            throw error;
            // return await mockGetRecentScans(userId);
        }
    },

    // Profile APIs
    getProfile: async (userId = 1) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/profile/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get Profile Error:', error);
            throw error;
        }
    },

    updateProfile: async (userId = 1, profileData) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            return await response.json();
        } catch (error) {
            console.error('Update Profile Error:', error);
            throw error;
        }
    },

    uploadProfileImage: async (userId = 1, imageUri) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });

            const response = await fetchWithTimeout(`${DEV_API_URL}/api/profile/upload-image?user_id=${userId}`, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return await response.json();
        } catch (error) {
            console.error('Upload Profile Image Error:', error);
            throw error;
        }
    },

    // Notification APIs
    getNotifications: async (userId = 1, limit = 50) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/notifications/${userId}?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get Notifications Error:', error);
            throw error;
        }
    },

    getNotificationDetail: async (notificationId) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/notifications/detail/${notificationId}`);
            return await response.json();
        } catch (error) {
            console.error('Get Notification Detail Error:', error);
            throw error;
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
            });
            return await response.json();
        } catch (error) {
            console.error('Mark Notification Read Error:', error);
            throw error;
        }
    },

    getUnreadCount: async (userId = 1) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/notifications/${userId}/unread-count`);
            return await response.json();
        } catch (error) {
            console.error('Get Unread Count Error:', error);
            throw error;
        }
    },

    // Referral APIs
    sendReferrals: async (userId = 1, phoneNumbers) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/referrals/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, phone_numbers: phoneNumbers }),
            });
            return await response.json();
        } catch (error) {
            console.error('Send Referrals Error:', error);
            throw error;
        }
    },

    getReferrals: async (userId = 1) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/referrals/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get Referrals Error:', error);
            throw error;
        }
    },

    getReferralStats: async (userId = 1) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/referrals/${userId}/stats`);
            return await response.json();
        } catch (error) {
            console.error('Get Referral Stats Error:', error);
            throw error;
        }
    },

    // Coin APIs
    getCoinBalance: async (userId = 1) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/coins/${userId}/balance`);
            return await response.json();
        } catch (error) {
            console.error('Get Coin Balance Error:', error);
            throw error;
        }
    },

    getCoinHistory: async (userId = 1, limit = 50) => {
        try {
            const response = await fetchWithTimeout(`${DEV_API_URL}/api/coins/${userId}/history?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get Coin History Error:', error);
            throw error;
        }
    },
};
