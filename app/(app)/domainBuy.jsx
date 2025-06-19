import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
    TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { fetchUserDetails, updateUserDetails } from '../../src/services/userService';
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


    const parsedDomain = params.domain ? JSON.parse(params.domain) : null;

    const domain = parsedDomain && parsedDomain.domain && (parsedDomain.price !== undefined || parsedDomain.price?.price !== undefined)
        ? {
            ...parsedDomain,
            price: Number(parsedDomain.price?.price || parsedDomain.price || 0),
            min_duration: Number(parsedDomain.price?.min_duration || parsedDomain.min_duration || 1)
        }
        : { domain: "example.com", price: 10.00, min_duration: 1 }; // Fallback

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [userDetails, setUserDetails] = useState({
        phone_number: '', first_name: '', last_name: '',
        address: '', city: '', state: '', zip_code: '', country: '',
    });

    const formatPhoneNumberOnDisplay = (rawPhoneNumber) => {
        if (!rawPhoneNumber) return '';
        const cleaned = ('' + rawPhoneNumber).replace(/\D/g, '');
        if (cleaned.length > 10 && cleaned.startsWith('1')) { return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`; }
        if (cleaned.length === 10) { return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`; }
        return rawPhoneNumber;
    };
    const preparePhoneNumberForSubmission = (displayPhoneNumber) => {
        if (!displayPhoneNumber) return '';
        return ('' + displayPhoneNumber).replace(/\D/g, '');
    };

    useEffect(() => {
        const loadDetails = async () => {
            setLoading(true);
            setFormError('');
            try {
                const data = await fetchUserDetails();
                if (data) {
                    setUserDetails(prev => ({
                        ...prev, ...data,
                        phone_number: formatPhoneNumberOnDisplay(data.phone_number)
                    }));
                }
            } catch (error) {
                console.error("Fetch User Details Error:", error);
                setFormError(error.message || "Could not load your details.");
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, []);


    const validateField = (name, value) => {
        if (!value || String(value).trim() === '') return `${name.replace('_', ' ')} is required.`;
        if (name === 'zip_code' && userDetails.country?.toLowerCase().includes('us') && !/^\d{5}(-\d{4})?$/.test(value)) { return 'Invalid Zip Code.'; }
        if (name === 'phone_number' && preparePhoneNumberForSubmission(value).length < 10) { return 'Invalid phone number.'; }
        return '';
    };
    const handleInputChange = (name, value) => {
        setUserDetails(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) { setFieldErrors(prev => ({ ...prev, [name]: '' })); }
    };

    const handleProceedToCheckout = async () => {
        setFormError('');
        const currentFieldErrors = {};
        const requiredFields = ['first_name', 'last_name', 'phone_number', 'address', 'city', 'state', 'zip_code', 'country'];
        requiredFields.forEach(field => {
            const error = validateField(field, userDetails[field]);
            if (error) currentFieldErrors[field] = error;
        });
        setFieldErrors(currentFieldErrors);

        if (Object.keys(currentFieldErrors).length > 0) {
            setFormError("Please correct the errors in the form.");
            return;
        }

        setSaving(true);
        try {
            const submissionDetails = {
                ...userDetails,
                phone_number: preparePhoneNumberForSubmission(userDetails.phone_number)
            };
            await updateUserDetails(submissionDetails);
            router.push({
                pathname: '/(app)/checkout',
                params: {
                    domain: JSON.stringify(domain),
                    userDetails: JSON.stringify(submissionDetails)
                }
            });
        } catch (error) {
            console.error("Update User Details Error:", error);
            setFormError(error.message || "Failed to save details. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={[COLORS.darkBg, COLORS.mediumBg]} style={globalStyles.centeredContainer}>
                <ActivityIndicator size="large" color={COLORS.primaryGreen} />
                <Text style={{ color: COLORS.textPrimary, marginTop: SPACING.md }}>Loading your details...</Text>
            </LinearGradient>
        );
    }

    return (
        <>

            <LinearGradient colors={[COLORS.darkBg, COLORS.mediumBg]} style={styles.outerContainer}>
                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === "ios" ? (SPACING.xl + SPACING.md) : 0}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={[globalStyles.card, styles.cardCustom]}>
                                <View style={styles.cardHeader}><Ionicons name="information-circle-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} /><Text style={styles.cardHeaderText}>Domain to Register</Text></View>
                                <View style={globalStyles.divider} />
                                <Text style={styles.domainNameDisplay}>{domain.domain}</Text>
                                <Text style={styles.domainPriceDisplay}>Base Price: ${domain.price?.toFixed(2) || '0.00'}/year</Text>
                            </View>

                            <View style={[globalStyles.card, styles.cardCustom]}>
                                <View style={styles.cardHeader}><Ionicons name="person-circle-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} /><Text style={styles.cardHeaderText}>Your Contact Information</Text></View>
                                <View style={globalStyles.divider} />
                                <View style={styles.row}><InputField label="FIRST NAME" value={userDetails.first_name} onChangeText={(t) => handleInputChange('first_name', t)} placeholder="e.g. John" width="48%" error={fieldErrors.first_name} /><InputField label="LAST NAME" value={userDetails.last_name} onChangeText={(t) => handleInputChange('last_name', t)} placeholder="e.g. Doe" width="48%" error={fieldErrors.last_name} /></View>
                                <InputField label="PHONE NUMBER" value={userDetails.phone_number} onChangeText={(t) => handleInputChange('phone_number', t)} placeholder="(xxx) xxx-xxxx" keyboardType="phone-pad" error={fieldErrors.phone_number} />
                                <InputField label="ADDRESS" value={userDetails.address} onChangeText={(t) => handleInputChange('address', t)} placeholder="123 Main St" error={fieldErrors.address} />
                                <InputField label="CITY" value={userDetails.city} onChangeText={(t) => handleInputChange('city', t)} placeholder="e.g. Anytown" error={fieldErrors.city} />
                                <View style={styles.row}><InputField label="STATE / PROVINCE" value={userDetails.state} onChangeText={(t) => handleInputChange('state', t)} placeholder="e.g. CA" width="48%" error={fieldErrors.state} /><InputField label="ZIP / POSTAL CODE" value={userDetails.zip_code} onChangeText={(t) => handleInputChange('zip_code', t)} placeholder="e.g. 90210" keyboardType="numeric" width="48%" error={fieldErrors.zip_code} /></View>
                                <InputField label="COUNTRY" value={userDetails.country} onChangeText={(t) => handleInputChange('country', t)} placeholder="e.g. United States" error={fieldErrors.country} />
                            </View>

                            {formError ? (<View style={styles.formErrorContainer}><Ionicons name="alert-circle-outline" size={ICON_SIZES.md} color={COLORS.errorBorder} /><Text style={styles.formErrorText}>{formError}</Text></View>) : null}
                            <Pressable
                                style={({ pressed }) => [globalStyles.button, styles.actionButton, saving && globalStyles.buttonDisabled, pressed && !saving && { backgroundColor: COLORS.primaryGreenDark }]}
                                onPress={handleProceedToCheckout} disabled={saving}
                            >
                                {saving ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Proceed to Checkout</Text>}
                            </Pressable>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </>
    );
};
const styles = StyleSheet.create({
    outerContainer: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
    cardCustom: { backgroundColor: COLORS.mediumBg, marginBottom: SPACING.lg },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md, gap: SPACING.sm },
    cardHeaderText: { fontSize: FONT_SIZES.lg, fontWeight: "bold", color: COLORS.primaryGreen },
    domainNameDisplay: { fontSize: FONT_SIZES.xl, fontWeight: "bold", color: COLORS.primaryGreen, marginVertical: SPACING.xs },
    domainPriceDisplay: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.sm },
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
});

export default DomainBuyPage;