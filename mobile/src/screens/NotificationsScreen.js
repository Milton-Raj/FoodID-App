import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';

export const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await api.getNotifications(1);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleNotificationPress = (notification) => {
        navigation.navigate('NotificationDetail', { notificationId: notification.id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    {notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={[
                                styles.notificationCard,
                                !notification.read && styles.unreadCard
                            ]}
                            onPress={() => handleNotificationPress(notification)}
                        >
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationTitle}>
                                    {notification.title}
                                </Text>
                                <Text style={styles.notificationMessage} numberOfLines={2}>
                                    {notification.message}
                                </Text>
                                <Text style={styles.notificationTime}>
                                    {new Date(notification.created_at).toLocaleString()}
                                </Text>
                            </View>
                            {!notification.read && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: colors.border,
    },
    unreadCard: {
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...typography.h4,
        marginBottom: 4,
    },
    notificationMessage: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    notificationTime: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginLeft: 8,
        marginTop: 8,
    },
});
