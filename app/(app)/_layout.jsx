import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../src/constants/colors';
import { ICON_SIZES, SPACING } from '../../src/constants/dimensions';

export default function AppLayout() {
    const router = useRouter();
    return (
        <Stack>

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
                name="domainBuy"
                options={{
                    title: 'Domain Registration',
                    headerShown: true,
                    headerStyle: { backgroundColor: COLORS.mediumBg },
                    headerTintColor: COLORS.primaryGreen,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md }}>
                            <Ionicons name="arrow-back" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="checkout"
                options={{
                    title: 'Checkout',
                    headerShown: true,
                    headerStyle: { backgroundColor: COLORS.mediumBg },
                    headerTintColor: COLORS.primaryGreen,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md }}>
                            <Ionicons name="arrow-back" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="transactions"
                options={{
                    title: 'My Transactions',
                    headerShown: true,
                    headerStyle: { backgroundColor: COLORS.mediumBg },
                    headerTintColor: COLORS.primaryGreen,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md }}>
                            <Ionicons name="arrow-back" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
                        </TouchableOpacity>
                    ),
                }}
            /><Stack.Screen
                name="auction"
                    options={{
                        title: 'Auctions',
                        headerShown: true,
                        headerStyle: { backgroundColor: COLORS.mediumBg },
                        headerTintColor: COLORS.primaryGreen,
                        headerTitleStyle: { fontWeight: 'bold' },
                        headerLeft: () => (
                                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: SPACING.md }}>
                                     <Ionicons name="arrow-back" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
                                </TouchableOpacity>
                    ),
                    }}
                    />
        </Stack>

    );
}