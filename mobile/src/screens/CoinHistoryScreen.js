import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/Button';
import { Send } from 'lucide-react-native';

export const CoinHistoryScreen = ({ navigation }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUserData = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                fetchCoinData(user.id);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };

    const fetchCoinData = async (userId) => {
        try {
            setLoading(true);

            // Reduced timeout for faster UX
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 3000)
            );

            const dataPromise = Promise.all([
                api.getCoinHistory(userId),
                api.getCoinBalance(userId),
            ]);

            const [historyData, balanceData] = await Promise.race([dataPromise, timeout]);
            setTransactions(historyData || []);
            // Handle different response formats (some APIs return { balance: 100 }, others just 100)
            const balanceValue = typeof balanceData === 'object' ? balanceData?.balance : balanceData;
            setBalance(balanceValue || 0);
        } catch (error) {
            console.error('Failed to fetch coin data:', error);
            // Use empty data as fallback
            setBalance(0);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'scan':
                return '📸';
            case 'referral':
                return '👥';
            case 'bonus':
                return '🎁';
            default:
                return '🪙';
        }
    };

    const groupTransactionsByDate = (transactions) => {
        const grouped = {};
        transactions.forEach((transaction) => {
            const date = new Date(transaction.created_at).toLocaleDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(transaction);
        });
        return grouped;
    };

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
                <Text style={styles.iconEmoji}>{getTransactionIcon(item.transaction_type)}</Text>
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{item.description}</Text>
                <Text style={styles.transactionTime}>
                    {new Date(item.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
            <View style={styles.transactionAmount}>
                <Text style={[styles.amountText, item.amount > 0 ? styles.amountPositive : styles.amountNegative]}>
                    {item.amount > 0 ? '+' : ''}{item.amount}
                </Text>
                <Text style={styles.coinSymbol}>●</Text>
            </View>
        </View>
    );

    const renderDateSection = ({ item }) => {
        const [date, transactions] = item;
        return (
            <View style={styles.dateSection}>
                <Text style={styles.dateHeader}>{date}</Text>
                {transactions.map((transaction, index) => (
                    <View key={transaction.id || index}>
                        {renderTransaction({ item: transaction })}
                    </View>
                ))}
            </View>
        );
    };

    const groupedTransactions = Object.entries(groupTransactionsByDate(transactions));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Coin History</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <View style={styles.balanceDisplay}>
                    <Text style={styles.balanceAmount}>{balance}</Text>
                    <Text style={styles.coinSymbolLarge}>●</Text>
                </View>
                <Button
                    title="Transfer Coins"
                    onPress={() => navigation.navigate('Transfer')}
                    style={styles.transferButton}
                    icon={<Send size={20} color={colors.white} />}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : transactions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🪙</Text>
                    <Text style={styles.emptyText}>No transactions yet</Text>
                    <Text style={styles.emptySubtext}>Start scanning meals to earn coins!</Text>
                </View>
            ) : (
                <FlatList
                    data={groupedTransactions}
                    renderItem={renderDateSection}
                    keyExtractor={(item) => item[0]}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    balanceCard: {
        margin: 16,
        padding: 24,
        backgroundColor: colors.white,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    balanceLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    balanceDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.secondary,
        marginRight: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.textSecondary,
    },
    listContent: {
        paddingBottom: 16,
    },
    dateSection: {
        marginBottom: 16,
    },
    dateHeader: {
        ...typography.h4,
        color: colors.textSecondary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.surface,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconEmoji: {
        fontSize: 24,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        ...typography.body,
        marginBottom: 4,
    },
    transactionTime: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    transactionAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountText: {
        ...typography.h4,
        fontWeight: 'bold',
        marginRight: 4,
    },
    amountPositive: {
        color: colors.success,
    },
    amountNegative: {
        color: colors.error,
    },
    coinSymbol: {
        fontSize: 16,
        color: colors.secondary, // Gold color
        marginLeft: 4,
    },
    balanceEmoji: {
        fontSize: 32,
        marginLeft: 8,
    },
    coinSymbolLarge: {
        fontSize: 32,
        color: colors.secondary, // Gold color
        marginLeft: 8,
    },
    transferButton: {
        marginTop: 16,
        width: '100%',
    },
});
