import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
    Alert, SafeAreaView, ScrollView, Platform, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { registerDomain } from '../../src/services/domainService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';


const CheckoutPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const parsedDomain = params.domain ? JSON.parse(params.domain) : {};
    const {
        domain: domainName = 'N/A',
        price: domainPrice = 0,
        min_duration: minDuration = 1,
    } = parsedDomain;

    const [duration, setDuration] = useState(minDuration);
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (domainPrice > 0) {
            setTotalPrice(parseFloat((domainPrice * duration).toFixed(2)));
        } else {
            setTotalPrice(0);
        }
    }, [duration, domainPrice]);

    useEffect(() => {
        setDuration(minDuration);
    }, [minDuration]);

    const handlePayment = async () => {
        setLoading(true);
        setErrorMessage('');
        if (domainName === 'N/A' || domainPrice <= 0) {
            setErrorMessage('Domain information is invalid.'); setLoading(false);
            Alert.alert('Error', 'Invalid domain details.'); return;
        }
        try {
            await registerDomain(domainName, duration);
            Alert.alert(
                'Registration Initiated!',
                `Processing registration for ${domainName}.`,
                [{ text: "OK", onPress: () => router.replace('/(app)/(tabs)/home') }]
            );
        } catch (err) {
            console.error('Payment Process Error:', err);
            const displayError = err.message || 'An unexpected error during payment.';
            setErrorMessage(displayError); Alert.alert('Payment Error', displayError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={[globalStyles.card, styles.detailsCard]}>
                        <View style={styles.cardHeaderContainer}><Ionicons name="globe-outline" size={ICON_SIZES.md} color={COLORS.primaryGreen} style={styles.cardHeaderIcon} /><Text style={styles.cardHeaderText}>Domain Details</Text></View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}><Text style={styles.detailLabel}>Domain:</Text><Text style={styles.detailValueName}>{domainName}</Text></View>
                        <View style={styles.detailRow}><Text style={styles.detailLabel}>Price per year:</Text><Text style={styles.detailValuePrice}>${domainPrice.toFixed(2)}</Text></View>
                        <Text style={styles.durationLabel}>Registration Duration:</Text>
                        <Text style={styles.durationValueDisplay}>{duration} Year{duration > 1 ? 's' : ''}</Text>
                        <Slider
                            minimumValue={minDuration} maximumValue={7} step={1} value={duration} onValueChange={setDuration}
                            style={styles.slider} minimumTrackTintColor={COLORS.primaryGreen} maximumTrackTintColor={COLORS.primaryGreenDark}
                            thumbTintColor={Platform.OS === 'android' ? COLORS.primaryGreen : COLORS.white}
                        />
                        <View style={styles.divider} />
                        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Amount:</Text><Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text></View>
                    </View>

                    {errorMessage ? (<View style={styles.errorContainer}><Ionicons name="alert-circle-outline" size={ICON_SIZES.md} color={COLORS.errorBorder} /><Text style={styles.errorTextMsg}>{errorMessage}</Text></View>) : null}
                    <Pressable
                        style={({ pressed }) => [globalStyles.button, styles.payButton, (loading || domainName === 'N/A' || domainPrice <= 0) && globalStyles.buttonDisabled, pressed && !(loading || domainName === 'N/A' || domainPrice <= 0) && { backgroundColor: COLORS.primaryGreenDark }]}
                        onPress={handlePayment} disabled={loading || domainName === 'N/A' || domainPrice <= 0}
                    >
                        {loading ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Pay ${totalPrice.toFixed(2)}</Text>}
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    scrollViewContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
    detailsCard: { marginBottom: SPACING.lg, backgroundColor: COLORS.mediumBg },
    cardHeaderContainer: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
    cardHeaderIcon: { marginRight: SPACING.sm },
    cardHeaderText: { fontSize: FONT_SIZES.lg, fontWeight: "bold", color: COLORS.primaryGreen },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    detailLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, flex: 1 },
    detailValueName: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '600', flex: 2, textAlign: 'right' },
    detailValuePrice: { fontSize: FONT_SIZES.md, color: COLORS.primaryGreen, fontWeight: '600', flex: 1, textAlign: 'right' },
    durationLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.xs },
    durationValueDisplay: { fontSize: FONT_SIZES.xl, fontWeight: "bold", color: COLORS.primaryGreen, textAlign: "center", marginVertical: SPACING.sm },
    slider: { marginVertical: SPACING.md, height: 40 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
    totalLabel: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, fontWeight: 'bold' },
    totalValue: { fontSize: FONT_SIZES.xl, fontWeight: "bold", color: COLORS.primaryGreen },
    payButton: { marginTop: SPACING.md, width: '100%' },
    errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBackground, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginHorizontal: SPACING.xs, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.errorBorder },
    errorTextMsg: { color: COLORS.error, marginLeft: SPACING.sm, fontSize: FONT_SIZES.sm, flex: 1 },
});

export default CheckoutPage;