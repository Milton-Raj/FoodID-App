import { Platform } from 'react-native';
import { API_URL, mockAnalyzeFood, mockGetRecentScans } from '../config';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical device, use your computer's IP address
const DEV_API_URL = API_URL;

export const api = {
    analyzeFood: async (photoUri) => {
        try {
            // Use mock data for demo
            console.log('Analyzing food (MOCK)...');
            return await mockAnalyzeFood(photoUri);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getRecentScans: async (userId = 1, limit = 10) => {
        try {
            // Use mock data for demo
            console.log('Fetching recent scans (MOCK)...');
            return await mockGetRecentScans(userId);
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Profile APIs
    getProfile: async (userId = 1) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/profile/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get Profile Error:', error);
            throw error;
        }
    },

    updateProfile: async (userId = 1, profileData) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/profile/${userId}`, {
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

            const response = await fetch(`${DEV_API_URL}/api/profile/upload-image?user_id=${userId}`, {
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
            const response = await fetch(`${DEV_API_URL}/api/notifications/${userId}?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get Notifications Error:', error);
            throw error;
        }
    },

    getNotificationDetail: async (notificationId) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/notifications/detail/${notificationId}`);
            return await response.json();
        } catch (error) {
            console.error('Get Notification Detail Error:', error);
            throw error;
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/notifications/${notificationId}/read`, {
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
            const response = await fetch(`${DEV_API_URL}/api/notifications/${userId}/unread-count`);
            return await response.json();
        } catch (error) {
            console.error('Get Unread Count Error:', error);
            throw error;
        }
    },

    // Referral APIs
    sendReferrals: async (userId = 1, phoneNumbers) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/referrals/send`, {
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
            const response = await fetch(`${DEV_API_URL}/api/referrals/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get Referrals Error:', error);
            throw error;
        }
    },

    getReferralStats: async (userId = 1) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/referrals/${userId}/stats`);
            return await response.json();
        } catch (error) {
            console.error('Get Referral Stats Error:', error);
            throw error;
        }
    },

    // Coin APIs
    getCoinBalance: async (userId = 1) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/coins/${userId}/balance`);
            return await response.json();
        } catch (error) {
            console.error('Get Coin Balance Error:', error);
            throw error;
        }
    },

    getCoinHistory: async (userId = 1, limit = 50) => {
        try {
            const response = await fetch(`${DEV_API_URL}/api/coins/${userId}/history?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get Coin History Error:', error);
            throw error;
        }
    },
};
