import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CardField, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSetupIntent, savePaymentMethod, fetchUser } from '../../src/services/userService';
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
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState(null);
    const [user, setUser] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);

    useEffect(() => {
        async function initialize() {
            try {
                const userData = await fetchUser();
                if (!userData || !userData.username) {
                    throw new Error("Could not verify user details.");
                }
                setUser(userData);

                const intentData = await createSetupIntent(userData.username);
                if (intentData.client_secret) {
                    setClientSecret(intentData.client_secret);
                } else {
                    throw new Error("Could not initialize payment screen.");
                }
            } catch (err) {
                setError(err.detail || err.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }
        initialize();
    }, []);

    const handleSavePress = async () => {
        console.log('=== SAVE CARD PRESSED ===');

        if (!clientSecret || !user) {
            console.log('ERROR: Missing clientSecret or user');
            setError("Cannot process payment.");
            return;
        }

        setSaving(true);
        setError('');

        try {
            console.log('Confirming setup intent with card field...');

            const { error: confirmError, setupIntent } = await confirmSetupIntent(clientSecret, {
                paymentMethodType: 'Card',
                debugText: {
                    fontSize: FONT_SIZES.xs,
                    color: COLORS.textSecondary,
                    marginTop: SPACING.sm,
                    fontFamily: 'monospace',
                },
            });

            console.log('confirmSetupIntent response:');
            console.log('- error:', confirmError);
            console.log('- setupIntent:', setupIntent);

            if (confirmError) {
                console.log('ERROR confirming setup intent:', JSON.stringify(confirmError, null, 2));
                setError(confirmError.message);
                setSaving(false);
                return;
            }

            if (setupIntent && setupIntent.paymentMethodId) {
                console.log('Saving to backend...');
                console.log('- username:', user.username);
                console.log('- paymentMethodId:', setupIntent.paymentMethodId);

                await savePaymentMethod(user.username, setupIntent.paymentMethodId);
                console.log('SUCCESS: Payment method saved');

                Alert.alert("Success", "Your payment method has been saved securely.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                console.log('ERROR: No setupIntent.paymentMethodId');
                setError("Setup intent failed");
            }
        } catch (backendError) {
            console.log('CATCH ERROR:', backendError);
            console.log('Error detail:', backendError.detail);
            console.log('Error message:', backendError.message);
            setError(backendError.detail || backendError.message || "An error occurred");
        } finally {
            setSaving(false);
            console.log('=== SAVE CARD COMPLETE ===');
        }
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color={COLORS.primaryGreen} />;
        }

        if (error && !clientSecret) {
            return <Text style={globalStyles.errorText}>{error}</Text>;
        }

        if (clientSecret) {
            return (
                <View style={globalStyles.card}>
                    <View style={styles.header}>
                        <Ionicons name="lock-closed-outline" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
                        <Text style={styles.label}>Card Details</Text>
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
                            placeholders={{
                                number: '4242 4242 4242 4242',
                            }}
                            cardStyle={{
                                backgroundColor: COLORS.darkBg,
                                textColor: COLORS.textPrimary,
                                placeholderColor: COLORS.textSecondary,
                                borderWidth: 1,
                                borderColor: COLORS.border,
                                borderRadius: BORDER_RADIUS.sm,
                            }}
                            style={styles.cardField}
                            onCardChange={(details) => {
                                console.log('=== CardField onCardChange ===');
                                console.log('Details:', JSON.stringify(details, null, 2));
                                setCardDetails(details);
                            }}
                        />
                    </View>

                    <Text style={styles.debugText}>
                        CardDetails: {cardDetails ? JSON.stringify(cardDetails) : 'null'}
                    </Text>


                    {cardDetails && (
                        <View style={styles.statusContainer}>
                            <Ionicons
                                name={cardDetails.complete ? "checkmark-circle" : "information-circle-outline"}
                                size={16}
                                color={cardDetails.complete ? COLORS.primaryGreen : COLORS.textSecondary}
                            />
                            <Text style={[
                                styles.statusText,
                                { color: cardDetails.complete ? COLORS.primaryGreen : COLORS.textSecondary }
                            ]}>
                                {cardDetails.complete
                                    ? "Card details are complete"
                                    : "Please fill in all card details"}
                            </Text>
                        </View>
                    )}

                    {error ? (
                        <Text style={[globalStyles.errorText, { marginTop: SPACING.md, textAlign: 'left' }]}>
                            {error}
                        </Text>
                    ) : null}

                    {/* Save Button */}
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
                        {saving ? (
                            <ActivityIndicator color={COLORS.textOnPrimaryGreen} />
                        ) : (
                            <Text style={globalStyles.buttonText}>Save Card</Text>
                        )}
                    </Pressable>
                    <View style={styles.securityInfo}>
                        <Ionicons name="shield-checkmark" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.securityText}>
                            Your card details are encrypted and secure
                        </Text>
                    </View>
                </View>
            );
        }
        return null;
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
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.darkBg
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.md
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    label: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    logo: {
        height: 25,
        width: 40,
    },
    subLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.xs,
        marginBottom: SPACING.lg,
    },
    cardFieldContainer: {
        marginTop: SPACING.md,
    },
    cardField: {
        width: '100%',
        height: 50,
        marginVertical: SPACING.xs,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: SPACING.sm,
    },
    statusText: {
        fontSize: FONT_SIZES.xs,
    },
    actionButton: {
        marginTop: SPACING.lg,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xs,
        marginTop: SPACING.md,
    },
    securityText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
});

export default AddPaymentMethodPage;