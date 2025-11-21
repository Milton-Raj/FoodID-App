import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const mockNotifications = [
    {
        id: 1,
        title: 'Welcome to FoodID! 🎉',
        message: 'Start scanning your meals to track nutrition',
        time: '2 hours ago',
        read: false
    },
    {
        id: 2,
        title: 'Daily Goal Achieved! 🏆',
        message: 'You\'ve scanned 5 meals today',
        time: '1 day ago',
        read: true
    },
    {
        id: 3,
        title: 'New Feature Available',
        message: 'Check out food history for interesting facts',
        time: '2 days ago',
        read: true
    }
];

export const NotificationsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {mockNotifications.map((notification) => (
                    <TouchableOpacity
                        key={notification.id}
                        style={[
                            styles.notificationCard,
                            !notification.read && styles.unreadCard
                        ]}
                    >
                        <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>
                                {notification.title}
                            </Text>
                            <Text style={styles.notificationMessage}>
                                {notification.message}
                            </Text>
                            <Text style={styles.notificationTime}>
                                {notification.time}
                            </Text>
                        </View>
                        {!notification.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                ))}
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
    content: {
        flex: 1,
        padding: 16,
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
