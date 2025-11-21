import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';

export const NotificationDetailScreen = ({ route, navigation }) => {
    const { notificationId } = route.params;
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotificationDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchNotificationDetail = async () => {
        try {
            setLoading(true);

            // Add timeout to prevent hanging
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 5000)
            );

            const dataPromise = api.getNotificationDetail(notificationId);
            const data = await Promise.race([dataPromise, timeout]);

            setNotification(data);

            // Mark as read
            if (!data.read) {
                await api.markNotificationRead(notificationId);
            }
        } catch (error) {
            console.error('Failed to fetch notification:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'achievement':
                return '🏆';
            case 'referral':
                return '👥';
            case 'system':
                return '📢';
            default:
                return '🔔';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'achievement':
                return colors.success;
            case 'referral':
                return colors.primary;
            case 'system':
                return colors.secondary;
            default:
                return colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!notification) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Notification not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.notificationCard}>
                    {/* Type Badge */}
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(notification.notification_type) + '20' }]}>
                        <Text style={styles.typeIcon}>{getTypeIcon(notification.notification_type)}</Text>
                        <Text style={[styles.typeText, { color: getTypeColor(notification.notification_type) }]}>
                            {notification.notification_type.charAt(0).toUpperCase() + notification.notification_type.slice(1)}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{notification.title}</Text>

                    {/* Timestamp */}
                    <Text style={styles.timestamp}>
                        {new Date(notification.created_at).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Message */}
                    <Text style={styles.message}>{notification.message}</Text>

                    {/* Metadata (if available) */}
                    {notification.extra_data && (
                        <View style={styles.metadataSection}>
                            <View style={styles.metadataCard}>
                                <Text style={styles.metadataTitle}>Additional Information</Text>
                                {(() => {
                                    try {
                                        const data = JSON.parse(notification.extra_data);
                                        return Object.entries(data).map(([key, value]) => (
                                            <View key={key} style={styles.metadataRow}>
                                                <Text style={styles.metadataKey}>{key}:</Text>
                                                <Text style={styles.metadataValue}>{value}</Text>
                                            </View>
                                        ));
                                    } catch {
                                        return <Text style={styles.metadataValue}>{notification.extra_data}</Text>;
                                    }
                                })()}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
    },
    notificationCard: {
        margin: 16,
        padding: 24,
        backgroundColor: colors.white,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    typeIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    typeText: {
        ...typography.bodySmall,
        fontWeight: 'bold',
    },
    title: {
        ...typography.h2,
        marginBottom: 8,
    },
    timestamp: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    message: {
        ...typography.body,
        lineHeight: 24,
        color: colors.text,
    },
    metadataSection: {
        marginTop: 24,
    },
    metadataCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    metadataTitle: {
        ...typography.h4,
        marginBottom: 12,
    },
    metadataRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    metadataKey: {
        ...typography.bodySmall,
        fontWeight: 'bold',
        marginRight: 8,
        textTransform: 'capitalize',
    },
    metadataValue: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
});
