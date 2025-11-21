import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Wallet } from 'lucide-react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TransferScreen = ({ navigation }) => {
    const [receiverPhone, setReceiverPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserId(user.id);
                fetchBalance(user.id);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const fetchBalance = async (id) => {
        try {
            const data = await api.getCoinBalance(id);
            setBalance(data.balance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const handleTransfer = async () => {
        if (!receiverPhone || receiverPhone.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid phone number');
            return;
        }

        const transferAmount = parseInt(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (transferAmount > balance) {
            Alert.alert('Insufficient Balance', 'You do not have enough coins');
            return;
        }

        try {
            setLoading(true);
            const result = await api.transferCoins(userId, receiverPhone, transferAmount);

            Alert.alert('Success', `Successfully transferred ${transferAmount} coins!`);
            setReceiverPhone('');
            setAmount('');
            // Update balance
            setBalance(result.sender_new_balance);

            // Navigate back or to history
            // navigation.goBack();
        } catch (error) {
            console.error('Transfer failed:', error);
            Alert.alert('Error', error.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transfer Coins</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.content}>
                    {/* Balance Card */}
                    <View style={styles.balanceCard}>
                        <View style={styles.balanceHeader}>
                            <Wallet size={24} color={colors.primary} />
                            <Text style={styles.balanceLabel}>Current Balance</Text>
                        </View>
                        <Text style={styles.balanceValue}>{balance} Coins</Text>
                    </View>

                    {/* Transfer Form */}
                    <View style={styles.form}>
                        <Text style={styles.label}>Receiver Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            value={receiverPhone}
                            onChangeText={setReceiverPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter amount"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Button
                            title={loading ? 'Sending...' : 'Send Coins'}
                            onPress={handleTransfer}
                            disabled={loading}
                            style={styles.sendButton}
                            icon={<Send size={20} color={colors.white} />}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        ...typography.h3,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    balanceCard: {
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    balanceLabel: {
        ...typography.body,
        color: colors.textSecondary,
    },
    balanceValue: {
        fontSize: 40,
        fontWeight: 'bold',
        color: colors.primary,
    },
    form: {
        gap: 16,
    },
    label: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        ...typography.body,
        marginBottom: 8,
    },
    sendButton: {
        marginTop: 16,
    },
});
