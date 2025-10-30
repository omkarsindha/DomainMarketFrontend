import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Alert, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../_layout';


import { fetchUser } from '../../../src/services/userService';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const ProfilePage = () => {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();

  const [user, setUser] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const loadUserDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserDetails();
    }, [loadUserDetails])
  );


  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await contextLogout();
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={globalStyles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={globalStyles.centeredContainer}>
          <Text style={globalStyles.errorText}>{error}</Text>
          <Pressable style={globalStyles.button} onPress={loadUserDetails}>
            <Text style={globalStyles.buttonText}>Try Again</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              globalStyles.button,
              styles.logoutButton,
              { marginTop: SPACING.md },
              pressed && { backgroundColor: COLORS.error }
            ]}
            onPress={handleLogout}
          >
            <Text style={globalStyles.buttonText}>Logout</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <ScrollView style={styles.contentContainer}>
        <View style={globalStyles.card}>
          <View style={styles.profileInfoRow}>
            <Ionicons name="person-circle-outline" size={SPACING.xxl + SPACING.lg} color={COLORS.primaryGreen} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.usernameText}>{user.username}</Text>
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              globalStyles.button,
              styles.logoutButton,
              pressed && { backgroundColor: COLORS.error }
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={FONT_SIZES.lg} color={COLORS.textOnPrimaryGreen} style={{ marginRight: SPACING.sm }} />
            <Text style={globalStyles.buttonText}>Logout</Text>
          </Pressable>

          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/editProfile')}>
            <Ionicons name="create-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Edit User Details</Text>
            <Ionicons name="chevron-forward-outline" size={ICON_SIZES.lg} color={COLORS.textSecondary} />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/addPaymentMethod')}>
            <Ionicons name="card-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Manage Payment</Text>
            <Ionicons name="chevron-forward-outline" size={ICON_SIZES.lg} color={COLORS.textSecondary} />
          </Pressable>

          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/myAuctions')}>
            <Ionicons name="hammer-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>My Auctions</Text>
            <Ionicons name="chevron-forward-outline" size={ICON_SIZES.lg} color={COLORS.textSecondary} />
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/myListings')}>
            <Ionicons name="pricetags-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>My Listings</Text>
            <Ionicons name="chevron-forward-outline" size={ICON_SIZES.lg} color={COLORS.textSecondary} />
          </Pressable>

          <View style={styles.divider} />
          <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/transactions')}>
            <Ionicons name="receipt-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Transaction History</Text>
            <Ionicons name="chevron-forward-outline" size={ICON_SIZES.lg} color={COLORS.textSecondary} />
          </Pressable>

        </View>


      </ScrollView >
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  headerContainer: { paddingHorizontal: SPACING.md, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md, paddingBottom: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONT_SIZES.header, fontWeight: 'bold', color: COLORS.primaryGreen },
  contentContainer: { flex: 1, padding: SPACING.md },
  profileInfoRow: { flexDirection: 'row', alignItems: 'center' },
  profileTextContainer: { marginLeft: SPACING.md, flex: 1 },
  usernameText: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPrimary },
  emailText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  menuIcon: { marginRight: SPACING.md },
  menuItemText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  logoutButton: { marginTop: SPACING.xl, backgroundColor: COLORS.error, borderColor: COLORS.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default ProfilePage;