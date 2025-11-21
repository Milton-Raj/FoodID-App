import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const NutritionCard = ({ label, value, unit, color = colors.primary }) => {
    return (
        <View style={[styles.container, { borderColor: color }]}>
            <Text style={[styles.value, { color }]}>
                {value}
                <Text style={styles.unit}>{unit}</Text>
            </Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: 80,
        backgroundColor: colors.surface,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 12,
        fontWeight: 'normal',
    },
    label: {
        ...typography.caption,
        marginTop: 4,
        textTransform: 'uppercase',
    },
});
