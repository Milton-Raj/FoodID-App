import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const ProfileAvatar = ({ imageUri, name, size = 80, onPress }) => {
    const getInitials = (fullName) => {
        if (!fullName) return '?';
        const names = fullName.trim().split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const avatarSize = {
        width: size,
        height: size,
        borderRadius: size / 2,
    };

    const content = (
        <View style={[styles.container, avatarSize]}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={[styles.image, avatarSize]} />
            ) : (
                <View style={[styles.placeholder, avatarSize]}>
                    <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
                        {getInitials(name)}
                    </Text>
                </View>
            )}
            {onPress && (
                <View style={styles.editBadge}>
                    <Text style={styles.editIcon}>✏️</Text>
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        resizeMode: 'cover',
    },
    placeholder: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: colors.white,
        fontWeight: 'bold',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.white,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    editIcon: {
        fontSize: 12,
    },
});
