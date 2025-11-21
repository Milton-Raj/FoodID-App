import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const OTPScreen = ({ route, navigation }) => {
    const { phoneNumber, otpCode } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    // Auto-fill OTP for testing (Mock SMS)
    useEffect(() => {
        if (otpCode) {
            const otpArray = otpCode.split('');
            setOtp(otpArray);
            // Auto-verify after a short delay
            setTimeout(() => {
                verifyOTP(otpArray.join(''));
            }, 1000);
        }
    }, [otpCode]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOTPChange = (value, index) => {
        const newOTP = [...otp];
        newOTP[index] = value;
        setOtp(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all digits entered
        if (index === 5 && value) {
            verifyOTP(newOTP.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyOTP = async (otpString) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    otp_code: otpString || otp.join('')
                })
            });

            const data = await response.json();

            if (data.success) {
                // Save user data
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                await AsyncStorage.setItem('isLoggedIn', 'true');

                // Navigate to main app
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            } else {
                Alert.alert('Invalid OTP', 'Please check your OTP and try again');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Enter OTP 🔐</Text>
                    <Text style={styles.subtitle}>
                        Code sent to {phoneNumber}
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputRefs.current[index] = ref}
                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                            value={digit}
                            onChangeText={(value) => handleOTPChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <Button
                    title={loading ? "Verifying..." : "Verify OTP"}
                    onPress={() => verifyOTP()}
                    disabled={loading || otp.some(d => !d)}
                    style={styles.button}
                />

                <Text style={styles.resendText}>
                    Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
            </View>
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: colors.surface,
    },
    otpInputFilled: {
        borderColor: colors.primary,
    },
    button: {
        marginTop: 16,
    },
    resendText: {
        ...typography.body,
        textAlign: 'center',
        marginTop: 24,
        color: colors.textSecondary,
    },
    resendLink: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});
