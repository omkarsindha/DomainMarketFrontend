// app/(app)/auction.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';
import { fetchMyDomains, fetchActiveAuctions, listDomainForAuction, placeBid } from '../../src/services/auctionService';

const AuctionPage = () => {
  const [myDomains, setMyDomains] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [domains, activeAuctions] = await Promise.all([
          fetchMyDomains(),
          fetchActiveAuctions()
        ]);
        setMyDomains(domains || []);
        setAuctions(activeAuctions || []);
      } catch (err) {
        console.error("Auction load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {myDomains.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>List Your Domains for Auction</Text>
          <FlatList
            data={myDomains}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.domainCard}
                onPress={() => listDomainForAuction(item)}
              >
                <Text style={styles.domainName}>{item.domain_name}</Text>
                <Ionicons name="hammer-outline" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Active Auctions</Text>
          <FlatList
            data={auctions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.domainCard}
                onPress={() => placeBid(item)}
              >
                <Text style={styles.domainName}>{item.domain}</Text>
                <Text style={styles.price}>Current Bid: ${item.current_bid}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg, padding: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.md },
  domainCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.mediumBg, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm },
  domainName: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  price: { fontSize: FONT_SIZES.sm, color: COLORS.primaryGreen }
});

export default AuctionPage;
