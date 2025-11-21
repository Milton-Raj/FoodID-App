import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const Button = ({ title, onPress, variant = 'primary', loading = false, style, icon }) => {
    const backgroundColor = variant === 'primary' ? colors.primary : colors.surface;
    const textColor = variant === 'primary' ? colors.white : colors.primary;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor }, style]}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.text, { color: textColor }]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        ...typography.button,
    },
});
