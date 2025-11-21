import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, Mail, Phone, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { CoinBadge } from '../components/CoinBadge';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';

export const ProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        phone_number: '',
        name: '',
        email: '',
        profile_image: null,
        coins: 0,
    });

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            // Add timeout to prevent hanging
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 5000)
            );

            const dataPromise = api.getProfile(1);
            const data = await Promise.race([dataPromise, timeout]);

            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Use mock data as fallback
            setProfile({
                phone_number: '+1234567890',
                name: 'John Doe',
                email: 'john@example.com',
                profile_image: null,
                coins: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.updateProfile(1, {
                name: profile.name,
                email: profile.email,
            });
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            try {
                const uploadResult = await api.uploadProfileImage(1, result.assets[0].uri);
                setProfile({ ...profile, profile_image: uploadResult.profile_image });
                Alert.alert('Success', 'Profile image updated');
            } catch (error) {
                console.error('Failed to upload image:', error);
                Alert.alert('Error', 'Failed to upload image');
            }
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Avatar */}
                <View style={styles.avatarSection}>
                    <ProfileAvatar
                        imageUri={profile.profile_image}
                        name={profile.name}
                        size={120}
                        onPress={handleImagePick}
                    />
                    <TouchableOpacity onPress={handleImagePick} style={styles.changePhotoButton}>
                        <Camera size={16} color={colors.primary} />
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Coins Display */}
                <View style={styles.coinsSection}>
                    <Text style={styles.coinsLabel}>Your Coins</Text>
                    <View style={styles.coinsDisplay}>
                        <Text style={styles.coinsAmount}>{profile.coins}</Text>
                        <Text style={styles.coinsEmoji}>🪙</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('CoinHistory')}>
                        <Text style={styles.viewHistoryText}>View Coin History</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Form */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Phone size={16} color={colors.textSecondary} /> Phone Number
                        </Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={profile.phone_number}
                            editable={false}
                            placeholderTextColor={colors.textSecondary}
                        />
                        <Text style={styles.helperText}>Phone number cannot be changed</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <User size={16} color={colors.textSecondary} /> Name
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={profile.name}
                            onChangeText={(text) => setProfile({ ...profile, name: text })}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Mail size={16} color={colors.textSecondary} /> Email
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={profile.email}
                            onChangeText={(text) => setProfile({ ...profile, email: text })}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <View style={styles.buttonSection}>
                    <Button
                        title={saving ? 'Saving...' : 'Save Changes'}
                        onPress={handleSave}
                        disabled={saving}
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
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: colors.surface,
        marginBottom: 16,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    changePhotoText: {
        ...typography.bodySmall,
        color: colors.primary,
        marginLeft: 8,
        fontWeight: 'bold',
    },
    coinsSection: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: colors.white,
        marginBottom: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    coinsLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    coinsDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    coinsAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.secondary,
        marginRight: 8,
    },
    coinsEmoji: {
        fontSize: 48,
    },
    viewHistoryText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: 'bold',
    },
    formSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        ...typography.h4,
        marginBottom: 8,
        color: colors.text,
    },
    input: {
        ...typography.body,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: colors.text,
    },
    disabledInput: {
        backgroundColor: colors.surface,
        color: colors.textSecondary,
    },
    helperText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    buttonSection: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
});
