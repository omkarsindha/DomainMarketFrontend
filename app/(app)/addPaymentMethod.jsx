import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CardField, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSetupIntent, savePaymentMethod, fetchUser, getPaymentInfo, removePaymentMethod } from '../../src/services/userService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const cardBrandLogos = {
    visa: require('../../assets/images/brands/visa.png'),
    mastercard: require('../../assets/images/brands/mastercard.png'),
    amex: require('../../assets/images/brands/amex.png'),
};

const AddPaymentMethodPage = () => {
    const router = useRouter();
    const { confirmSetupIntent } = useConfirmSetupIntent();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState(null);
    const [user, setUser] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);

    const initialize = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const userData = await fetchUser();
            if (!userData || !userData.username) {
                throw new Error("Could not verify user details.");
            }
            setUser(userData);

            const paymentData = await getPaymentInfo(userData.username);
            setPaymentInfo(paymentData);

            if (!paymentData || !paymentData.stripe_payment_method_id) {
                const intentData = await createSetupIntent(userData.username);
                if (intentData.client_secret) {
                    setClientSecret(intentData.client_secret);
                } else {
                    throw new Error("Could not initialize payment screen.");
                }
            }
        } catch (err) {
            setError(err.detail || err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const handleSavePress = async () => {
        setSaving(true);
        setError('');

        try {
            const { error: confirmError, setupIntent } = await confirmSetupIntent(clientSecret, {
                paymentMethodType: 'Card',
            });

            if (confirmError) {
                setError(confirmError.message);
                return;
            }

            if (setupIntent && setupIntent.paymentMethodId) {
                await savePaymentMethod(user.username, setupIntent.paymentMethodId);
                Alert.alert("Success", "Your payment method has been saved securely.", [
                    { text: "OK", onPress: () => initialize() }
                ]);
            } else {
                setError("Setup intent failed. Please try again.");
            }
        } catch (backendError) {
            setError(backendError.detail || backendError.message || "An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemovePress = () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to remove your payment method?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        setError('');
                        try {
                            await removePaymentMethod(user.username);
                            Alert.alert("Success", "Your payment method has been removed.", [
                                { text: "OK", onPress: () => initialize() }
                            ]);
                        } catch (err) {
                            setError(err.detail || err.message || "Could not remove payment method.");
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const renderExistingCard = () => (
        <View style={globalStyles.card}>
            <View style={styles.header}>
                <Ionicons name="card" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
                <Text style={styles.label}>Payment Method</Text>
            </View>
            <Text style={styles.infoText}>You have a card linked to your account.</Text>
            <View style={styles.cardDisplay}>
                <Ionicons name="checkmark-circle" size={ICON_SIZES.xl} color={COLORS.primaryGreen} />
                <Text style={styles.cardDisplayText}>Card on File</Text>
            </View>

            {error && <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>{error}</Text>}

            <Pressable
                style={({ pressed }) => [
                    globalStyles.button,
                    styles.actionButton,
                    { backgroundColor: COLORS.error, borderColor: COLORS.error },
                    deleting && globalStyles.buttonDisabled,
                    pressed && !deleting && { backgroundColor: '#d10000' }
                ]}
                onPress={handleRemovePress}
                disabled={deleting}
            >
                {deleting ? (
                    <ActivityIndicator color={COLORS.textOnPrimaryGreen} />
                ) : (
                    <Text style={globalStyles.buttonText}>Remove Card</Text>
                )}
            </Pressable>
        </View>
    );

    const renderAddCardForm = () => {
        if (!clientSecret) {
            return error ? <Text style={globalStyles.errorText}>{error}</Text> : null;
        }

        return (
            <View style={globalStyles.card}>
                <View style={styles.header}>
                    <Ionicons name="lock-closed-outline" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
                    <Text style={styles.label}>Add Card Details</Text>
                </View>

                <View style={styles.logoContainer}>
                    <Image source={cardBrandLogos.visa} style={styles.logo} resizeMode="contain" />
                    <Image source={cardBrandLogos.mastercard} style={styles.logo} resizeMode="contain" />
                    <Image source={cardBrandLogos.amex} style={styles.logo} resizeMode="contain" />
                </View>

                <Text style={styles.subLabel}>We accept all major credit & debit cards.</Text>

                <View style={styles.cardFieldContainer}>
                    <CardField
                        postalCodeEnabled={false}
                        placeholders={{ number: '4242 4242 4242 4242' }}
                        cardStyle={styles.cardFieldStyle}
                        style={styles.cardField}
                        onCardChange={(details) => setCardDetails(details)}
                    />
                </View>

                {cardDetails && (
                    <View style={styles.statusContainer}>
                        <Ionicons
                            name={cardDetails.complete ? "checkmark-circle" : "information-circle-outline"}
                            size={16}
                            color={cardDetails.complete ? COLORS.primaryGreen : COLORS.textSecondary}
                        />
                        <Text style={[styles.statusText, { color: cardDetails.complete ? COLORS.primaryGreen : COLORS.textSecondary }]}>
                            {cardDetails.complete ? "Card details are complete" : "Please fill in all card details"}
                        </Text>
                    </View>
                )}

                {error && <Text style={[globalStyles.errorText, { marginTop: SPACING.md, textAlign: 'left' }]}>{error}</Text>}

                <Pressable
                    style={({ pressed }) => [
                        globalStyles.button,
                        styles.actionButton,
                        saving && globalStyles.buttonDisabled,
                        pressed && !saving && { backgroundColor: COLORS.primaryGreenDark }
                    ]}
                    onPress={handleSavePress}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Save Card</Text>}
                </Pressable>


                <View style={styles.securityInfo}>
                    <Ionicons name="shield-checkmark" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.securityText}>Your card details are encrypted and secure</Text>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color={COLORS.primaryGreen} />;
        }
        if (paymentInfo && paymentInfo.stripe_payment_method_id) {
            return renderExistingCard();
        }
        return renderAddCardForm();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.md },
    header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    label: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textPrimary },
    logoContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.md },
    logo: { height: 25, width: 40 },
    subLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.lg },
    cardFieldContainer: { marginTop: SPACING.md },
    cardField: { width: '100%', height: 50, marginVertical: SPACING.xs },
    cardFieldStyle: { backgroundColor: COLORS.darkBg, textColor: COLORS.textPrimary, placeholderColor: COLORS.textSecondary, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm },
    statusText: { fontSize: FONT_SIZES.xs },
    actionButton: { marginTop: SPACING.lg },
    securityInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.md },
    securityText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
    infoText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, marginTop: SPACING.md, textAlign: 'center' },
    cardDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md, marginVertical: SPACING.xl, padding: SPACING.lg, backgroundColor: COLORS.darkBg, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
    cardDisplayText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.lg, fontWeight: '600' }
});

export default AddPaymentMethodPage;