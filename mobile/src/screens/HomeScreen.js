import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Upload, User, Users } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/Button';
import { NotificationButton } from '../components/NotificationButton';
import { CoinBadge } from '../components/CoinBadge';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';
import { API_URL } from '../config';

export const HomeScreen = ({ navigation }) => {
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coins, setCoins] = useState(0);

    useEffect(() => {
        fetchRecentScans();
        fetchCoinBalance();
    }, []);

    const fetchRecentScans = async () => {
        try {
            setLoading(true);
            const scans = await api.getRecentScans();
            setRecentScans(scans);
        } catch (error) {
            console.error('Failed to fetch recent scans:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoinBalance = async () => {
        try {
            const data = await api.getCoinBalance(1);
            setCoins(data.balance);
        } catch (error) {
            console.error('Failed to fetch coin balance:', error);
        }
    };

    const pickImage = async () => {
        // Request permission
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Navigate to results with the selected photo
            navigation.navigate('Results', { photoUri: result.assets[0].uri });
        }
    };

    const handleScanPress = (scan) => {
        // Navigate to results screen with scan data
        navigation.navigate('Results', {
            scanData: scan.nutrition_data || JSON.parse(scan.nutrition_json)
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header with Profile, Coins, and Notifications */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>FoodID 🍽️</Text>
                        <Text style={styles.subtitle}>Scan your food, know what you eat</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <CoinBadge coins={coins} onPress={() => navigation.navigate('CoinHistory')} />
                        <NotificationButton
                            onPress={() => navigation.navigate('Notifications')}
                            unreadCount={1}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
                            <User size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
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
                        <Button
                            title="Upload Photo"
                            variant="secondary"
                            onPress={pickImage}
                            style={styles.uploadButton}
                            icon={<Upload size={20} color={colors.primary} />}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Scans</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('History')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : recentScans.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No scans yet. Start exploring!</Text>
                        </View>
                    ) : (
                        <View style={styles.scansContainer}>
                            {recentScans.map((scan) => (
                                <TouchableOpacity
                                    key={scan.id}
                                    style={styles.scanItem}
                                    onPress={() => handleScanPress(scan)}
                                >
                                    {/* Thumbnail Image */}
                                    <Image
                                        source={{ uri: scan.image_path.startsWith('http') ? scan.image_path : `${API_URL}/static/${scan.image_path.split('/').pop()}` }}
                                        style={styles.scanImage}
                                    />
                                    <View style={styles.scanInfo}>
                                        <View style={styles.scanInfo}>
                                            <Text style={styles.scanName}>{scan.food_name}</Text>
                                            <Text style={styles.scanDate}>
                                                {new Date(scan.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.scanBadge}>
                                        <Text style={styles.scanConfidence}>{scan.confidence}%</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Referral Card */}
                <View style={styles.referralCard}>
                    <View style={styles.referralContent}>
                        <Text style={styles.referralEmoji}>👥</Text>
                        <View style={styles.referralText}>
                            <Text style={styles.referralTitle}>Invite Friends</Text>
                            <Text style={styles.referralSubtitle}>Share FoodID and earn rewards!</Text>
                        </View>
                    </View>
                    <Button
                        title="Refer Now"
                        onPress={() => navigation.navigate('Referral')}
                        variant="secondary"
                        style={styles.referralButton}
                    />
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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        ...typography.h2,
        marginBottom: 4,
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
    uploadButton: {
        width: '100%',
        marginTop: 12,
    },
    section: {
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        ...typography.h3,
    },
    viewAllText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: 'bold',
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
    loadingContainer: {
        padding: 24,
        alignItems: 'center',
    },
    scansContainer: {
        gap: 12,
    },
    scanItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 8,
    },
    scanImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    scanInfo: {
        flex: 1,
    },
    scanName: {
        ...typography.h4,
        marginBottom: 4,
    },
    scanDate: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    scanBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scanConfidence: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    referralCard: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 24,
        padding: 20,
        backgroundColor: colors.primary,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    referralContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    referralEmoji: {
        fontSize: 48,
        marginRight: 16,
    },
    referralText: {
        flex: 1,
    },
    referralTitle: {
        ...typography.h3,
        color: colors.white,
        marginBottom: 4,
    },
    referralSubtitle: {
        ...typography.body,
        color: colors.white,
        opacity: 0.9,
    },
    referralButton: {
        backgroundColor: colors.white,
    },
});
