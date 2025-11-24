// API Configuration
// Replace with your machine's IP address if testing on physical device
// For Android Emulator use 'http://10.0.2.2:8000'
// For iOS Simulator use 'http://localhost:8000'

// For Android Emulator use 'http://10.0.2.2:8000'
// For iOS Simulator use 'http://localhost:8000'
// For Physical Device use your machine's IP address (e.g. 'http://192.168.1.5:8000')

export const API_URL = 'http://localhost:8000';

// Mock function to simulate sending OTP
export const mockSendOTP = (phoneNumber) => {
    return new Promise((resolve) => {
        // Simulate network latency
        setTimeout(() => {
            resolve({ otp: '123456' });
        }, 1000);
    });
};

// Mock function to simulate verifying OTP
export const mockVerifyOTP = (phoneNumber, otpCode) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Accept any OTP for demo purposes, or specific ones
            resolve({
                success: true,
                user: {
                    id: 'user_123',
                    phone_number: phoneNumber,
                    name: 'Demo User'
                }
            });
        }, 1000);
    });
};

// Mock function to simulate food analysis
export const mockAnalyzeFood = (photoUri) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: "Grilled Salmon Salad",
                confidence: 98,
                calories: 450,
                macros: {
                    protein: "35g",
                    carbs: "12g",
                    fat: "22g"
                },
                ingredients: ["Salmon", "Lettuce", "Cherry Tomatoes", "Cucumber", "Olive Oil"],
                healthScore: 92,
                history: {
                    origin: "Modern fusion cuisine",
                    cultural: "Popular in Mediterranean diets for its heart-healthy fats.",
                    funFact: "Salmon is rich in Omega-3 fatty acids which are great for brain health!"
                }
            });
        }, 1500);
    });
};

// Mock function to simulate fetching recent scans
export const mockGetRecentScans = (userId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    food_name: "Avocado Toast",
                    image_path: "https://images.unsplash.com/photo-1588137372308-15f75323ca8d",
                    created_at: new Date().toISOString(),
                    nutrition_data: { calories: 320, protein: "12g", carbs: "45g", fat: "18g" },
                    confidence: 95
                },
                {
                    id: 2,
                    food_name: "Berry Smoothie",
                    image_path: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4",
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    nutrition_data: { calories: 210, protein: "8g", carbs: "35g", fat: "4g" },
                    confidence: 92
                },
                {
                    id: 3,
                    food_name: "Quinoa Bowl",
                    image_path: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                    nutrition_data: { calories: 440, protein: "16g", carbs: "62g", fat: "14g" },
                    confidence: 89
                }
            ]);
        }, 800);
    });
};
