import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const ContactPicker = ({ contacts, selectedContacts, onToggleContact, searchQuery }) => {
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phoneNumbers && contact.phoneNumbers.some(phone =>
            phone.number.includes(searchQuery)
        ))
    );

    // Group contacts by first letter
    const groupedContacts = filteredContacts.reduce((acc, contact) => {
        const firstLetter = contact.name[0].toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(contact);
        return acc;
    }, {});

    const sections = Object.keys(groupedContacts)
        .sort()
        .map(letter => ({
            title: letter,
            data: groupedContacts[letter],
        }));

    const renderContact = ({ item }) => {
        const isSelected = selectedContacts.includes(item.id);
        const phoneNumber = item.phoneNumbers && item.phoneNumbers[0]?.number;

        return (
            <TouchableOpacity
                style={[styles.contactItem, isSelected && styles.selectedContact]}
                onPress={() => onToggleContact(item)}
            >
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    {phoneNumber && (
                        <Text style={styles.contactPhone}>{phoneNumber}</Text>
                    )}
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
            </TouchableOpacity>
        );
    };

    const renderSection = ({ item: section }) => (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.data.map((contact, index) => (
                <View key={contact.id || index}>
                    {renderContact({ item: contact })}
                </View>
            ))}
        </View>
    );

    return (
        <FlatList
            data={sections}
            renderItem={renderSection}
            keyExtractor={(item) => item.title}
            style={styles.list}
            contentContainerStyle={styles.listContent}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    sectionHeader: {
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        ...typography.h4,
        color: colors.primary,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectedContact: {
        backgroundColor: colors.primary + '10',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        ...typography.body,
        marginBottom: 2,
    },
    contactPhone: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
