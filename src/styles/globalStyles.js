// src/styles/globalStyles.js
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/dimensions';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darkBg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.lg,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.darkBg,
        padding: SPACING.md,
    },
    titleText: {
        fontSize: FONT_SIZES.title,
        fontWeight: 'bold',
        color: COLORS.primaryGreen,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    errorText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.error,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: COLORS.mediumBg,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        height: 50,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    button: {
        backgroundColor: COLORS.primaryGreen,
        paddingVertical: SPACING.md - 2, // ~14px
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        marginVertical: SPACING.sm,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonText: {
        color: COLORS.textOnPrimaryGreen,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primaryGreen,
    },
    buttonOutlineText: {
        color: COLORS.primaryGreen,
    },
    buttonDisabled: {
        backgroundColor: COLORS.disabled,
        borderColor: COLORS.disabled,
    },
    buttonTextDisabled: {
        color: COLORS.disabledText,
    },
    linkText: {
        color: COLORS.primaryGreen,
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: COLORS.mediumBg,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconStyle: {
        color: COLORS.primaryGreen,
        marginRight: SPACING.sm,
    },
});