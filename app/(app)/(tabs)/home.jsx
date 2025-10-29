import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { fetchMyDomains } from '../../../src/services/domainService';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES, SCREEN_HEIGHT } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';
import { useRouter } from 'expo-router';


const HomePage = () => {
  const router = useRouter();
  const [myDomains, setMyDomains] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMyDomains = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchMyDomains();
      setMyDomains(data || []);
    } catch (error) {
      console.error("Fetch My Domains Error:", error);
      setErrorMessage(error.message || 'Could not load your domains.');
      setMyDomains([]);
    } finally {
      if (!isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyDomains();
    }, [loadMyDomains])
  );

  useEffect(() => {
    if (myDomains.length > 0) {
      const totalValue = myDomains.reduce((sum, domain) => {
        return sum + (Number(domain.price) || 0);
      }, 0);
      setPortfolioValue(totalValue);
    } else {
      setPortfolioValue(0);
    }
  }, [myDomains]);


  const onRefresh = () => {
    setRefreshing(true);
    loadMyDomains(true);
  };

  const renderDomainItem = ({ item }) => (
    <TouchableOpacity
      style={styles.domainItemContainer}
      onPress={() => router.push({
        pathname: '/(app)/domainManagement',
        params: { domainName: item.domain_name }
      })}
    >
      <View style={styles.domainInfo}>
        <Text style={styles.domainNameText} numberOfLines={1}>{item.domain_name}</Text>
        <Text style={styles.domainDateText}>
          Expires on: {new Date(item.expiry_date).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.domainPriceText}>
          ${(Number(item.price) || 0).toFixed(2)}
        </Text>
        <Ionicons name="chevron-forward" size={ICON_SIZES.md} color={COLORS.textSecondary} style={{ marginTop: SPACING.xs }} />
      </View>
    </TouchableOpacity>
  );

  const renderPortfolioHeader = () => (
    <View style={styles.portfolioCard}>
      <Text style={styles.portfolioLabel}>Portfolio Value</Text>
      <Text style={styles.portfolioValue}>${portfolioValue.toFixed(2)}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[globalStyles.centeredContainer, { backgroundColor: COLORS.darkBg }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Loading Your Portfolio...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Portfolio</Text>
      </View>

      {errorMessage && myDomains.length === 0 ? (
        <View style={[globalStyles.centeredContainer, styles.errorStateContainer]}>
          <Ionicons name="cloud-offline-outline" size={ICON_SIZES.xl * 2} color={COLORS.textSecondary} />
          <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>{errorMessage}</Text>
          <TouchableOpacity style={[globalStyles.button, styles.retryButton]} onPress={() => loadMyDomains()}>
            <Text style={globalStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myDomains}
          renderItem={renderDomainItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderPortfolioHeader}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primaryGreen]}
              tintColor={COLORS.primaryGreen}
            />
          }
          ListEmptyComponent={!loading && !errorMessage ? (
            <View style={styles.emptyListContainer}>
              <Ionicons name="file-tray-outline" size={ICON_SIZES.xl * 2} color={COLORS.textSecondary} />
              <Text style={styles.emptyListText}>No Domains Yet</Text>
              <Text style={styles.emptyListSubText}>Domains you register will appear here.</Text>
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  headerContainer: { paddingHorizontal: SPACING.md, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md, paddingBottom: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONT_SIZES.header, fontWeight: 'bold', color: COLORS.primaryGreen },
  loadingText: { marginTop: SPACING.sm, fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  errorStateContainer: { padding: SPACING.lg },
  listContentContainer: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.xxl },
  portfolioCard: { backgroundColor: COLORS.mediumBg, borderRadius: BORDER_RADIUS.md, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.primaryGreenDark },
  portfolioLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  portfolioValue: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primaryGreen },
  domainItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.mediumBg,
    borderRadius: BORDER_RADIUS.md
  },
  domainInfo: { flex: 1, marginRight: SPACING.sm },
  domainNameText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  domainDateText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  priceInfo: { alignItems: 'flex-end' },
  domainPriceText: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.primaryGreen },
  retryButton: { marginTop: SPACING.lg, paddingHorizontal: SPACING.xl },
  emptyListContainer: { justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, marginTop: SCREEN_HEIGHT * 0.1 },
  emptyListText: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginTop: SPACING.md, textAlign: 'center' },
  emptyListSubText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
});

export default HomePage;