import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import { fetchUserDetails, updateUserDetails } from '../../src/services/userService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', width = '100%', error }) => (
  <View style={[styles.inputFieldContainer, { width }]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[globalStyles.input, styles.inputCustom, error && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textSecondary}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize="words"
    />
    {error && <Text style={styles.errorMessageText}>{error}</Text>}
  </View>
);

const EditProfilePage = () => {
  const router = useRouter();

  const [details, setDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Load existing user details
  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUserDetails();
      if (data) setDetails(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message || "Could not load details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDetails(); }, [loadDetails]));

  const validate = () => {
    const errs = {};
    if (!details.first_name) errs.first_name = "First name is required.";
    if (!details.last_name) errs.last_name = "Last name is required.";
    if (!details.phone_number || details.phone_number.replace(/\D/g, '').length < 10) {
      errs.phone_number = "Phone number must be at least 10 digits.";
    }
    if (!details.address) errs.address = "Address is required.";
    if (!details.city) errs.city = "City is required.";
    if (!details.state) errs.state = "State is required.";
    if (!details.zip_code) errs.zip_code = "ZIP code is required.";
    if (!details.country) errs.country = "Country is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await updateUserDetails(details);
      Alert.alert("Success", "Details updated successfully.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert("Error", err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={COLORS.primaryGreen}
            onPress={() => router.back()}
          />
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={[globalStyles.card, styles.cardCustom]}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
              <Text style={styles.cardHeaderText}>Edit Profile Details</Text>
            </View>
            <View style={globalStyles.divider} />

            <View style={styles.row}>
              <InputField label="FIRST NAME" value={details.first_name} onChangeText={(t) => setDetails(p => ({ ...p, first_name: t }))} placeholder="John" width="48%" error={fieldErrors.first_name} />
              <InputField label="LAST NAME" value={details.last_name} onChangeText={(t) => setDetails(p => ({ ...p, last_name: t }))} placeholder="Doe" width="48%" error={fieldErrors.last_name} />
            </View>
            <InputField label="EMAIL" value={details.email} onChangeText={(t) => setDetails(p => ({ ...p, email: t }))} placeholder="john@example.com" keyboardType="email-address" error={fieldErrors.email} />
            <InputField label="PHONE NUMBER" value={details.phone_number} onChangeText={(t) => setDetails(p => ({ ...p, phone_number: t }))} placeholder="+1 555 123 4567" keyboardType="phone-pad" error={fieldErrors.phone_number} />
            <InputField label="ADDRESS" value={details.address} onChangeText={(t) => setDetails(p => ({ ...p, address: t }))} placeholder="123 Main St" error={fieldErrors.address} />
            <InputField label="CITY" value={details.city} onChangeText={(t) => setDetails(p => ({ ...p, city: t }))} placeholder="New York" error={fieldErrors.city} />
            <View style={styles.row}>
              <InputField label="STATE" value={details.state} onChangeText={(t) => setDetails(p => ({ ...p, state: t }))} placeholder="NY" width="48%" error={fieldErrors.state} />
              <InputField label="ZIP CODE" value={details.zip_code} onChangeText={(t) => setDetails(p => ({ ...p, zip_code: t }))} placeholder="10001" keyboardType="numeric" width="48%" error={fieldErrors.zip_code} />
            </View>
            <InputField label="COUNTRY" value={details.country} onChangeText={(t) => setDetails(p => ({ ...p, country: t }))} placeholder="United States" error={fieldErrors.country} />

            {error && <Text style={globalStyles.errorText}>{error}</Text>}

            <Pressable
              style={[globalStyles.button, styles.saveButton, saving && globalStyles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Save Changes</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.lg : SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.mediumBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.header,
    fontWeight: 'bold',
    color: COLORS.primaryGreen,
    marginLeft: SPACING.sm,
  },

  container: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  cardCustom: { backgroundColor: COLORS.mediumBg, marginBottom: SPACING.lg },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md, gap: SPACING.sm },
  cardHeaderText: { fontSize: FONT_SIZES.lg, fontWeight: "bold", color: COLORS.primaryGreen },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  inputFieldContainer: { marginBottom: SPACING.sm },
  inputLabel: { fontSize: FONT_SIZES.xs, color: COLORS.primaryGreen, marginBottom: SPACING.xs, textTransform: 'uppercase', fontWeight: '600' },
  inputCustom: { backgroundColor: COLORS.darkBg, borderColor: COLORS.border, color: COLORS.textPrimary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, fontSize: FONT_SIZES.md },
  inputError: { borderColor: COLORS.error },
  errorMessageText: { color: COLORS.error, fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
  saveButton: { marginTop: SPACING.lg }
});

export default EditProfilePage;
