import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, ScrollView, ActivityIndicator, Alert, SafeAreaView, Keyboard, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { checkDomainAvailability, fetchTrendingDomains } from '../../../src/services/domainService';
import { getToken }
  from '../../../src/services/authService';
import { useAuth } from '../../_layout';
import { useFavorites } from '../../../src/context/FavoritesContext';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES, SCREEN_HEIGHT } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';

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
  const [trendingDomains, setTrendingDomains] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
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

  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        if (searchQuery.trim() === '' && !searchedDomainResult) {
          setLoadingTrending(true);
          setError(null);
          try {
            const token = await getToken();
            if (!token) {
              handleAuthenticationError();
              return;
            }
            const trendingData = await fetchTrendingDomains();
            setTrendingDomains(trendingData || []);
          } catch (err) {
            console.error("Error fetching trending domains:", err);
            if (err.message.includes("Unauthorized") || err.message.includes("401")) {
              handleAuthenticationError();
            } else {
              setError("Failed to fetch trending domains.");
            }
          } finally {
            setLoadingTrending(false);
          }
        }
      };
      fetchInitialData();
    }, [handleAuthenticationError, searchQuery, searchedDomainResult])
  );


  const handleSearchDomain = async () => {
    Keyboard.dismiss();
    if (!searchQuery.trim()) {
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
      const data = await checkDomainAvailability(searchQuery.trim().toLowerCase());
      if (data.domain) {
        setSearchedDomainResult(data.domain);
        if (!data.domain.is_available) {
          setError(`"${data.domain.domain}" is unavailable. Check suggestions below.`);
        }
      } else {
        setError(`Could not get details for "${searchQuery}".`);
      }
      setSuggestedDomains(data.suggestions || []);
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

  const renderResults = () => {
    if (!loadingSearch && !searchedDomainResult && suggestedDomains.length === 0 && !error && !searchQuery.trim()) {
      if (loadingTrending) return <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{ marginTop: SPACING.xl }} />;
      if (trendingDomains.length > 0) {
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Trending Domains</Text>
            <FlatList
              data={trendingDomains}
              keyExtractor={(item, index) => item.domain || `trending-${index}`}
              renderItem={({ item }) => (
                <DomainCard
                  item={item}
                  onPress={handleDomainSelect}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={isDomainFavoriteGlobally(item.domain)}
                />
              )}
            />
          </View>
        );
      }
      return <Text style={styles.infoText}>Start by searching for a domain.</Text>;
    }

    if (loadingSearch) return <ActivityIndicator size="large" color={COLORS.primaryGreen} style={{ marginTop: SPACING.xl }} />;

    return (
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
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <FlatList
              data={suggestedDomains}
              keyExtractor={(item, index) => item.domain || `suggestion-${index}`}
              renderItem={({ item }) => (
                <DomainCard
                  item={item}
                  onPress={handleDomainSelect}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={isDomainFavoriteGlobally(item.domain)}
                />
              )}
            />
          </View>
        )}
        {!searchedDomainResult && suggestedDomains.length === 0 && error && !error.includes("unavailable") && (
          <Text style={styles.infoText}>No suggestions found for this search.</Text>
        )}
      </>
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
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchDomain} disabled={loadingSearch || loadingTrending}>
            {loadingSearch ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} size="small" /> : <Ionicons name="search" size={ICON_SIZES.lg} color={COLORS.textOnPrimaryGreen} />}
          </TouchableOpacity>
        </View>

        {error && !loadingSearch && (
          <View style={styles.errorDisplayContainer}>
            <Ionicons name="warning-outline" size={ICON_SIZES.md} color={COLORS.error} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.errorTextMsg}>{error}</Text>
          </View>
        )}

        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={styles.resultsScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderResults()}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  gradientBg: { flex: 1 },
  searchBarContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: Platform.OS === 'ios' ? SPACING.sm + 2 : SPACING.sm, fontSize: FONT_SIZES.md, backgroundColor: COLORS.darkBg, color: COLORS.textPrimary, marginRight: SPACING.sm, height: 48 /* Consistent height */ },
  searchButton: { backgroundColor: COLORS.primaryGreen, padding: SPACING.sm + 2, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center', height: 48, width: 48 },
  errorDisplayContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBackground, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: BORDER_RADIUS.sm, borderLeftWidth: 3, borderLeftColor: COLORS.errorBorder },
  errorTextMsg: { color: COLORS.error, fontSize: FONT_SIZES.sm, flex: 1 },
  resultsScroll: { flex: 1 },
  resultsScrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
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
  tldContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xs },
  tldChip: { backgroundColor: COLORS.mediumBg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.primaryGreen },
  tldText: { color: COLORS.primaryGreen, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  infoText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: FONT_SIZES.md, marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
});

export default SearchPage;