import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getActiveAuctions } from '../../../src/services/auctionService';
import { formatTimeRemaining } from '../../../src/utils/timeUtils'; // Import the new utility
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';

const MarketplacePage = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Auctions');
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadAuctions = useCallback(async () => {
        if (activeTab !== 'Auctions') return;
        setLoading(true);
        setError('');
        try {
            const data = await getActiveAuctions();
            setAuctions(data);
        } catch (err) {
            console.error("Failed to fetch auctions:", err);
            setError(err.message || "Could not load auctions.");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useFocusEffect(useCallback(() => {
        loadAuctions();
    }, [loadAuctions]));

    const AuctionItem = ({ item }) => {
        const hasBids = item.bids && item.bids.length > 0;
        const displayPrice = hasBids ? (item.current_price || item.start_price) : item.start_price;

        return (
            <TouchableOpacity style={globalStyles.card} onPress={() => router.push({ pathname: '/(app)/auctionDetail', params: { auctionId: item.id } })}>
                <Text style={styles.auctionDomain}>{item.domain_name}</Text>

                <View style={styles.auctionRow}>
                    <Text style={styles.auctionLabel}>{hasBids ? "Highest Bid:" : "Starting Price:"}</Text>
                    <Text style={styles.auctionValue}>${parseFloat(displayPrice || 0).toFixed(2)}</Text>
                </View>

                <View style={styles.auctionRow}>
                    <Text style={styles.auctionLabel}>Time Left:</Text>
                    <Text style={styles.auctionValue}>{formatTimeRemaining(item.end_time)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderAuctionsContent = () => {
        if (loading) return <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{ marginTop: SPACING.xl }} />;
        if (error) return <Text style={[globalStyles.errorText, { marginTop: SPACING.lg }]}>{error}</Text>;
        return (
            <FlatList
                data={auctions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <AuctionItem item={item} />}
                ListEmptyComponent={<View style={globalStyles.centeredContainer}><Text style={styles.emptyText}>No active auctions found.</Text></View>}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
        );
    };

    const renderBazaarContent = () => (
        <View style={globalStyles.centeredContainer}>
            <Ionicons name="storefront-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Bazaar Coming Soon!</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'Auctions' && styles.activeTab]} onPress={() => setActiveTab('Auctions')}>
                    <Ionicons name="hammer-outline" size={ICON_SIZES.md} color={activeTab === 'Auctions' ? COLORS.primaryGreen : COLORS.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'Auctions' && styles.activeTabText]}>Auctions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Bazaar' && styles.activeTab]} onPress={() => setActiveTab('Bazaar')}>
                    <Ionicons name="storefront-outline" size={ICON_SIZES.md} color={activeTab === 'Bazaar' ? COLORS.primaryGreen : COLORS.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'Bazaar' && styles.activeTabText]}>Bazaar</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
                {activeTab === 'Auctions' ? renderAuctionsContent() : renderBazaarContent()}
            </View>
            <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/createAuction')}>
                <Ionicons name="add" size={ICON_SIZES.xl} color={COLORS.textOnPrimaryGreen} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.mediumBg,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    activeTab: { borderBottomColor: COLORS.primaryGreen },
    tabText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, fontWeight: '600' },
    activeTabText: { color: COLORS.primaryGreen },
    contentContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
    fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.lg, backgroundColor: COLORS.primaryGreen, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
    emptyText: { color: COLORS.textPrimary, textAlign: 'center', marginTop: SPACING.xl },
    auctionDomain: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.sm },
    auctionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
    auctionLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
    auctionValue: { color: COLORS.textPrimary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
});


export default MarketplacePage;