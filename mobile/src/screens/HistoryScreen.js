import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { API_URL } from '../config';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const HistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchHistory();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : { id: 1 }; // Default to mock user 1

            const data = await api.getRecentScans(user.id);
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Results', {
                result: {
                    name: item.food_name,
                    confidence: item.confidence,
                    ...item.nutrition_data
                },
                imageUri: item.image_path ? (item.image_path.startsWith('http') ? item.image_path : `${API_URL}/static/${item.image_path.split('/').pop()}`) : null
            })}
        >
            <Image
                source={{ uri: item.image_path ? (item.image_path.startsWith('http') ? item.image_path : `${API_URL}/static/${item.image_path.split('/').pop()}`) : 'https://via.placeholder.com/100' }}
                style={styles.foodImage}
            />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.foodName}>{item.food_name}</Text>
                    <Text style={styles.calories}>
                        {item.nutrition_data?.calories || 0} kcal
                    </Text>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.dateContainer}>
                        <Calendar size={14} color={colors.textSecondary} />
                        <Text style={styles.date}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <ChevronRight size={20} color={colors.textSecondary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Food History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : history.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No history found</Text>
                    <Text style={styles.emptySubtext}>Scan some food to get started!</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    foodImage: {
        width: 100,
        height: 100,
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    foodName: {
        ...typography.h4,
        flex: 1,
        marginRight: 8,
    },
    calories: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    emptyText: {
        ...typography.h3,
        marginBottom: 8,
        color: colors.textSecondary,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
