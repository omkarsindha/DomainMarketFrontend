import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, SCREEN_HEIGHT, SCREEN_WIDTH } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';


const LandingPage = () => {
  const router = useRouter();

  const [showSplashContent, setShowSplashContent] = useState(true);
  const logoScale = useRef(new Animated.Value(1.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;
  const wavePosition = SCREEN_HEIGHT * 0.30;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(500),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 400, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(contentOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(waveOpacity, { toValue: 0.6, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ])
      ]).start(() => { setShowSplashContent(false); });
    });
  }, [logoScale, logoOpacity, contentOpacity, waveOpacity]);


  return (
    <LinearGradient colors={[COLORS.darkBg, COLORS.mediumBg]} style={styles.container}>
      <Animated.View style={[styles.waveLeft, { top: wavePosition, opacity: waveOpacity }]}>
        <Svg height={200} width={150} viewBox="0 0 100 100"><Path d="M10,0 C50,50 50,50 10,100 L0,100 L0,0 Z" fill={COLORS.primaryGreen} /></Svg>
      </Animated.View>
      <Animated.View style={[styles.waveRight, { top: wavePosition, opacity: waveOpacity }]}>
        <Svg height={200} width={150} viewBox="0 0 100 100"><Path d="M90,0 C50,50 50,50 90,100 L100,100 L100,0 Z" fill={COLORS.primaryGreen} /></Svg>
      </Animated.View>

      {showSplashContent && (
        <Animated.View style={[styles.splashScreenContent, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={require('../../assets/images/logo.png')} style={styles.splashLogo} resizeMode="contain" />
          <Text style={styles.splashText}>Domain Market</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.mainContentContainer, { opacity: contentOpacity }]}>
        <Image source={require('../../assets/images/logo.png')} style={styles.mainLogo} resizeMode="contain" />
        <Text style={styles.mainHeading}>Domain Market</Text>
        <Text style={styles.subHeading}>Find your perfect domain</Text>

        <Pressable
          style={({ pressed }) => [globalStyles.button, styles.actionButton, pressed && { backgroundColor: COLORS.primaryGreenDark }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={globalStyles.buttonText}>Login</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [globalStyles.button, globalStyles.buttonOutline, styles.actionButton, pressed && { backgroundColor: 'rgba(102, 252, 241, 0.1)' }]}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Sign Up</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  waveLeft: { position: 'absolute', left: -SPACING.md },
  waveRight: { position: 'absolute', right: -SPACING.md },
  splashScreenContent: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  splashLogo: { width: SCREEN_WIDTH * 0.4, height: SCREEN_WIDTH * 0.4, marginBottom: SPACING.md },
  splashText: { fontSize: FONT_SIZES.title + 4, fontWeight: 'bold', color: COLORS.primaryGreen, textAlign: 'center' },
  mainContentContainer: { alignItems: 'center', paddingHorizontal: SPACING.xl, width: '100%' },
  mainLogo: { width: SCREEN_WIDTH * 0.35, height: SCREEN_WIDTH * 0.35, marginBottom: SPACING.lg },
  mainHeading: { fontSize: FONT_SIZES.title, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.sm, textAlign: 'center' },
  subHeading: { fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginBottom: SPACING.xl + SPACING.md, textAlign: 'center' },
  actionButton: { width: '85%', maxWidth: 350, marginBottom: SPACING.md },
});

export default LandingPage;