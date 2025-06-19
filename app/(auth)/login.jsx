import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../_layout';
import { loginUser } from '../../src/services/authService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS, ICON_SIZES } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';


const LoginPage = () => {
  const router = useRouter();
  const { login: contextLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      contextLogin(data.access_token);
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.darkBg, COLORS.darkBg, COLORS.mediumBg]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          {errorMessage ? (
            <Text style={globalStyles.errorText}>{errorMessage}</Text>
          ) : (
            <Text style={styles.subtitle}>Sign in to continue</Text>
          )}
          <View style={globalStyles.inputContainer}>
            <Ionicons name="person-outline" size={ICON_SIZES.md} style={globalStyles.iconStyle} />
            <TextInput
              style={globalStyles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={globalStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={ICON_SIZES.md} style={globalStyles.iconStyle} />
            <TextInput
              style={globalStyles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={ICON_SIZES.md}
                color={COLORS.primaryGreen}
              />
            </TouchableOpacity>
          </View>
          <Pressable
            style={({ pressed }) => [
              globalStyles.button,
              globalStyles.buttonOutline,
              loading && globalStyles.buttonDisabled,
              pressed && { backgroundColor: COLORS.primaryGreenDark },
              styles.actionButton
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primaryGreen} />
            ) : (
              <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Login</Text>
            )}
          </Pressable>
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={globalStyles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  logo: { width: 120, height: 120, marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.xl },
  eyeIcon: { padding: SPACING.sm },
  actionButton: { width: '100%', marginTop: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: SPACING.lg },
});

export default LoginPage;