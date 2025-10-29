import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getActiveAuctions } from '../../../src/services/auctionService';
import { getActiveListings, purchaseListing } from '../../../src/services/listingService';
import { formatTimeRemaining } from '../../../src/utils/timeUtils';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';

const MarketplacePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Auctions');
  const [auctions, setAuctions] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'Auctions') {
        const data = await getActiveAuctions();
        setAuctions(data || []);
      } else {
        const data = await getActiveListings();
        setListings(data || []);
      }
    } catch (err) {
      console.error('Marketplace load error:', err);
      setError(err.message || 'Could not load marketplace data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const AuctionItem = ({ item }) => {
    const hasBids = item.bids && item.bids.length > 0;
    const displayPrice = hasBids ? (item.current_price || item.start_price) : item.start_price;

    return (
      <TouchableOpacity
        style={globalStyles.card}
        onPress={() => router.push({ pathname: '/(app)/auctionDetail', params: { auctionId: item.id } })}
      >
        <Text style={styles.domainName}>{item.domain_name}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{hasBids ? 'Highest Bid:' : 'Starting Price:'}</Text>
          <Text style={styles.value}>${parseFloat(displayPrice || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time Left:</Text>
          <Text style={styles.value}>{formatTimeRemaining(item.end_time)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListingItem = ({ item }) => {
    const priceNum = Number(item.price || 0);

    const handleBuy = () => {
      Alert.alert(
        'Confirm Purchase',
        `Buy ${item.domain_name} for $${priceNum.toFixed(2)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Buy',
            onPress: async () => {
              try {
                setLoading(true);
                await purchaseListing(item.id);
                Alert.alert('Success', `You purchased ${item.domain_name}.`);
                loadData();
              } catch (err) {
                console.error('Purchase error:', err);
                const message = err?.message || 'Purchase failed.';
                if (message.toLowerCase().includes('card')) {
                  Alert.alert(
                    'Payment Method Required',
                    message,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Add Card', onPress: () => router.push('/(app)/addPaymentMethod') }
                    ]
                  );
                } else {
                  Alert.alert('Error', message);
                }
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    };

    return (
      <View style={globalStyles.card}>
        <Text style={styles.domainName}>{item.domain_name}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>${priceNum.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Seller:</Text>
          <Text style={styles.value}>{item.seller_username || '—'}</Text>
        </View>
        <TouchableOpacity style={[globalStyles.button, { marginTop: SPACING.md }]} onPress={handleBuy}>
          <Text style={globalStyles.buttonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{ marginTop: SPACING.lg }} />;
    if (error) return <Text style={[globalStyles.errorText, { marginTop: SPACING.lg }]}>{error}</Text>;

    if (activeTab === 'Auctions') {
      return (
        <FlatList
          data={auctions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AuctionItem item={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No active auctions found.</Text>}
          contentContainerStyle={styles.listContent}
        />
      );
    } else {
      return (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ListingItem item={item} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No listings found.</Text>}
          contentContainerStyle={styles.listContent}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Auctions' && styles.activeTab]} onPress={() => setActiveTab('Auctions')}>
          <Ionicons name="hammer-outline" size={ICON_SIZES.md} color={activeTab === 'Auctions' ? COLORS.primaryGreen : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'Auctions' && styles.activeTabText]}>Auctions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Bazaar' && styles.activeTab]} onPress={() => setActiveTab('Bazaar')}>
          <Ionicons name="storefront-outline" size={ICON_SIZES.md} color={activeTab === 'Bazaar' ? COLORS.primaryGreen : COLORS.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'Bazaar' && styles.activeTabText]}>Bazaar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(activeTab === 'Auctions' ? '/(app)/createAuction' : '/(app)/createListing')}
      >
        <Ionicons name="add" size={ICON_SIZES.xl} color={COLORS.textOnPrimaryGreen} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.mediumBg,
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
  content: { flex: 1, padding: SPACING.md },
  listContent: { paddingBottom: 80 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xl },
  domainName: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  value: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primaryGreen,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

export default MarketplacePage;
