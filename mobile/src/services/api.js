import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical device, use your computer's IP address
const DEV_API_URL = 'http://192.168.225.120:8000';

export const api = {
    analyzeFood: async (photoUri) => {
        const formData = new FormData();
        formData.append('file', {
            uri: photoUri,
            name: 'photo.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await fetch(`${DEV_API_URL}/scan/analyze`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getRecentScans: async (userId = 1, limit = 10) => {
        try {
            const response = await fetch(`${DEV_API_URL}/scan/recent?user_id=${userId}&limit=${limit}`);

            if (!response.ok) {
                throw new Error('Failed to fetch recent scans');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
};
