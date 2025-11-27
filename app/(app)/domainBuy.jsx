import React, { useState, useEffect } from 'react';
import {
    View, Text, Pressable, StyleSheet, ActivityIndicator,
    TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

import { fetchUserDetails, updateUserDetails, getPaymentInfo } from '../../src/services/userService';
import { registerDomain } from '../../src/services/domainService';

import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', width = '100%', error, editable = true }) => (
    <View style={[styles.inputFieldContainer, { width }]}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
            style={[globalStyles.input, styles.inputCustom, error && styles.inputError, !editable && styles.inputDisabled]}
            placeholder={placeholder} placeholderTextColor={COLORS.textSecondary} value={value}
            onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize="words" editable={editable}
        />
        {error && <Text style={styles.errorMessageText}>{error}</Text>}
    </View>
);

const DomainBuyPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const parsedDomain = params.domain ? JSON.parse(params.domain) : {};
    const domain = {
        domain: parsedDomain.domain || "N/A",
        price: Number(parsedDomain.price?.price || parsedDomain.price || 0),
        min_duration: Number(parsedDomain.price?.min_duration || parsedDomain.min_duration || 1)
    };

    const [duration, setDuration] = useState(domain.min_duration);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        setTotalPrice(parseFloat((domain.price * duration).toFixed(2)));
    }, [duration, domain.price]);

    useEffect(() => {
        setDuration(domain.min_duration);
    }, [domain.min_duration]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [userDetails, setUserDetails] = useState({
        phone_number: '', first_name: '', last_name: '',
        address: '', city: '', state: '', zip_code: '', country: '',
    });

    const formatPhoneNumberOnDisplay = (rawDbString) => {
        return rawDbString || '';
    };
    const preparePhoneNumberForSubmission = (displayString) => {
        if (!displayString) return '';
        return displayString.replace(/\D/g, '');
    };

    useEffect(() => {
        const loadDetails = async () => {
            setLoading(true);
            try {
                const data = await fetchUserDetails();
                if (data) {
                    setUserDetails(prev => ({ ...prev, ...data, phone_number: formatPhoneNumberOnDisplay(data.phone_number) }));
                }
            } catch (error) {
                setFormError(error.message || "Could not load your details.");
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, []);

    const validateAndSaveDetails = async () => {
        setFormError('');
        const currentFieldErrors = {};
        const requiredFields = ['first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'zip_code', 'country'];

        requiredFields.forEach(field => {
            if (!userDetails[field] || String(userDetails[field]).trim() === '') {
                currentFieldErrors[field] = `${field.replace('_', ' ')} is required.`;
            }
        });

        const phoneNumberDigits = userDetails.phone_number.replace(/\D/g, '');
        if (!currentFieldErrors.phone_number && phoneNumberDigits.length < 10) {
            currentFieldErrors.phone_number = 'Phone number must be at least 10 digits.';
        }

        setFieldErrors(currentFieldErrors);

        if (Object.keys(currentFieldErrors).length > 0) {
            setFormError("Please correct the errors in the form.");
            return false;
        }

        try {
            const submissionDetails = { ...userDetails, phone_number: preparePhoneNumberForSubmission(userDetails.phone_number) };
            await updateUserDetails(submissionDetails);
            return true;
        } catch (error) {
            setFormError(error.message || "Failed to save details. Please try again.");
            return false;
        }
    };

    const handlePayment = async () => {
        setSaving(true);

        const detailsSaved = await validateAndSaveDetails();
        if (!detailsSaved) {
            setSaving(false);
            return;
        }

        try {
            await registerDomain(domain.domain, totalPrice, duration);
            Alert.alert(
                'Registration Complete!',
                `You have successfully registered ${domain.domain}.`,
                [{ text: "OK", onPress: () => router.replace('/(app)/(tabs)/home') }]
            );

        } catch (err) {
            // logic to handle no card on file error
            if (err.message && err.message.includes("A card is required")) {
                Alert.alert(
                    "Payment Method Required",
                    "Please add a payment method to complete your purchase.",
                    // Navigate the user to the add payment page
                    [{ text: "OK", onPress: () => router.push('/(app)/addPaymentMethod') }]
                );
            } else {
                const displayError = err.message || 'An unexpected error occurred during payment.';
                setFormError(displayError);
                Alert.alert('Payment Error', displayError);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={[COLORS.darkBg, COLORS.mediumBg]} style={globalStyles.centeredContainer}>
                <ActivityIndicator size="large" color={COLORS.primaryGreen} />
                <Text style={{ color: COLORS.textPrimary, marginTop: SPACING.md }}>Loading...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[COLORS.darkBg, COLORS.mediumBg]} style={styles.outerContainer}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        <View style={[globalStyles.card, styles.cardCustom]}>
                            <View style={styles.cardHeader}><Ionicons name="globe-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} /><Text style={styles.cardHeaderText}>Order Summary</Text></View>
                            <View style={globalStyles.divider} />
                            <View style={styles.detailRow}><Text style={styles.detailLabel}>Domain:</Text><Text style={styles.detailValueName}>{domain.domain}</Text></View>
                            <View style={styles.detailRow}><Text style={styles.detailLabel}>Price per year:</Text><Text style={styles.detailValuePrice}>${domain.price.toFixed(2)}</Text></View>
                            <Text style={styles.durationLabel}>Registration Duration:</Text>
                            <Text style={styles.durationValueDisplay}>{duration} Year{duration > 1 ? 's' : ''}</Text>
                            <Slider
                                minimumValue={domain.min_duration} maximumValue={7} step={1} value={duration} onValueChange={setDuration}
                                style={styles.slider} minimumTrackTintColor={COLORS.primaryGreen} maximumTrackTintColor={COLORS.primaryGreenDark}
                                thumbTintColor={Platform.OS === 'android' ? COLORS.primaryGreen : COLORS.white}
                            />
                            <View style={globalStyles.divider} />
                            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Amount:</Text><Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text></View>
                        </View>
                        <View style={[globalStyles.card, styles.cardCustom]}>
                            <View style={styles.cardHeader}><Ionicons name="person-circle-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} /><Text style={styles.cardHeaderText}>Your Contact Information</Text></View>
                            <View style={globalStyles.divider} />
                            <View style={styles.row}><InputField label="FIRST NAME" value={userDetails.first_name} onChangeText={(t) => setUserDetails(p => ({ ...p, first_name: t }))} placeholder="e.g. John" width="48%" error={fieldErrors.first_name} /><InputField label="LAST NAME" value={userDetails.last_name} onChangeText={(t) => setUserDetails(p => ({ ...p, last_name: t }))} placeholder="e.g. Doe" width="48%" error={fieldErrors.last_name} /></View>
                            <InputField label="PHONE NUMBER" value={userDetails.phone_number} onChangeText={(t) => setUserDetails(p => ({ ...p, phone_number: t }))} placeholder="+NNN.NNNNNNNNNN" keyboardType="phone-pad" error={fieldErrors.phone_number} />
                            <InputField label="ADDRESS" value={userDetails.address} onChangeText={(t) => setUserDetails(p => ({ ...p, address: t }))} placeholder="123 Main St" error={fieldErrors.address} />
                            <InputField label="CITY" value={userDetails.city} onChangeText={(t) => setUserDetails(p => ({ ...p, city: t }))} placeholder="e.g. Anytown" error={fieldErrors.city} />
                            <View style={styles.row}><InputField label="STATE / PROVINCE" value={userDetails.state} onChangeText={(t) => setUserDetails(p => ({ ...p, state: t }))} placeholder="e.g. CA" width="48%" error={fieldErrors.state} /><InputField label="ZIP / POSTAL CODE" value={userDetails.zip_code} onChangeText={(t) => setUserDetails(p => ({ ...p, zip_code: t }))} placeholder="e.g. 90210" keyboardType="numeric" width="48%" error={fieldErrors.zip_code} /></View>
                            <InputField label="COUNTRY" value={userDetails.country} onChangeText={(t) => setUserDetails(p => ({ ...p, country: t }))} placeholder="e.g. United States" error={fieldErrors.country} />
                        </View>

                        {formError ? (<View style={styles.formErrorContainer}><Ionicons name="alert-circle-outline" size={ICON_SIZES.md} color={COLORS.errorBorder} /><Text style={styles.formErrorText}>{formError}</Text></View>) : null}
                        <Pressable
                            style={({ pressed }) => [globalStyles.button, styles.actionButton, saving && globalStyles.buttonDisabled, pressed && !saving && { backgroundColor: COLORS.primaryGreenDark }]}
                            onPress={handlePayment} disabled={saving}
                        >
                            {saving ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Pay ${totalPrice.toFixed(2)}</Text>}
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    outerContainer: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    cardCustom: { backgroundColor: COLORS.mediumBg, marginBottom: SPACING.lg },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md, gap: SPACING.sm },
    cardHeaderText: { fontSize: FONT_SIZES.lg, fontWeight: "bold", color: COLORS.primaryGreen },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
    inputFieldContainer: { marginBottom: SPACING.sm },
    inputLabel: { fontSize: FONT_SIZES.xs, color: COLORS.primaryGreen, marginBottom: SPACING.xs, textTransform: 'uppercase', fontWeight: '600' },
    inputCustom: { backgroundColor: COLORS.darkBg, borderColor: COLORS.border, color: COLORS.textPrimary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, fontSize: FONT_SIZES.md },
    inputError: { borderColor: COLORS.error },
    inputDisabled: { backgroundColor: COLORS.disabled, color: COLORS.disabledText },
    errorMessageText: { color: COLORS.error, fontSize: FONT_SIZES.xs, marginTop: SPACING.xs },
    formErrorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBackground, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.errorBorder },
    formErrorText: { color: COLORS.error, marginLeft: SPACING.sm, fontSize: FONT_SIZES.sm, flex: 1 },
    actionButton: { width: '100%', marginTop: SPACING.md },
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
});

export default DomainBuyPage;