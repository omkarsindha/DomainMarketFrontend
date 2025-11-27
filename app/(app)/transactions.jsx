import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, SafeAreaView,
    ActivityIndicator, TouchableOpacity, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { fetchMyTransactions } from '../../src/services/userService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES, BORDER_RADIUS } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TRANSACTION_TYPE_DETAILS = {
    DOMAIN_REGISTRATION: { icon: 'add-circle-outline', color: '#3498db', label: 'Domain Registration' },
    DOMAIN_RENEWAL: { icon: 'refresh-circle-outline', color: '#2ecc71', label: 'Domain Renewal' },
    DOMAIN_TRANSFER: { icon: 'arrow-forward-circle-outline', color: '#9b59b6', label: 'Domain Transfer' },
    AUCTION_WIN: { icon: 'trophy-outline', color: '#f1c40f', label: 'Auction Win' },
    AUCTION_SALE: { icon: 'cash-outline', color: '#e67e22', label: 'Auction Sale' },
    DEFAULT: { icon: 'receipt-outline', color: COLORS.textSecondary, label: 'Transaction' }
};

const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
};

const TransactionItem = ({ item, isExpanded, onPress }) => {
    const { icon, color, label } = TRANSACTION_TYPE_DETAILS[item.transaction_type] || TRANSACTION_TYPE_DETAILS.DEFAULT;

    return (
        <TouchableOpacity style={globalStyles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.summaryContainer}>

                <View style={styles.summaryTextContainer}>
                    <Text style={styles.domainName} numberOfLines={1}>{item.domain_name_at_purchase || label}</Text>
                    <Text style={styles.dateText}>{new Date(item.transaction_date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>
                        {item.transaction_type.endsWith('_SALE') ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
                    </Text>
                    <Ionicons name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={ICON_SIZES.md} color={COLORS.textSecondary} />
                </View>
            </View>
            {isExpanded && (
                <View style={styles.detailsContainer}>
                    <DetailRow label="Transaction ID" value={item.id} />
                    <DetailRow label="Type" value={label} />
                    <DetailRow label="Status" value={item.status} />
                    {item.years_purchased && <DetailRow label="Duration" value={`${item.years_purchased} Year(s)`} />}
                    <DetailRow label="Description" value={item.description} />
                    <DetailRow label="Date & Time" value={new Date(item.transaction_date).toLocaleString()} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const loadTransactions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchMyTransactions();
            setTransactions(data);
        } catch (err) {
            setError(err.message || "Could not load transaction history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [loadTransactions])
    );

    const handleItemPress = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <View style={globalStyles.centeredContainer}>
                <ActivityIndicator size="large" color={COLORS.primaryGreen} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {error ? (
                <View style={globalStyles.centeredContainer}>
                    <Text style={globalStyles.errorText}>{error}</Text>
                    <TouchableOpacity style={globalStyles.button} onPress={loadTransactions}>
                        <Text style={globalStyles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TransactionItem
                            item={item}
                            isExpanded={expandedId === item.id}
                            onPress={() => handleItemPress(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <View style={globalStyles.centeredContainer}>
                            <Ionicons name="document-text-outline" size={80} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>No Transactions Found</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    listContent: { padding: SPACING.md },
    summaryContainer: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: SPACING.md },
    summaryTextContainer: { flex: 1 },
    domainName: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '600' },
    dateText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
    amountContainer: { alignItems: 'flex-end' },
    amountText: { fontSize: FONT_SIZES.md, color: COLORS.primaryGreen, fontWeight: 'bold' },
    detailsContainer: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.md, paddingTop: SPACING.md },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
    detailLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
    detailValue: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
    emptyText: { color: COLORS.textPrimary, fontSize: FONT_SIZES.lg, marginTop: SPACING.md },
});

export default TransactionsPage;