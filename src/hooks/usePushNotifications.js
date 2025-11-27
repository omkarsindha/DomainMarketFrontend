import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { registerDeviceToken } from '../services/userService';
import { useAuth } from '../../app/_layout';

export function usePushNotifications() {
    const router = useRouter();
    const { userToken } = useAuth();

    // 1. Request Permission
    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled;
    };

    useEffect(() => {
        if (!userToken) return; // Only run if user is logged in

        const setupNotifications = async () => {
            const hasPermission = await requestUserPermission();

            if (hasPermission) {
                // 2. Get the token
                try {
                    const fcmToken = await messaging().getToken();
                    if (fcmToken) {
                        console.log('FCM Token:', fcmToken);
                        // Send to backend
                        await registerDeviceToken(fcmToken);
                    }
                } catch (error) {
                    console.error("Error getting FCM token:", error);
                }
            }
        };

        setupNotifications();

        // 3. Handle Token Refresh (if token changes while app is open)
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
            registerDeviceToken(token);
        });

        // 4. Handle Foreground Messages (App is open)
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            Alert.alert(
                remoteMessage.notification?.title || 'New Notification',
                remoteMessage.notification?.body || '',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'View',
                        onPress: () => handleNotificationPress(remoteMessage.data)
                    }
                ]
            );
        });

        // 5. Handle Background/Quit State Notification Clicks
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage);
            handleNotificationPress(remoteMessage.data);
        });

        // Check if app was opened from a quit state
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage);
                    // Slight delay to ensure navigation is ready
                    setTimeout(() => handleNotificationPress(remoteMessage.data), 500);
                }
            });

        return () => {
            unsubscribeTokenRefresh();
            unsubscribeOnMessage();
        };
    }, [userToken]);

    // Navigation Logic based on backend data payload
    const handleNotificationPress = (data) => {
        if (!data) return;

        // Match these types with your Python backend "type" field
        switch (data.type) {
            case 'auction':
            case 'auction_history':
                if (data.id) router.push({ pathname: '/(app)/auctionDetail', params: { auctionId: data.id } });
                break;
            case 'domain_details':
            case 'domain_settings':
                // Assuming you have a way to find domain name by ID, or pass domainName in notification data
                // If backend sends domain_id, you might need to fetch details first, 
                // or simple redirect to home/portfolio
                router.push('/(app)/(tabs)/home');
                break;
            default:
                router.push('/(app)/notifications'); // Default to notification center
                break;
        }
    };
}