import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { mockSendOTP } from '../config';

export const SendOTPScreen = ({ route, navigation }) => {
    const { phoneNumber } = route.params;
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            const { otp } = await mockSendOTP(phoneNumber);
            // Navigate to OTPScreen with the fetched OTP
            navigation.navigate('OTP', { phoneNumber, otpCode: otp });
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Send OTP</Text>
                <Text style={styles.subtitle}>We will send a verification code to {phoneNumber}</Text>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <Button title="Send OTP" onPress={handleSend} />
                )}
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
        alignItems: 'center',
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
        marginBottom: 24,
    },
});
