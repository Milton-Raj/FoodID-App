import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const OnboardingScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>🥗</Text>
                </View>
                <Text style={styles.title}>Eat with confidence</Text>
                <Text style={styles.subtitle}>
                    One photo. Full facts. Identify food, track nutrition, and eat smarter.
                </Text>
            </View>
            <View style={styles.footer}>
                <Button
                    title="Get Started"
                    onPress={() => navigation.replace('Home')}
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    placeholderText: {
        fontSize: 64,
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        color: colors.textSecondary,
    },
    footer: {
        padding: 24,
    },
});
