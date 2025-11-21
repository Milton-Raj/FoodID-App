import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, Foodie! 👋</Text>
                <Text style={styles.subtitle}>What are you eating today?</Text>
            </View>

            <View style={styles.actionContainer}>
                <View style={styles.scanCard}>
                    <View style={styles.iconContainer}>
                        <Camera size={48} color={colors.primary} />
                    </View>
                    <Text style={styles.scanTitle}>Scan your meal</Text>
                    <Text style={styles.scanSubtitle}>
                        Get instant nutrition facts and ingredients
                    </Text>
                    <Button
                        title="Open Camera"
                        onPress={() => navigation.navigate('Camera')}
                        style={styles.scanButton}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Scans</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No scans yet. Start exploring!</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 24,
    },
    greeting: {
        ...typography.h2,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    actionContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    scanCard: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    scanTitle: {
        ...typography.h3,
        marginBottom: 8,
    },
    scanSubtitle: {
        ...typography.bodySmall,
        textAlign: 'center',
        marginBottom: 24,
    },
    scanButton: {
        width: '100%',
    },
    section: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: 16,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyText: {
        ...typography.bodySmall,
    },
});
