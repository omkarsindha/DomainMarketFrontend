import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getAuctionDetails, placeBid } from '../../src/services/auctionService';
import { fetchUser } from '../../src/services/userService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';
import { useRouter } from 'expo-router';
import { formatBidTimestamp } from '../../src/utils/timeUtils';

const AuctionDetailPage = () => {
    const { auctionId } = useLocalSearchParams();
    const [auction, setAuction] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const router = useRouter();
    useFocusEffect(
        useCallback(() => {
            async function loadData() {
                setLoading(true);
                setError('');
                try {
                    const [auctionData, userData] = await Promise.all([
                        getAuctionDetails(auctionId),
                        fetchUser()
                    ]);
                    setAuction(auctionData);
                    setUser(userData);
                } catch (err) {
                    setError(err.message || "Could not load auction details.");
                } finally {
                    setLoading(false);
                }
            }
            loadData();
        }, [auctionId])
    );

    useEffect(() => {
        if (auction) {
            const basePrice = Math.max(auction.current_price || 0, auction.start_price || 0);
            const nextBid = basePrice + 1.00;
            setBidAmount(nextBid.toFixed(2));
        }
    }, [auction]);


    const handlePlaceBid = async () => {
        const basePrice = Math.max(auction.current_price || 0, auction.start_price || 0);
        if (!bidAmount || isNaN(parseFloat(bidAmount))) {
            Alert.alert("Invalid Bid", "Please enter a valid bid amount.");
            return;
        }
        const newBid = parseFloat(bidAmount);
        if (newBid <= basePrice) {
            Alert.alert("Invalid Bid", `Your bid must be higher than the current price of $${basePrice.toFixed(2)}.`);
            return;
        }
        setSubmitting(true);
        try {
            const updatedAuction = await placeBid(auctionId, newBid);
            setAuction(updatedAuction);
            Alert.alert("Success", "Your bid has been placed successfully.");
        } catch (err) {
            if (err.message && err.message.includes("Setup payment method not found")) {
                Alert.alert(
                    "Payment Method Required",
                    "A payment method is required to place a bid. Please add one now.",
                    [
                        {
                            text: "Ok",
                            onPress: () => router.push('/(app)/addPaymentMethod')
                        }
                    ]
                );
            } else {
                Alert.alert("Error", err.message || "Failed to place bid.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const BidItem = ({ item }) => (
        <View style={styles.bidItem}>
            <View style={styles.bidderContainer}>
                <Text style={styles.bidder}>{item.bidder_username === user?.username ? "You" : item.bidder_username}</Text>
                <Text style={styles.bidTime}>{formatBidTimestamp(item.created_at)}</Text>
            </View>
            <Text style={styles.bidAmount}>${parseFloat(item.bid_amount).toFixed(2)}</Text>
        </View>
    );

    if (loading) return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
    if (error) return <View style={globalStyles.centeredContainer}><Text style={globalStyles.errorText}>{error}</Text></View>;
    if (!auction) return null;

    const hasBids = auction.bids && auction.bids.length > 0;
    const displayPrice = hasBids ? (auction.current_price || auction.start_price) : auction.start_price;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={globalStyles.card}>
                    <Text style={styles.domainName}>{auction.domain_name}</Text>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Seller:</Text><Text style={styles.detailValue}>{auction.seller_username}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Ends on:</Text><Text style={styles.detailValue}>{new Date(auction.end_time).toLocaleString()}</Text></View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={styles.priceLabel}>{hasBids ? "Highest Bid" : "Starting Price"}</Text>
                        <Text style={styles.priceValue}>${parseFloat(displayPrice || 0).toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.biddingContainer}>
                        <TextInput
                            style={styles.bidInput}
                            value={bidAmount}
                            onChangeText={setBidAmount}
                            keyboardType="numeric"
                            returnKeyType="done"
                            onSubmitEditing={handlePlaceBid}
                        />
                        <TouchableOpacity
                            style={[styles.bidButton, submitting && styles.bidButtonDisabled]}
                            onPress={handlePlaceBid}
                            disabled={submitting}
                        >
                            {submitting
                                ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} size="small" />
                                : <Text style={styles.bidButtonText}>Bid</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[globalStyles.card, styles.bidHistoryCard]}>
                    <Text style={styles.cardTitle}>Bid History</Text>
                    {hasBids ? (
                        auction.bids.map(bid => <BidItem key={bid.id} item={bid} />)
                    ) : (
                        <Text style={styles.emptyBidsText}>No bids yet. Be the first!</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    container: { padding: SPACING.md, paddingBottom: SPACING.xl },
    domainName: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primaryGreen, textAlign: 'center', marginBottom: SPACING.md },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    detailLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
    detailValue: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '600' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
    priceLabel: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, fontWeight: 'bold' },
    priceValue: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.primaryGreen },
    biddingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: SPACING.xs,
    },
    bidInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZES.lg,
        backgroundColor: COLORS.darkBg,
        color: COLORS.textPrimary,
        marginRight: SPACING.sm,
        height: 48,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bidButton: {
        backgroundColor: COLORS.primaryGreen,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
    },
    bidButtonDisabled: {
        backgroundColor: COLORS.disabled,
    },
    bidButtonText: {
        color: COLORS.textOnPrimaryGreen,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    cardTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.md },
    bidHistoryCard: { marginTop: SPACING.lg },
    bidItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    bidderContainer: { flex: 1, marginRight: SPACING.sm },
    bidder: { color: COLORS.textPrimary, fontSize: FONT_SIZES.md, fontWeight: '600' },
    bidTime: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
    bidAmount: { color: COLORS.primaryGreen, fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
    emptyBidsText: { color: COLORS.textSecondary, textAlign: 'center', padding: SPACING.md },
});

export default AuctionDetailPage;