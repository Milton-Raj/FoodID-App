import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const CoinBadge = ({ coins, onPress, animated = false }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (animated) {
            // Bounce animation when coins change
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1.3,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Continuous pulse
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [coins, animated, scaleAnim, pulseAnim]);

    const CoinIcon = () => (
        <View style={styles.coinIcon}>
            <Text style={styles.coinEmoji}>🪙</Text>
        </View>
    );

    const content = (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: animated ? scaleAnim : 1 }],
                },
            ]}
        >
            <CoinIcon />
            <Text style={styles.coinText}>{coins || 0}</Text>
        </Animated.View>
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    coinIcon: {
        marginRight: 4,
    },
    coinEmoji: {
        fontSize: 16,
    },
    coinText: {
        ...typography.h4,
        color: colors.white,
        fontWeight: 'bold',
    },
});
