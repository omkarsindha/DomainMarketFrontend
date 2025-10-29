import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getMyListings, cancelListing } from '../../src/services/listingService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const ListingItem = ({ item, onCancel }) => {
    const isCancellable = item.status === 'ACTIVE';
    const statusColor = item.status === 'ACTIVE' ? COLORS.primaryGreen : (item.status === 'SOLD' ? COLORS.textSecondary : COLORS.error);

    const handleCancel = () => {
        Alert.alert(
            "Confirm Cancellation",
            `Are you sure you want to cancel the listing for "${item.domain_name}"?`,
            [
                { text: "No", style: "cancel" },
                { text: "Yes, Cancel", style: "destructive", onPress: () => onCancel(item.id) }
            ]
        );
    };

    return (
        <View style={globalStyles.card}>
            <View style={styles.row}>
                <Text style={styles.domainName}>{item.domain_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.value}>${parseFloat(item.price || 0).toFixed(2)}</Text>
            </View>
            {isCancellable && (
                <TouchableOpacity
                    style={[globalStyles.button, styles.cancelButton]}
                    onPress={handleCancel}
                >
                    <Text style={[globalStyles.buttonText, styles.cancelButtonText]}>Cancel Listing</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const MyListingsPage = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        setError('');
        try {
            const data = await getMyListings();
            setListings(data || []);
        } catch (err) {
            setError(err.message || "Could not load your listings.");
        } finally {
            if (!isRefresh) setLoading(false);
            else setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const handleCancelListing = async (listingId) => {
        try {
            await cancelListing(listingId);
            Alert.alert("Success", "Listing has been cancelled.");
            loadData(true); // Refresh the list
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to cancel listing.");
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    if (loading) {
        return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {error && !listings.length ? (
                <View style={globalStyles.centeredContainer}>
                    <Text style={globalStyles.errorText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ListingItem item={item} onCancel={handleCancelListing} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <View style={globalStyles.centeredContainer}>
                            <Ionicons name="pricetags-outline" size={80} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>You haven't created any listings.</Text>
                        </View>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primaryGreen]} tintColor={COLORS.primaryGreen} />}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    listContent: { padding: SPACING.md },
    emptyText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.lg, marginTop: SPACING.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xs },
    domainName: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.sm },
    label: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
    value: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
    statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: 12 },
    statusText: { fontSize: FONT_SIZES.xs, fontWeight: 'bold', color: COLORS.darkBg, textTransform: 'uppercase' },
    cancelButton: { backgroundColor: COLORS.error, borderColor: COLORS.error, marginTop: SPACING.md, paddingVertical: SPACING.sm },
    cancelButtonText: { color: COLORS.white },
});

export default MyListingsPage;