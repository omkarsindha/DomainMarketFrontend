import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../../src/context/FavoritesContext';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES, SCREEN_HEIGHT } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';


const FavoritesPage = () => {
  const router = useRouter();
  const { favorites, toggleFavorite, isLoadingFavorites } = useFavorites();

  const handleDomainPress = (item) => {
    router.push({
      pathname: '/(app)/domainBuy',
      params: { domain: JSON.stringify(item) }
    });
  };

  const confirmRemoveFavorite = (item) => {
    Alert.alert(
      "Remove Favorite",
      `Are you sure you want to remove "${item.domain}" from favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => toggleFavorite(item)
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItemContainer}
      onPress={() => handleDomainPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.domainInfo}>
        <Text style={styles.domainNameText} numberOfLines={1}>{item.domain}</Text>
        <Text style={styles.domainPriceText}>
          ${(item.price?.price ?? item.price ?? 0).toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => confirmRemoveFavorite(item)} style={styles.heartButton}>
        <Ionicons name="heart-dislike-outline" size={ICON_SIZES.lg} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );


  if (isLoadingFavorites) {
    return (
      <SafeAreaView style={[globalStyles.centeredContainer, { backgroundColor: COLORS.darkBg }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={SCREEN_HEIGHT * 0.1} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No favorites yet!</Text>
          <Text style={styles.emptySubText}>You can add domains from the Search tab.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.domain_id || item.domain}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  headerContainer: { paddingHorizontal: SPACING.md, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md, paddingBottom: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONT_SIZES.header, fontWeight: 'bold', color: COLORS.primaryGreen },
  listContentContainer: { padding: SPACING.md },
  favoriteItemContainer: { ...globalStyles.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.mediumBg, marginBottom: SPACING.sm, paddingVertical: SPACING.md },
  domainInfo: { flex: 1, marginRight: SPACING.sm },
  domainNameText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  domainPriceText: { fontSize: FONT_SIZES.sm, color: COLORS.primaryGreen },
  heartButton: { padding: SPACING.sm },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  emptyText: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginTop: SPACING.md, textAlign: 'center' },
  emptySubText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'center' },
});

export default FavoritesPage;