// app/(auth)/signup.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import for navigation

// Adjust relative paths
import { registerUser } from '../../src/services/authService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const SignUpPage = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    setErrorMessage('');
    // ... (your existing validation logic: all fields, email regex, password length)
    if (!username || !email || !password) { setErrorMessage('Please fill in all fields.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setErrorMessage('Please enter a valid email address.'); return; }
    if (password.length < 6) { setErrorMessage('Password must be at least 6 characters long.'); return; }


    setLoading(true);
    try {
      await registerUser(username, email, password); // From your authService
      // After successful registration, navigate to the login screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.darkBg, COLORS.darkBg, COLORS.mediumBg]} // Using COLORS constant
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Adjust path to logo */}
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create an Account</Text>
          {errorMessage ? (
            <Text style={globalStyles.errorText}>{errorMessage}</Text>
          ) : (
            <Text style={styles.subtitle}>Sign up to get started</Text>
          )}

          {/* Input Fields */}
          <View style={globalStyles.inputContainer}>
            <Ionicons name="person-outline" size={ICON_SIZES.md} style={globalStyles.iconStyle} />
            <TextInput style={globalStyles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor={COLORS.textSecondary} />
          </View>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="mail-outline" size={ICON_SIZES.md} style={globalStyles.iconStyle} />
            <TextInput style={globalStyles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textSecondary} />
          </View>
          <View style={globalStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={ICON_SIZES.md} style={globalStyles.iconStyle} />
            <TextInput style={globalStyles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor={COLORS.textSecondary} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={ICON_SIZES.md} color={COLORS.primaryGreen} />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={({ pressed }) => [
              globalStyles.button, globalStyles.buttonOutline,
              loading && globalStyles.buttonDisabled,
              pressed && { backgroundColor: COLORS.primaryGreenDark },
              styles.actionButton
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (<ActivityIndicator size="small" color={COLORS.primaryGreen} />)
              : (<Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Sign Up</Text>)}
          </Pressable>

          {/* Footer Link to Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={globalStyles.linkText}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// Styles (adapted from your SignUpScreen and globalStyles)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  logo: { width: 120, height: 120, marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  eyeIcon: { padding: SPACING.sm },
  actionButton: { width: '100%', marginTop: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: SPACING.lg },
  footerText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.sm, marginRight: SPACING.xs },
});

export default SignUpPage;