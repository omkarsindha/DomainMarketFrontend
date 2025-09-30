import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../src/constants/colors';
import { ICON_SIZES, SPACING } from '../../src/constants/dimensions';

export default function AppLayout() {
    const router = useRouter();
    const defaultHeaderOptions = {
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.mediumBg },
        headerTintColor: COLORS.primaryGreen,
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md }}>
                <Ionicons name="arrow-back" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
            </TouchableOpacity>
        ),
    };

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="domainBuy"
                options={{
                    ...defaultHeaderOptions,
                    title: 'Domain Registration',
                }}
            />
            <Stack.Screen
                name="checkout"
                options={{
                    ...defaultHeaderOptions,
                    title: 'Checkout',
                }}
            />
            <Stack.Screen
                name="transactions"
                options={{
                    ...defaultHeaderOptions,
                    title: 'My Transactions',
                }}
            />
            <Stack.Screen
                name="createAuction"
                options={{
                    ...defaultHeaderOptions,
                    title: 'Create Auction',
                }}
            />
            <Stack.Screen
                name="auctionDetail"
                options={{
                    ...defaultHeaderOptions,
                    title: 'Auction Details',
                }}
            />
            <Stack.Screen
                name="addPaymentMethod"
                options={{
                    ...defaultHeaderOptions,
                    title: 'Add Payment Method',
                }}
            />
        </Stack >
    );
}