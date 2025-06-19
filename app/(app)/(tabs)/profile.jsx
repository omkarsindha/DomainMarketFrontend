import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../_layout';

import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES } from '../../../src/constants/dimensions';
import { globalStyles } from '../../../src/styles/globalStyles';
import { Ionicons } from '@expo/vector-icons';

const ProfilePage = () => {
  const router = useRouter();
  const { logout: contextLogout, userToken } = useAuth();

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

  const user = {
    username: "CurrentUser",
    email: "user@example.com"
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={globalStyles.card}>
          <View style={styles.profileInfoRow}>
            <Ionicons name="person-circle-outline" size={SPACING.xxl + SPACING.lg} color={COLORS.primaryGreen} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.usernameText}>{user.username}</Text>
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          </View>
        </View>


        <Pressable
          style={({ pressed }) => [
            globalStyles.button,
            styles.logoutButton,
            pressed && { backgroundColor: COLORS.error } // Darken on press
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={FONT_SIZES.lg} color={COLORS.textOnPrimaryGreen} style={{ marginRight: SPACING.sm }} />
          <Text style={globalStyles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  headerContainer: { paddingHorizontal: SPACING.md, paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md, paddingBottom: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: FONT_SIZES.header, fontWeight: 'bold', color: COLORS.primaryGreen },
  contentContainer: { flex: 1, padding: SPACING.md },
  profileInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  profileTextContainer: { marginLeft: SPACING.md },
  usernameText: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPrimary },
  emailText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemText: { flex: 1, marginLeft: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  logoutButton: { marginTop: SPACING.xl, backgroundColor: COLORS.error, borderColor: COLORS.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default ProfilePage;