import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { API_URL } from '../config';

export const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber }),
                signal: controller.signal
            });

            const data = await response.json();

            if (data.success) {
                // Navigate to OTP screen
                navigation.navigate('OTP', {
                    phoneNumber,
                    otpCode: data.otp_code // For testing only
                });
            } else {
                Alert.alert('Error', data.detail || 'Failed to send OTP');
            }
        } catch (error) {
            console.error(error);
            if (error.name === 'AbortError') {
                Alert.alert('Connection Error', 'Request timed out. Please check your network connection and ensure the server IP is correct.');
            } else {
                Alert.alert('Connection Error', 'Failed to connect to server. Please check your network connection.');
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to FoodID! 🍽️</Text>
                    <Text style={styles.subtitle}>Enter your phone number to get started</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 10-digit phone number"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        maxLength={10}
                        autoFocus
                    />

                    <Button
                        title={loading ? "Sending OTP..." : "Send OTP"}
                        onPress={handleSendOTP}
                        disabled={loading}
                        style={styles.button}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
    },
    title: {
        ...typography.h1,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        marginBottom: 32,
    },
    label: {
        ...typography.h4,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
    },
    button: {
        marginTop: 8,
    },
    footer: {
        marginTop: 'auto',
    },
    footerText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
