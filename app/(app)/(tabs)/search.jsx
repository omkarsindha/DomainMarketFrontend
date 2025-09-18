import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, ScrollView, ActivityIndicator, Alert, SafeAreaView, Keyboard, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { checkDomainAvailability, fetchTrendingTldsService } from '../../../src/services/domainService';
import { getToken }
  from '../../../src/services/authService';
import { useAuth } from '../../_layout';
import { useFavorites } from '../../../src/context/FavoritesContext';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES, SCREEN_HEIGHT } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';

const TldCard = ({ tld }) => (
  <View style={[globalStyles.card, styles.domainCardBase]}>
    <Text style={styles.domainCardName}>{tld}</Text>
  </View>
);

const DomainCard = ({ item, onPress, onToggleFavorite, isFavorite }) => (
  <Pressable
    style={({ pressed }) => [globalStyles.card, styles.domainCardBase, pressed && { backgroundColor: COLORS.lightBg }]}
    onPress={() => onPress && onPress(item)}
  >
    <View style={styles.domainCardHeader}>
      <Text style={styles.domainCardName} numberOfLines={1}>{item.domain}</Text>
      <TouchableOpacity onPress={() => onToggleFavorite && onToggleFavorite(item)} style={styles.heartIconTouchable}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={ICON_SIZES.lg} color={isFavorite ? COLORS.error : COLORS.primaryGreen} />
      </TouchableOpacity>
    </View>
    <View style={styles.domainCardBody}>
      <Text style={styles.domainCardPrice}>${(item.price?.price ?? item.price ?? 0).toFixed(2)}</Text>
      <Text style={styles.domainCardDuration}>Min. {item.price?.min_duration ?? item.min_duration ?? '1'} {item.price?.duration_type ?? item.duration_type ?? 'Year'}</Text>
    </View>
    {item.is_available !== undefined && (
      <Text style={[styles.availabilityText, item.is_available ? styles.available : styles.unavailable]}>
        {item.is_available ? 'Available' : 'Unavailable'}
      </Text>
    )}
  </Pressable>
);


const SearchPage = () => {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();
  const { favorites, toggleFavorite, isFavorite: isDomainFavoriteGlobally, isLoadingFavorites } = useFavorites();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchedDomainResult, setSearchedDomainResult] = useState(null);
  const [suggestedDomains, setSuggestedDomains] = useState([]);
  const [trendingTlds, setTrendingTlds] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingTlds, setLoadingTlds] = useState(true);
  const [error, setError] = useState(null);

  const handleAuthenticationError = useCallback(async () => {
    Alert.alert(
      "Session Expired",
      "Your session has expired. Please login again.",
      [{
        text: "Login", onPress: async () => {
          await contextLogout();
        }
      }]
    );
  }, [contextLogout]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingTlds(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          handleAuthenticationError();
          return;
        }
        const tldsData = await fetchTrendingTldsService();
        setTrendingTlds(tldsData || []);
      } catch (err) {
        console.error("Error fetching trending TLDs:", err);
        if (err.message.includes("Unauthorized") || err.message.includes("401")) {
          handleAuthenticationError();
        } else {
          setError("Failed to fetch trending TLDs.");
        }
      } finally {
        setLoadingTlds(false);
      }
    };
    fetchInitialData();
  }, [handleAuthenticationError]);

  const handleSearchDomain = async () => {
    Keyboard.dismiss();
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      setError("Please enter a domain name.");
      return;
    }
    setLoadingSearch(true);
    setError(null);
    setSearchedDomainResult(null);
    setSuggestedDomains([]);
    try {
      const token = await getToken();
      if (!token) {
        handleAuthenticationError();
        return;
      }
      const data = await checkDomainAvailability(trimmedQuery);
      setSuggestedDomains(data.suggestions || []);

      if (data.domain) {
        setSearchedDomainResult({ ...data.domain, is_available: true });
      } else {
        if (data.suggestions && data.suggestions.length > 0) {
          setError(`"${trimmedQuery}" is unavailable. Check suggestions below.`);
        } else {
          setError(`Could not get details for "${trimmedQuery}".`);
        }
      }
    } catch (err) {
      console.error("Error searching domain:", err);
      if (err.message.includes("Unauthorized") || err.message.includes("401")) {
        handleAuthenticationError();
      } else {
        setError(err.message || "Failed to fetch domain data.");
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDomainSelect = (domainItem) => {
    router.push({
      pathname: '/(app)/domainBuy',
      params: { domain: JSON.stringify(domainItem) }
    });
  };

  // This component renders the initial state (TLD list)
  const renderInitialView = () => {
    if (loadingTlds) {
      return <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{ marginTop: SPACING.xl }} />;
    }
    if (trendingTlds.length > 0) {
      const tldCards = [];
      const loopCount = Math.min(trendingTlds.length, 10);
      for (let i = 0; i < loopCount; i++) {
        const tldItem = trendingTlds[i];
        tldCards.push(<TldCard key={tldItem} tld={tldItem} />);
      }
      return (
        // Use a ScrollView here, as it's safe (no nested lists)
        <ScrollView contentContainerStyle={styles.resultsScrollContent}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Top 10 Popular TLDs</Text>
            {tldCards}
          </View>
        </ScrollView>
      );
    }
    return <Text style={styles.infoText}>Start by searching for a domain or selecting a TLD.</Text>;
  }

  // This component renders everything that appears *above* the suggestions list.
  const renderListHeader = () => (
    <>
      {searchedDomainResult && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Direct Match</Text>
          <DomainCard
            item={searchedDomainResult}
            onPress={handleDomainSelect}
            onToggleFavorite={toggleFavorite}
            isFavorite={isDomainFavoriteGlobally(searchedDomainResult.domain)}
          />
        </View>
      )}
      {suggestedDomains.length > 0 && (
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Suggestions</Text>
      )}
    </>
  );

  const renderContent = () => {
    const hasSearchResults = searchedDomainResult || suggestedDomains.length > 0;

    if (loadingSearch) {
      return <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{ marginTop: SPACING.xl }} />;
    }

    if (!hasSearchResults) {
      // If there are no search results, show the initial view or "no results" text
      return renderInitialView();
    }

    // If we have results, use a FlatList as the main scroll container
    return (
      <FlatList
        data={suggestedDomains}
        keyExtractor={(item) => item.domain}
        renderItem={({ item }) => (
          <DomainCard
            item={item}
            onPress={handleDomainSelect}
            onToggleFavorite={toggleFavorite}
            isFavorite={isDomainFavoriteGlobally(item.domain)}
          />
        )}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={styles.resultsScrollContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[COLORS.darkBg, COLORS.mediumBg]} style={styles.gradientBg}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="e.g., mydomain.com"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchDomain}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchDomain} disabled={loadingSearch || loadingTlds}>
            {loadingSearch ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} size="small" /> : <Ionicons name="search" size={ICON_SIZES.lg} color={COLORS.textOnPrimaryGreen} />}
          </TouchableOpacity>
        </View>

        {error && !loadingSearch && (
          <View style={styles.errorDisplayContainer}>
            <Ionicons name="warning-outline" size={ICON_SIZES.md} color={COLORS.error} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.errorTextMsg}>{error}</Text>
          </View>
        )}

        {/* The main content area now uses conditional rendering to avoid nesting scroll views */}
        <View style={styles.resultsContainer}>
          {renderContent()}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  gradientBg: { flex: 1 },
  searchBarContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: Platform.OS === 'ios' ? SPACING.sm + 2 : SPACING.sm, fontSize: FONT_SIZES.md, backgroundColor: COLORS.darkBg, color: COLORS.textPrimary, marginRight: SPACING.sm, height: 48 },
  searchButton: { backgroundColor: COLORS.primaryGreen, padding: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center', height: 48, width: 48 },
  errorDisplayContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBackground, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: BORDER_RADIUS.sm, borderLeftWidth: 3, borderLeftColor: COLORS.errorBorder },
  errorTextMsg: { color: COLORS.error, fontSize: FONT_SIZES.sm, flex: 1 },
  // New container style to manage the results area
  resultsContainer: {
    flex: 1,
  },
  resultsScrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, paddingTop: SPACING.sm },
  sectionContainer: { marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: "bold", color: COLORS.primaryGreen, marginBottom: SPACING.sm },
  domainCardBase: { marginBottom: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.mediumBg },
  domainCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.xs },
  domainCardName: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.textPrimary, flex: 1, marginRight: SPACING.sm },
  heartIconTouchable: { padding: SPACING.xs },
  domainCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xs },
  domainCardPrice: { fontSize: FONT_SIZES.sm, color: COLORS.primaryGreen, fontWeight: 'bold' },
  domainCardDuration: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  availabilityText: { fontSize: FONT_SIZES.xs, fontWeight: '600', marginTop: SPACING.sm, textAlign: 'right' },
  available: { color: COLORS.primaryGreenDark },
  unavailable: { color: COLORS.error },
  infoText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: FONT_SIZES.md, marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
});

export default SearchPage;