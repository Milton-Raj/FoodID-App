import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';

export const CoinHistoryScreen = ({ navigation }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        fetchCoinData();
    }, []);

    const fetchCoinData = async () => {
        try {
            setLoading(true);
            const [historyData, balanceData] = await Promise.all([
                api.getCoinHistory(1),
                api.getCoinBalance(1),
            ]);
            setTransactions(historyData);
            setBalance(balanceData.balance);
        } catch (error) {
            console.error('Failed to fetch coin data:', error);
            // Use mock data as fallback
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
                <Text style={styles.coinEmoji}>🪙</Text>
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
                    <Text style={styles.balanceEmoji}>🪙</Text>
                </View>
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
    balanceEmoji: {
        fontSize: 48,
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
    coinEmoji: {
        fontSize: 20,
    },
});
