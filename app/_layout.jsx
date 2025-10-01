import React, { useState, useEffect, createContext, useContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { getToken, removeToken as serviceRemoveToken } from '../src/services/authService';
import { COLORS } from '../src/constants/colors';
import { StripeProvider } from '@stripe/stripe-react-native';


const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await getToken();
                setUserToken(token);
            } catch (e) {
                console.error("AuthProvider: Failed to load token", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = (token) => {
        setUserToken(token);
    };

    const logout = async () => {
        await serviceRemoveToken();
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default function RootLayout() {
    const stripePublishableKey = "pk_test_51SDBqI1ARGDSynsvbJDGnfmzQUCVWMlLily7xvpC0fuAjEQjvwGtFuMcuvqs79X9iSAumqmIgRl0JXDtxqj0cyvw00Q0UeTBjW";
    return (
        <StripeProvider publishableKey={stripePublishableKey}>
            <AuthProvider>
                <FavoritesProvider>
                    <Layout />
                </FavoritesProvider>
            </AuthProvider>
        </StripeProvider>
    );
}

function Layout() {
    const { userToken, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const isInAuthFlow = segments[0] === '(auth)';
        const isAppEntry = segments.length === 0 || segments[0] === 'index';

        if (!userToken) {
            if (!isInAuthFlow) {
                router.replace('/(auth)/landing');
            }
        } else {
            if (isInAuthFlow || isAppEntry) {
                router.replace('/(app)/(tabs)/home');
            }
        }
    }, [userToken, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primaryGreen} />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
            </Stack>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.darkBg,
    },
});