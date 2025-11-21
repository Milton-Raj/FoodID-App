// API Configuration
// Replace with your machine's IP address if testing on physical device
// For Android Emulator use 'http://10.0.2.2:8000'
// For iOS Simulator use 'http://localhost:8000'

export const API_URL = 'http://192.168.225.120:8000';

// Mock function to simulate sending OTP
export const mockSendOTP = (phoneNumber) => {
    return new Promise((resolve) => {
        // Simulate network latency
        setTimeout(() => {
            resolve({ otp: '123456' });
        }, 1000);
    });
};
