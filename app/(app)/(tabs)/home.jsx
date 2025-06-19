import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { fetchTrendingDomains } from '../../../src/services/domainService';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES, SCREEN_HEIGHT } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';


const HomePage = () => {
  const router = useRouter();

  const [trendingDomains, setTrendingDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTrendingDomains = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchTrendingDomains();
      setTrendingDomains(data || []);
    } catch (error) {
      console.error("Fetch Trending Domains Error:", error);
      setErrorMessage(error.message || 'Could not load trending domains.');
      setTrendingDomains([]);
    } finally {
      if (!isRefresh) setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrendingDomains();
      return () => {
        // Optional: Cleanup if needed when screen goes out of focus
      };
    }, [loadTrendingDomains]) // loadTrendingDomains is now a dependency
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTrendingDomains(true);
  };

  const handleDomainPress = (domainItem) => {
    router.push({
      pathname: '/(app)/domainBuy',
      params: { domain: JSON.stringify(domainItem) }
    });
  };

  const renderDomainItem = ({ item }) => (
    <TouchableOpacity
      style={styles.domainItemContainer}
      onPress={() => handleDomainPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.domainInfo}>
        <Text style={styles.domainNameText} numberOfLines={1} ellipsizeMode="tail">{item.domain}</Text>
        <Text style={styles.domainAvailabilityText}>
          {/* Adjust based on actual data, e.g., item.is_available ? 'Available' : 'Unavailable' */}
          {item.is_available !== undefined ? (item.is_available ? 'Available' : 'Taken') : 'Check Availability'}
        </Text>
      </View>
      <View style={styles.priceInfo}>
        {/* Handle potentially nested price object */}
        <Text style={styles.domainPriceText}>
          ${(item.price?.price ?? item.price ?? 0).toFixed(2)}
        </Text>
        <Text style={styles.domainDurationText}>
          Min. {item.price?.min_duration ?? item.min_duration ?? '1'} {item.price?.duration_type ?? item.duration_type ?? 'Year'}
        </Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
    </TouchableOpacity>
  );

  if (loading && trendingDomains.length === 0) { // Show loader only if no data yet
    return (
      <SafeAreaView style={[globalStyles.centeredContainer, { backgroundColor: COLORS.darkBg }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Loading Domains...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Trending Domains</Text>
      </View>

      {errorMessage && trendingDomains.length === 0 ? ( // Show error only if no data
        <View style={[globalStyles.centeredContainer, styles.errorStateContainer]}>
          <Ionicons name="cloud-offline-outline" size={ICON_SIZES.xl * 2} color={COLORS.textSecondary} />
          <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>{errorMessage}</Text>
          <TouchableOpacity style={[globalStyles.button, styles.retryButton]} onPress={() => loadTrendingDomains()}>
            <Text style={globalStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trendingDomains}
          renderItem={renderDomainItem}
          keyExtractor={(item, index) => item.domain_id || item.domain || `domain-${index}`}
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
              <Text style={styles.emptyListText}>No trending domains found.</Text>
              <Text style={styles.emptyListSubText}>Check back later or try refreshing.</Text>
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
  domainItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, backgroundColor: COLORS.mediumBg, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, minHeight: 70 },
  domainInfo: { flex: 1, marginRight: SPACING.sm },
  domainNameText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  domainAvailabilityText: { fontSize: FONT_SIZES.xs, color: COLORS.primaryGreen },
  priceInfo: { alignItems: 'flex-end', marginRight: SPACING.sm },
  domainPriceText: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.primaryGreen },
  domainDurationText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  retryButton: { marginTop: SPACING.lg, paddingHorizontal: SPACING.xl },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl, marginTop: SCREEN_HEIGHT * 0.15 },
  emptyListText: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginTop: SPACING.md, textAlign: 'center' },
  emptyListSubText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
});

export default HomePage;