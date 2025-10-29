import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { getDnsRecords, updateDnsRecords } from '../../src/services/domainService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES, BORDER_RADIUS } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'];

const DomainManagementPage = () => {
    const params = useLocalSearchParams();
    const { domainName } = params;

    const [dnsRecords, setDnsRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const parseDomain = (fullDomain) => {
        if (!fullDomain) return { sld: '', tld: '' };
        const parts = fullDomain.split('.');
        if (parts.length < 2) return { sld: fullDomain, tld: '' };
        const tld = parts.pop();
        const sld = parts.join('.');
        return { sld, tld };
    };

    const { sld, tld } = parseDomain(domainName);

    const loadDnsRecords = useCallback(async () => {
        if (!sld || !tld) {
            setError("Invalid domain name provided.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await getDnsRecords(sld, tld);
            setDnsRecords(data.map((rec, index) => ({ ...rec, clientId: `${Date.now()}-${index}` })));
        } catch (err) {
            const errorMessage = err.message || "An unknown error occurred while loading DNS records.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [sld, tld]);

    useFocusEffect(useCallback(() => {
        loadDnsRecords();
    }, [loadDnsRecords]));

    const handleRecordChange = (index, field, value) => {
        const updatedRecords = [...dnsRecords];
        updatedRecords[index][field] = value;
        setDnsRecords(updatedRecords);
    };

    const handleAddNewRecord = () => {
        const newRecord = {
            clientId: `${Date.now()}-new-${dnsRecords.length}`,
            hostname: '',
            record_type: 'A',
            address: '',
            ttl: 1800,
            mx_pref: 10,
        };
        setDnsRecords([...dnsRecords, newRecord]);
    };

    const handleDeleteRecord = (index) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to remove this DNS record?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        const updatedRecords = dnsRecords.filter((_, i) => i !== index);
                        setDnsRecords(updatedRecords);
                    }
                }
            ]
        );
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setError('');
        try {
            for (const record of dnsRecords) {
                if (!record.hostname?.trim() || !record.record_type?.trim() || !record.address?.trim()) {
                    throw new Error("All fields (Host, Type, Value) are required for each record.");
                }
            }
            await updateDnsRecords(sld, tld, dnsRecords);
            Alert.alert("Success", "DNS records have been updated successfully.", [{
                text: "OK", onPress: () => loadDnsRecords()
            }]);
        } catch (err) {
            // ✅ FIX: This now ensures a clear string message is always shown.
            const errorMessage = err.message || "An unknown error occurred while saving.";
            setError(errorMessage);
            Alert.alert("Error", errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
    }

    if (error && dnsRecords.length === 0) {
        return <View style={globalStyles.centeredContainer}><Text style={globalStyles.errorText}>{error}</Text></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={[globalStyles.card, styles.cardCustom]}>
                    <View style={styles.header}>
                        <Ionicons name="cog-outline" size={ICON_SIZES.lg} color={COLORS.primaryGreen} />
                        <Text style={styles.headerTitle}>Host Records for {domainName}</Text>
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 2 }]}>Type</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>Host</Text>
                        <Text style={[styles.headerCell, { flex: 3 }]}>Value</Text>
                        <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>TTL</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    {dnsRecords.map((record, index) => (
                        <View key={record.clientId} style={styles.recordRow}>
                            <View style={[styles.inputContainer, { flex: 2 }]}>
                                <Picker
                                    selectedValue={record.record_type}
                                    onValueChange={(value) => handleRecordChange(index, 'record_type', value)}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                    dropdownIconColor={COLORS.primaryGreen}
                                >
                                    {RECORD_TYPES.map(type => <Picker.Item key={type} label={type} value={type} />)}
                                </Picker>
                            </View>
                            <TextInput style={[styles.input, { flex: 2 }]} value={record.hostname} onChangeText={(val) => handleRecordChange(index, 'hostname', val)} placeholder="@, www" placeholderTextColor={COLORS.textSecondary} />
                            <TextInput style={[styles.input, { flex: 3 }]} value={record.address} onChangeText={(val) => handleRecordChange(index, 'address', val)} placeholder="IP or URL" placeholderTextColor={COLORS.textSecondary} />
                            <TextInput style={[styles.input, { flex: 1.5, textAlign: 'center' }]} value={String(record.ttl)} onChangeText={(val) => handleRecordChange(index, 'ttl', val)} keyboardType="numeric" />
                            <TouchableOpacity onPress={() => handleDeleteRecord(index)} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={ICON_SIZES.lg} color={COLORS.error} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <View style={styles.buttonContainer}>
                        <Pressable style={[globalStyles.button, styles.actionButton, { backgroundColor: COLORS.darkBg, borderWidth: 1, borderColor: COLORS.primaryGreen }]} onPress={handleAddNewRecord}>
                            <Ionicons name="add" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
                            <Text style={[globalStyles.buttonText, { color: COLORS.primaryGreen, marginLeft: SPACING.sm }]}>Add New Record</Text>
                        </Pressable>
                        <Pressable
                            style={[globalStyles.button, styles.actionButton, saving && globalStyles.buttonDisabled]}
                            onPress={handleSaveChanges} disabled={saving}
                        >
                            {saving ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Save All Changes</Text>}
                        </Pressable>
                    </View>
                    {error && <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>{error}</Text>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    container: { padding: SPACING.md, paddingBottom: SPACING.xl },
    cardCustom: { backgroundColor: COLORS.mediumBg },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm },
    headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, flexShrink: 1 },
    tableHeader: { flexDirection: 'row', paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.sm, paddingHorizontal: SPACING.xs },
    headerCell: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: FONT_SIZES.xs, textTransform: 'uppercase' },
    recordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
    input: { backgroundColor: COLORS.darkBg, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.sm, height: 44, fontSize: FONT_SIZES.sm },
    inputContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.darkBg, justifyContent: 'center', height: 44 },
    picker: {
        color: COLORS.textPrimary,
        height: '100%',
        ...(Platform.OS === 'android' ? {} : { transform: [{ scale: 0.85 }] })
    },
    pickerItem: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textPrimary,
        backgroundColor: COLORS.darkBg,
    },
    deleteButton: { padding: SPACING.xs, justifyContent: 'center', alignItems: 'center', width: 30 },
    buttonContainer: {
        marginTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.md,
        flexDirection: 'column',
        gap: SPACING.sm
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default DomainManagementPage;