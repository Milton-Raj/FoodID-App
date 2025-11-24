import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, AlertTriangle, ArrowLeft, Camera } from 'lucide-react-native';
import { Button } from '../components/Button';
import { NutritionCard } from '../components/NutritionCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ResultsScreen = ({ route, navigation }) => {
    const { photoUri, scanData } = route.params || {};
    const [data, setData] = React.useState(scanData || null);
    const [loading, setLoading] = React.useState(!scanData);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        // If scanData is provided (from recent scans), use it directly
        if (scanData) {
            // Handle both formats: direct properties or nested nutrition_data
            const normalizedData = scanData.nutrition_data || scanData;
            setData(normalizedData);
            setLoading(false);
            return;
        }

        // Otherwise, analyze the photo
        const fetchData = async () => {
            if (!photoUri) {
                setError('No photo URI provided.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('Analyzing food with URI:', photoUri);
                const { api } = require('../services/api');

                // Get user ID
                let userId = 1;
                try {
                    const userStr = await AsyncStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        userId = user.id;
                    }
                } catch (e) {
                    console.warn('Failed to get user ID for scan:', e);
                }

                const result = await api.analyzeFood(photoUri, userId);
                console.log('Analysis result:', result);
                setData(result);
            } catch (error) {
                console.error('Analysis failed:', error);
                setError(error.message || 'Failed to analyze food. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [photoUri, scanData]);

    const handleBackPress = () => {
        // Go back to home screen
        navigation.navigate('Home');
    };

    const handleRetakePress = () => {
        // Go back to camera
        navigation.goBack();
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Analyzing your food...</Text>
            </SafeAreaView>
        );
    }

    if (error || !data) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <AlertTriangle size={48} color={colors.error} />
                <Text style={styles.errorText}>{error || 'No data found'}</Text>
                <Button title="Try Again" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
            </SafeAreaView>
        );
    }

    // Use API data with safe defaults
    const mockData = {
        name: data.name || 'Unknown Food',
        confidence: data.confidence || 0,
        healthScore: data.healthScore || 0,
        calories: data.calories || 0,
        protein: data.macros?.protein || data.protein || 0,
        carbs: data.macros?.carbs || data.carbs || 0,
        fat: data.macros?.fat || data.fat || 0,
        ingredients: data.ingredients || [],
        history: data.history || null,
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image Header with Floating Buttons */}
                <View style={styles.imageContainer}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: colors.surface }]} />
                    )}

                    {/* Floating Header Buttons */}
                    <View style={styles.floatingHeader}>
                        <TouchableOpacity onPress={handleBackPress} style={styles.floatingButton}>
                            <ArrowLeft size={20} color={colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRetakePress} style={styles.floatingButton}>
                            <Camera size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.confidenceBadge}>
                        <CheckCircle size={16} color={colors.white} />
                        <Text style={styles.confidenceText}>{mockData.confidence}% Match</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Title & Score */}
                    <View style={styles.headerRow}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{mockData.name}</Text>
                            <Text style={styles.subtitle}>Healthy Choice</Text>
                        </View>
                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreValue}>{mockData.healthScore}</Text>
                            <Text style={styles.scoreLabel}>Health Score</Text>
                        </View>
                    </View>

                    {/* Nutrition Grid */}
                    <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                    <View style={styles.nutritionGrid}>
                        <NutritionCard label="Calories" value={mockData.calories} unit=" kcal" />
                        <NutritionCard label="Protein" value={mockData.protein} color={colors.primary} />
                        <NutritionCard label="Carbs" value={mockData.carbs} color={colors.warning} />
                        <NutritionCard label="Fat" value={mockData.fat} color={colors.error} />
                    </View>

                    {/* Ingredients */}
                    {mockData.ingredients.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Ingredients</Text>
                            <View style={styles.ingredientsContainer}>
                                {mockData.ingredients.map((ing, index) => (
                                    <View key={index} style={styles.chip}>
                                        <Text style={styles.chipText}>{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Food History */}
                    {mockData.history && (
                        <View style={styles.historySection}>
                            <Text style={styles.sectionTitle}>Food History</Text>

                            <View style={styles.historyCard}>
                                <Text style={styles.historyLabel}>🌍 Origin</Text>
                                <Text style={styles.historyText}>{mockData.history.origin}</Text>
                            </View>

                            <View style={styles.historyCard}>
                                <Text style={styles.historyLabel}>📖 Cultural Significance</Text>
                                <Text style={styles.historyText}>{mockData.history.cultural}</Text>
                            </View>

                            <View style={styles.historyCard}>
                                <Text style={styles.historyLabel}>💡 Fun Fact</Text>
                                <Text style={styles.historyText}>{mockData.history.funFact}</Text>
                            </View>
                        </View>
                    )}
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
    scrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        height: 350,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    floatingHeader: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    floatingButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    confidenceBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    confidenceText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    content: {
        padding: 24,
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    titleContainer: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        ...typography.h2,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
    scoreContainer: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 12,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    scoreLabel: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: 16,
        marginTop: 8,
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    ingredientsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 32,
    },
    chip: {
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipText: {
        ...typography.bodySmall,
    },
    historySection: {
        marginTop: 24,
    },
    historyCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    historyLabel: {
        ...typography.h4,
        marginBottom: 8,
        color: colors.primary,
    },
    historyText: {
        ...typography.body,
        lineHeight: 22,
        color: colors.textSecondary,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        ...typography.body,
        color: colors.textSecondary,
    },
    errorText: {
        marginTop: 16,
        ...typography.body,
        color: colors.error,
        textAlign: 'center',
    },
});
