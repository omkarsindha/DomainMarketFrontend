import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text } from 'react-native';
import { COLORS } from '../../../src/constants/colors';
import { FONT_SIZES, ICON_SIZES, SPACING } from '../../../src/constants/dimensions';

const PlaceholderFavoritesScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.darkBg }}>
        <Text style={{ color: COLORS.textPrimary }}>Favorites Screen Placeholder</Text>
    </View>
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.darkBg,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.primaryGreenDark,
                    height: Platform.OS === 'android' ? 60 + SPACING.xs : 70 + SPACING.xxs,
                    paddingBottom: Platform.OS === 'ios' ? SPACING.md : SPACING.xs,
                    paddingTop: SPACING.xs,
                },
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    const iconSize = focused ? ICON_SIZES.lg - 2 : ICON_SIZES.md;

                    if (route.name === 'home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'search') iconName = focused ? 'search' : 'search-outline';
                    else if (route.name === 'favorites') iconName = focused ? 'heart' : 'heart-outline';
                    else if (route.name === 'profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
                    else iconName = 'ellipse-outline';

                    return <Ionicons name={iconName} size={iconSize} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primaryGreen,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarLabelStyle: {
                    fontSize: FONT_SIZES.xs,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'android' ? SPACING.xs : 0,
                },
            })}
        >
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="search" options={{ title: 'Search' }} />
            <Tabs.Screen
                name="favorites"
                options={{ title: 'Favorites' }}
            />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
    );
}