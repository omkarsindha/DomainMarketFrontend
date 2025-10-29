import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { fetchMyDomains } from '../../src/services/domainService';
import { createListing } from '../../src/services/listingService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const CreateListingPage = () => {
  const router = useRouter();
  const [myDomains, setMyDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDomains = async () => {
      setLoading(true);
      try {
        const domains = await fetchMyDomains();
        const availableDomains = domains.filter(domain => !domain.is_auctioned && !domain.is_listed);
        setMyDomains(availableDomains);

      } catch (err) {
        setError(err.message || "Could not load domains.");
      } finally {
        setLoading(false);
      }
    };
    loadDomains();
  }, []);

  const handleCreateListing = async () => {
    if (!selectedDomain || !price) {
      setError("Please fill all fields.");
      return;
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createListing(selectedDomain, parseFloat(price));
      Alert.alert("Success", "Listing created successfully.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      setError(err.message || "Failed to create listing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={globalStyles.card}>
          <Text style={styles.label}>Select Domain</Text>
          {myDomains.length > 0 ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDomain}
                onValueChange={(itemValue) => setSelectedDomain(itemValue)}
                style={styles.picker}
              >
                <Picker.Item
                  label="-- Select a domain --"
                  value=""
                  enabled={false}
                  color={COLORS.textSecondary}
                />
                {myDomains.map((domain) => (
                  <Picker.Item
                    key={domain.id}
                    label={domain.domain_name}
                    value={domain.domain_name}
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.errorText}>You don't own any domains to list.</Text>
          )}

          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50.00"
            placeholderTextColor={COLORS.textSecondary}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {error && (
            <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>
              {error}
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [
              globalStyles.button,
              styles.actionButton,
              (saving || myDomains.length === 0) && globalStyles.buttonDisabled,
              pressed &&
              !saving && { backgroundColor: COLORS.primaryGreenDark },
            ]}
            onPress={handleCreateListing}
            disabled={saving || myDomains.length === 0}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.textOnPrimaryGreen} />
            ) : (
              <Text style={globalStyles.buttonText}>Create Listing</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
  container: { padding: SPACING.md },
  label: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.md },
  input: {
    height: 50,
    backgroundColor: COLORS.mediumBg,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.mediumBg,
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    color: COLORS.textPrimary,
    width: '100%',
  },

  actionButton: { marginTop: SPACING.lg },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: SPACING.sm },
});

export default CreateListingPage;