import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getMySellingAuctions } from '../../src/services/auctionService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';
import { formatTimeRemaining } from '../../src/utils/timeUtils';
import { Ionicons } from '@expo/vector-icons';

const AuctionItem = ({ item }) => {
    const router = useRouter();
    const hasBids = item.bids && item.bids.length > 0;
    const displayPrice = hasBids ? (item.current_highest_bid || item.start_price) : item.start_price;
    const statusColor = item.status === 'ACTIVE' ? COLORS.primaryGreen : (item.status === 'CLOSED' ? COLORS.textSecondary : COLORS.error);

    return (
        <TouchableOpacity
            style={globalStyles.card}
            onPress={() => router.push({ pathname: '/(app)/auctionDetail', params: { auctionId: item.id } })}
        >
            <View style={styles.row}>
                <Text style={styles.domainName}>{item.domain_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>{hasBids ? 'Current Bid:' : 'Starts at:'}</Text>
                <Text style={styles.value}>${parseFloat(displayPrice || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Time Left:</Text>
                <Text style={styles.value}>{formatTimeRemaining(item.end_time)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const MyAuctionsPage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        setError('');
        try {
            const data = await getMySellingAuctions();
            setAuctions(data || []);
        } catch (err) {
            setError(err.message || "Could not load your auctions.");
        } finally {
            if (!isRefresh) setLoading(false);
            else setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    if (loading) {
        return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {error && !auctions.length ? (
                <View style={globalStyles.centeredContainer}>
                    <Text style={globalStyles.errorText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={auctions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <AuctionItem item={item} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <View style={globalStyles.centeredContainer}>
                            <Ionicons name="hammer-outline" size={80} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>You haven't created any auctions.</Text>
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
});

export default MyAuctionsPage;