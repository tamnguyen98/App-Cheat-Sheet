import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GuideForm } from '../components/GuideForm';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';
import { Guide } from '../types/guide';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

type GuideEditorRouteProp = RouteProp<RootStackParamList, 'GuideEditor'>;

export function GuideEditorScreen() {
    const { t } = useTranslation();
    const theme = useTheme();
    const route = useRoute<GuideEditorRouteProp>();
    const navigation = useNavigation();
    const { guideId } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [initialState, setInitialState] = useState<Guide | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    // Store actions to update local list immediately
    const appendMyGuides = useAppStore((s) => s.appendMyGuides);
    const setMyGuides = useAppStore((s) => s.setMyGuides);
    const myGuides = useAppStore((s) => s.myGuides);

    const isEditMode = !!guideId;

    useEffect(() => {
        if (isEditMode && guideId) {
            setLoading(true);
            // Try to find in local store first
            const existing = myGuides.find(g => g.id === guideId);
            // Fetch from API if not found (e.g. deep link)
            api.getGuide(guideId, {}).then(guide => {
                setInitialState(guide);
            }).catch(e => {
                console.error('Failed to load guide for editing', e);
                Alert.alert(t('common.error'), t('editor.loadError'));
                navigation.goBack();
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [guideId, isEditMode, myGuides, navigation, t]);

    const handleSave = async (guideData: Partial<Guide>) => {
        setIsSaving(true);
        try {
            if (isEditMode && guideId) {
                const updated = await api.updateGuide(guideId, guideData);
                // Update store
                const updatedList = myGuides.map(g => g.id === guideId ? updated : g);
                setMyGuides(updatedList);
                Alert.alert(t('common.success'), t('editor.saveSuccess'));
                navigation.goBack();
            } else {
                const baseId = (guideData.title || 'untitled')
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') + '-' + Date.now();

                const created = await api.createGuide({
                    ...guideData,
                    baseId,
                });
                // Add to store
                appendMyGuides([created]);
                Alert.alert(t('common.success'), t('editor.createSuccess'));
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to save guide', error);
            Alert.alert(t('common.error'), t('editor.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!guideId) return;
        setIsSaving(true);
        try {
            await api.deleteGuide(guideId);
            const filtered = myGuides.filter(g => g.id !== guideId);
            setMyGuides(filtered);
            navigation.goBack();
        } catch (error) {
            console.error('Failed to delete guide', error);
            Alert.alert(t('common.error'), t('editor.deleteError'));
        } finally {
            setIsSaving(false);
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        content: { padding: 24, paddingBottom: 48 },
        header: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.textPrimary,
            marginBottom: 24,
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <ScreenWrapper padding={0}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.header}>
                    {isEditMode ? t('editor.editGuide') : t('editor.createGuide')}
                </Text>

                {isSaving && (
                    <ActivityIndicator size="small" color={theme.primary} style={{ marginBottom: 10 }} />
                )}

                <GuideForm
                    initialState={initialState}
                    onSave={handleSave}
                    onCancel={() => navigation.goBack()}
                    onDelete={handleDelete}
                    isEditMode={isEditMode}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}
