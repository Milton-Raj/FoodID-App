import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Phone, Send } from 'lucide-react-native';
import * as Contacts from 'expo-contacts';
import { ContactPicker } from '../components/ContactPicker';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { api } from '../services/api';

export const ReferralScreen = ({ navigation }) => {
    const [mode, setMode] = useState('select'); // 'select' or 'manual'
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [manualPhone, setManualPhone] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [referralStats, setReferralStats] = useState(null);

    useEffect(() => {
        fetchReferralStats();
    }, []);

    const fetchReferralStats = async () => {
        try {
            const stats = await api.getReferralStats(1);
            setReferralStats(stats);
        } catch (error) {
            console.error('Failed to fetch referral stats:', error);
        }
    };

    const requestContactsPermission = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            loadContacts();
        } else {
            Alert.alert('Permission Denied', 'Cannot access contacts without permission');
        }
    };

    const loadContacts = async () => {
        try {
            setLoading(true);
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
            });

            if (data.length > 0) {
                setContacts(data);
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
            Alert.alert('Error', 'Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleContact = (contact) => {
        if (selectedContacts.includes(contact.id)) {
            setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
        } else {
            setSelectedContacts([...selectedContacts, contact.id]);
        }
    };

    const handleSendReferrals = async () => {
        let phoneNumbers = [];

        if (mode === 'select') {
            // Get phone numbers from selected contacts
            phoneNumbers = selectedContacts
                .map((id) => {
                    const contact = contacts.find((c) => c.id === id);
                    return contact?.phoneNumbers?.[0]?.number;
                })
                .filter(Boolean);
        } else {
            // Use manual phone number
            if (!manualPhone || manualPhone.length < 10) {
                Alert.alert('Invalid Phone', 'Please enter a valid phone number');
                return;
            }
            phoneNumbers = [manualPhone];
        }

        if (phoneNumbers.length === 0) {
            Alert.alert('No Contacts', 'Please select at least one contact');
            return;
        }

        try {
            setSending(true);
            const result = await api.sendReferrals(1, phoneNumbers);
            Alert.alert(
                'Success',
                `Referral sent to ${phoneNumbers.length} contact${phoneNumbers.length > 1 ? 's' : ''}!`
            );
            setSelectedContacts([]);
            setManualPhone('');
            fetchReferralStats();
        } catch (error) {
            console.error('Failed to send referrals:', error);
            Alert.alert('Error', 'Failed to send referrals');
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refer Friends</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Referral Stats */}
            {referralStats && (
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Referrals</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{referralStats.total_referrals}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{referralStats.pending}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{referralStats.registered}</Text>
                            <Text style={styles.statLabel}>Joined</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Mode Selector */}
            <View style={styles.modeSelector}>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'select' && styles.modeButtonActive]}
                    onPress={() => setMode('select')}
                >
                    <Users size={20} color={mode === 'select' ? colors.white : colors.primary} />
                    <Text style={[styles.modeButtonText, mode === 'select' && styles.modeButtonTextActive]}>
                        From Contacts
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
                    onPress={() => setMode('manual')}
                >
                    <Phone size={20} color={mode === 'manual' ? colors.white : colors.primary} />
                    <Text style={[styles.modeButtonText, mode === 'manual' && styles.modeButtonTextActive]}>
                        Manual Entry
                    </Text>
                </TouchableOpacity>
            </View>

            {mode === 'select' ? (
                <>
                    {contacts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Users size={64} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>No contacts loaded</Text>
                            <Button
                                title="Load Contacts"
                                onPress={requestContactsPermission}
                                style={styles.loadButton}
                            />
                        </View>
                    ) : (
                        <>
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search contacts..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                            <ContactPicker
                                contacts={contacts}
                                selectedContacts={selectedContacts}
                                onToggleContact={handleToggleContact}
                                searchQuery={searchQuery}
                            />
                        </>
                    )}
                </>
            ) : (
                <View style={styles.manualContainer}>
                    <Text style={styles.manualTitle}>Enter Phone Number</Text>
                    <TextInput
                        style={styles.manualInput}
                        placeholder="Enter 10-digit phone number"
                        keyboardType="phone-pad"
                        value={manualPhone}
                        onChangeText={setManualPhone}
                        maxLength={15}
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            )}

            {/* Send Button */}
            <View style={styles.footer}>
                <Button
                    title={sending ? 'Sending...' : `Send Referral${mode === 'select' && selectedContacts.length > 1 ? 's' : ''}`}
                    onPress={handleSendReferrals}
                    disabled={sending || (mode === 'select' && selectedContacts.length === 0)}
                    icon={<Send size={20} color={colors.white} />}
                />
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
    statsCard: {
        margin: 16,
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsTitle: {
        ...typography.h4,
        marginBottom: 16,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginTop: 4,
    },
    modeSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
    modeButtonActive: {
        backgroundColor: colors.primary,
    },
    modeButtonText: {
        ...typography.body,
        color: colors.primary,
        marginLeft: 8,
        fontWeight: 'bold',
    },
    modeButtonTextActive: {
        color: colors.white,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    searchInput: {
        ...typography.body,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: 16,
        marginBottom: 24,
    },
    loadButton: {
        minWidth: 200,
    },
    manualContainer: {
        flex: 1,
        padding: 16,
    },
    manualTitle: {
        ...typography.h4,
        marginBottom: 16,
    },
    manualInput: {
        ...typography.body,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
    },
});
