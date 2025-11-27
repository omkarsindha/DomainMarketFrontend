import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, TouchableOpacity, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { getDnsRecords, updateDnsRecords, toggleAutoRenew } from '../../src/services/domainService';
import { COLORS } from '../../src/constants/colors';
import { FONT_SIZES, SPACING, ICON_SIZES, BORDER_RADIUS } from '../../src/constants/dimensions';
import { globalStyles } from '../../src/styles/globalStyles';

//DNS record types
const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'];

const DomainManagementPage = () => {
    //getting domain name, id and auto renew 
    const params = useLocalSearchParams();
    const domainName = params.domainName;
    const domainId = params.domainId;
    const initialAutoRenew = params.initialAutoRenew === 'true';

    const [activeTab, setActiveTab] = useState('DNS'); // ACtive tab for'DNS' or 'Settings'

    // DNS State
    const [dnsRecords, setDnsRecords] = useState([]);//holds current DNS records fetched from API
    const [loadingDns, setLoadingDns] = useState(false);// indicates when DNS records are fetched
    const [savingDns, setSavingDns] = useState(false);//indicated DNS records are saved

    // Settings State
    const [isAutoRenew, setIsAutoRenew] = useState(initialAutoRenew);//toggle for auto renew
    const [togglingRenew, setTogglingRenew] = useState(false);// Tracks loading state when toggling auto-renew 

    const [error, setError] = useState('');// error msg 

    //splits full domain into SLD and TLD
    //drive.google.com -> drive.google &  com
    const parseDomain = (fullDomain) => {
        if (!fullDomain)
            return { sld: '', tld: '' };
        const parts = fullDomain.split('.');
        if (parts.length < 2)
            return { sld: fullDomain, tld: '' };
        const tld = parts.pop();     // get the last element in array and remoe it from list
        const sld = parts.join('.'); // join strings in array using .
        return { sld, tld };
    };

    const { sld, tld } = parseDomain(domainName);

    // --- DNS Logic ---
    // Load DNS records from backend API
    const loadDnsRecords = useCallback(async () => {
        if (!sld || !tld) return;// If domain is invalid, skip
        setLoadingDns(true);// Show loading spinner
        setError('');// Clear previous errors
        try {
            // Fetch records
            const data = await getDnsRecords(sld, tld);
            setDnsRecords(data.map((rec, index) => ({ ...rec, clientId: `${Date.now()}-${index}` })));
        } catch (err) {
            setError(err.message || "An unknown error occurred while loading DNS records.");// Display error message
        } finally {
            setLoadingDns(false);// Hide loading spinner
        }
    }, [sld, tld]);
    // Reload DNS tab when active
    useFocusEffect(useCallback(() => {
        if (activeTab === 'DNS') {
            loadDnsRecords();
        }
    }, [activeTab, loadDnsRecords]));
    // Update a specific field of a DNS record
    const handleRecordChange = (index, field, value) => {
        const updatedRecords = [...dnsRecords];
        updatedRecords[index][field] = value;
        setDnsRecords(updatedRecords);
    };
    // Add a new empty DNS record to the list
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
    // Delete a DNS record
    const handleDeleteRecord = (index) => {
        const updatedRecords = dnsRecords.filter((_, i) => i !== index);
        setDnsRecords(updatedRecords);
    };
    // Save updated DNS records to API
    const handleSaveDnsChanges = async () => {
        setSavingDns(true);
        setError('');
        try {
             // Validate all fields before saving
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
            setError(err.message || "An unknown error occurred while saving.");
            Alert.alert("Error", err.message);
        } finally {
            setSavingDns(false);
        }
    };

    // --- Settings Logic ---

    const handleToggleAutoRenew = async (value) => {
        if (!domainId) {
            Alert.alert("Error", "Domain ID missing. Please reload.");
            return;
        }

        setTogglingRenew(true);
        // Optimistic update
        setIsAutoRenew(value);

        try {
            await toggleAutoRenew(domainId, value);
            // Success - keep the state
        } catch (err) {
            // Revert on failure
            setIsAutoRenew(!value);
            Alert.alert("Update Failed", err.message || "Could not update auto-renew status.");
        } finally {
            setTogglingRenew(false);
        }
    };


    // --- Renders ---

    const renderDnsTab = () => {
        if (loadingDns) {
            return <View style={globalStyles.centeredContainer}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
        }

        return (
            <View style={[globalStyles.card, styles.cardCustom]}>
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
                        <TextInput style={[styles.input, { flex: 2 }]} value={record.hostname} onChangeText={(val) => handleRecordChange(index, 'hostname', val)} placeholder="@" placeholderTextColor={COLORS.textSecondary} />
                        <TextInput style={[styles.input, { flex: 3 }]} value={record.address} onChangeText={(val) => handleRecordChange(index, 'address', val)} placeholder="IP/URL" placeholderTextColor={COLORS.textSecondary} />
                        <TextInput style={[styles.input, { flex: 1.5, textAlign: 'center' }]} value={String(record.ttl)} onChangeText={(val) => handleRecordChange(index, 'ttl', val)} keyboardType="numeric" />
                        <TouchableOpacity onPress={() => handleDeleteRecord(index)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={ICON_SIZES.lg} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.buttonContainer}>
                    <Pressable style={[globalStyles.button, styles.actionButton, { backgroundColor: COLORS.darkBg, borderWidth: 1, borderColor: COLORS.primaryGreen }]} onPress={handleAddNewRecord}>
                        <Ionicons name="add" size={ICON_SIZES.md} color={COLORS.primaryGreen} />
                        <Text style={[globalStyles.buttonText, { color: COLORS.primaryGreen, marginLeft: SPACING.sm }]}>Add Record</Text>
                    </Pressable>
                    <Pressable
                        style={[globalStyles.button, styles.actionButton, savingDns && globalStyles.buttonDisabled]}
                        onPress={handleSaveDnsChanges} disabled={savingDns}
                    >
                        {savingDns ? <ActivityIndicator color={COLORS.textOnPrimaryGreen} /> : <Text style={globalStyles.buttonText}>Save DNS</Text>}
                    </Pressable>
                </View>
                {error && <Text style={[globalStyles.errorText, { marginTop: SPACING.md }]}>{error}</Text>}
            </View>
        );
    };

    const renderSettingsTab = () => {
        return (
            <View style={globalStyles.card}>
                <Text style={styles.sectionHeader}>Domain Settings</Text>

                <View style={styles.settingRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.settingTitle}>Auto-Renew</Text>
                        <Text style={styles.settingDesc}>
                            Automatically charge your card and renew this domain 24 hours before expiration.
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Switch
                            trackColor={{ false: COLORS.border, true: COLORS.primaryGreenDark }}
                            thumbColor={isAutoRenew ? COLORS.primaryGreen : COLORS.textSecondary}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleToggleAutoRenew}
                            value={isAutoRenew}
                            disabled={togglingRenew}
                        />
                        {togglingRenew && <ActivityIndicator size="small" color={COLORS.primaryGreen} style={{ marginTop: 5 }} />}
                    </View>
                </View>

                <View style={globalStyles.divider} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.domainTitle}>{domainName}</Text>
            </View>

            {/* Custom Tab Bar */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'DNS' && styles.activeTabButton]}
                    onPress={() => setActiveTab('DNS')}
                >
                    <Text style={[styles.tabText, activeTab === 'DNS' && styles.activeTabText]}>DNS Records</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'Settings' && styles.activeTabButton]}
                    onPress={() => setActiveTab('Settings')}
                >
                    <Text style={[styles.tabText, activeTab === 'Settings' && styles.activeTabText]}>Settings</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {activeTab === 'DNS' ? renderDnsTab() : renderSettingsTab()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.darkBg },
    container: { padding: SPACING.md, paddingBottom: SPACING.xl },
    header: { padding: SPACING.md, backgroundColor: COLORS.mediumBg, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
    domainTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.primaryGreen },

    // Tab Styles
    tabContainer: { flexDirection: 'row', margin: SPACING.md, backgroundColor: COLORS.mediumBg, borderRadius: BORDER_RADIUS.md, padding: 4 },
    tabButton: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.sm },
    activeTabButton: { backgroundColor: COLORS.primaryGreen },
    tabText: { color: COLORS.textSecondary, fontWeight: '600' },
    activeTabText: { color: COLORS.textOnPrimaryGreen, fontWeight: 'bold' },

    // DNS Styles
    cardCustom: { backgroundColor: COLORS.mediumBg },
    tableHeader: { flexDirection: 'row', paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: SPACING.sm, paddingHorizontal: SPACING.xs },
    headerCell: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: FONT_SIZES.xs, textTransform: 'uppercase' },
    recordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.xs },
    input: { backgroundColor: COLORS.darkBg, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: SPACING.xs, height: 44, fontSize: FONT_SIZES.xs },
    inputContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.darkBg, justifyContent: 'center', height: 44 },
    picker: { color: COLORS.textPrimary, height: '100%', ...(Platform.OS === 'android' ? {} : { transform: [{ scale: 0.8 }] }) },
    pickerItem: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, backgroundColor: COLORS.darkBg },
    deleteButton: { padding: SPACING.xs, justifyContent: 'center', alignItems: 'center', width: 30 },
    buttonContainer: { marginTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, flexDirection: 'column', gap: SPACING.sm },
    actionButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },

    // Settings Styles
    sectionHeader: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: SPACING.md },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md },
    settingTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
    settingDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginRight: SPACING.md }
});

export default DomainManagementPage;