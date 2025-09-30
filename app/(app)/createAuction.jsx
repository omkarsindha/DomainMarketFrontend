import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { fetchMyDomains } from '../../src/services/domainService';
import { createAuction } from '../../src/services/auctionService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const CreateAuctionPage = () => {
    const router = useRouter();
    const [myDomains, setMyDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [duration, setDuration] = useState('7');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDomains = async () => {
            setLoading(true);
            try {
                const domains = await fetchMyDomains();
                setMyDomains(domains);
                if (domains.length > 0) {
                    setSelectedDomain(domains[0].domain_name);
                }
            } catch (err) {
                setError(err.message || "Could not load your domains.");
            } finally {
                setLoading(false);
            }
        };
        loadDomains();
    }, []);

    const handleCreateAuction = async () => {
        if (!selectedDomain || !startPrice || !duration) {
            setError("Please fill all fields.");
            return;
        }
        if (isNaN(parseFloat(startPrice)) || parseFloat(startPrice) <= 0) {
            setError("Please enter a valid start price.");
            return;
        }
        setSaving(true);
        setError('');
        try {
            await createAuction({
                domain_name: selectedDomain,
                start_price: parseFloat(startPrice),
                duration_days: parseInt(duration, 10),
            });
            Alert.alert("Success", "Your auction has been created successfully.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (err) {
            setError(err.message || "Failed to create auction.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
    }

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
                                itemStyle={styles.pickerItem}
                            >
                                {myDomains.map((domain) => (
                                    <Picker.Item key={domain.id} label={domain.domain_name} value={domain.domain_name} />
                                ))}
                            </Picker>
                        </View>
                    ) : (
                        <Text style={styles.errorText}>You don't own any domains to auction.</Text>
                    )}

                    <Text style={styles.label}>Start Price ($)</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="e.g., 10.50"
                        placeholderTextColor={COLORS.textSecondary}
                        value={startPrice}
                        onChangeText={setStartPrice}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Duration (Days)</Text>
                    <TextInput
                        style={globalStyles.input}
                        placeholder="e.g., 7"
                        placeholderTextColor={COLORS.textSecondary}
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                    />

                    {error && <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>{error}</Text>}

                    <Pressable
                        style={({ pressed }) => [globalStyles.button, styles.actionButton, (saving || myDomains.length === 0) && globalStyles.buttonDisabled, pressed && !saving && { backgroundColor: COLORS.primaryGreenDark }]}
                        onPress={handleCreateAuction}
                        disabled={saving || myDomains.length === 0}
                    >
                        {saving ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Create Auction</Text>}
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
    pickerContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.md },
    picker: { color: COLORS.textPrimary, height: 50 },
    pickerItem: { color: COLORS.textPrimary, backgroundColor: COLORS.mediumBg },
    actionButton: { marginTop: SPACING.lg },
    errorText: { color: COLORS.error, textAlign: 'center', marginTop: SPACING.sm },
});

export default CreateAuctionPage;