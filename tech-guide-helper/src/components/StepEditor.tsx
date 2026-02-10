import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { GuideStep } from '../types/guide';
import { useTranslation } from 'react-i18next';
// import * as ImagePicker from 'expo-image-picker'; // Use when ready to integrate

interface StepEditorProps {
    step: GuideStep;
    index: number;
    totalSteps: number;
    onUpdate: (step: GuideStep) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

const MIN_TOUCH_DP = 48;
const MIN_FONT_SIZE = 18;

export function StepEditor({
    step,
    index,
    totalSteps,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
}: StepEditorProps) {
    const theme = useTheme();
    const { t } = useTranslation();

    const handleTextChange = (text: string) => {
        onUpdate({ ...step, text });
    };

    // Placeholder image picker
    const handlePickImage = async () => {
        console.log('Pick image for step', index + 1);
        // Implement image picker later
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.surface,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.border,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        stepLabel: {
            fontSize: MIN_FONT_SIZE,
            fontWeight: '700',
            color: theme.textPrimary,
        },
        actions: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            minWidth: 44,
            minHeight: 44,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.surfaceAlt,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.border,
        },
        actionText: {
            fontSize: 20,
            color: theme.textPrimary,
        },
        deleteButton: {
            backgroundColor: theme.error,
            borderColor: theme.error,
        },
        deleteText: {
            color: theme.textInverse,
        },
        input: {
            minHeight: MIN_TOUCH_DP,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            padding: 12,
            fontSize: MIN_FONT_SIZE,
            color: theme.textPrimary,
            backgroundColor: theme.background,
            marginBottom: 12,
        },
        imageButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            borderWidth: 1,
            borderColor: theme.primary,
            borderRadius: 8,
            marginBottom: 12,
            borderStyle: 'dashed',
            backgroundColor: theme.primaryLight,
        },
        imageButtonText: {
            fontSize: MIN_FONT_SIZE,
            color: theme.primary,
            marginLeft: 8,
            fontWeight: '600',
        },
        previewImage: {
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
            resizeMode: 'cover',
        },
        charCount: {
            textAlign: 'right',
            fontSize: 14,
            color: step.text.length > 50 ? theme.error : theme.textTertiary,
            marginBottom: 4,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.stepLabel}>
                    {t('guide.step', { number: index + 1 })}
                </Text>
                <View style={styles.actions}>
                    <Pressable
                        onPress={onMoveUp}
                        disabled={index === 0}
                        style={[styles.actionButton, index === 0 && { opacity: 0.3 }]}
                        accessibilityLabel={t('editor.moveUp')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.actionText}>▲</Text>
                    </Pressable>
                    <Pressable
                        onPress={onMoveDown}
                        disabled={index === totalSteps - 1}
                        style={[styles.actionButton, index === totalSteps - 1 && { opacity: 0.3 }]}
                        accessibilityLabel={t('editor.moveDown')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.actionText}>▼</Text>
                    </Pressable>
                    <Pressable
                        onPress={onDelete}
                        style={[styles.actionButton, styles.deleteButton]}
                        accessibilityLabel={t('editor.deleteStep')}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.actionText, styles.deleteText]}>✕</Text>
                    </Pressable>
                </View>
            </View>

            <Text style={styles.charCount}>
                {step.text.length} / 50
            </Text>

            <TextInput
                style={styles.input}
                value={step.text}
                onChangeText={handleTextChange}
                placeholder={t('editor.stepPlaceholder')}
                placeholderTextColor={theme.inputPlaceholder}
                multiline
                maxLength={50} // Hard limit or soft limit? Prompt implies strict but validation says prevent saving.
                accessibilityLabel={t('editor.stepDescription', { number: index + 1 })}
            />

            {step.image ? (
                <View>
                    <Image source={{ uri: step.image }} style={styles.previewImage} />
                    <Pressable
                        onPress={() => onUpdate({ ...step, image: '' })}
                        style={styles.imageButton}
                        accessibilityLabel={t('editor.removeImage')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.imageButtonText}>{t('editor.removeImage')}</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    onPress={handlePickImage}
                    style={styles.imageButton}
                    accessibilityLabel={t('editor.addImage')}
                    accessibilityRole="button"
                >
                    <Text style={styles.imageButtonText}>📷 {t('editor.addImage')}</Text>
                </Pressable>
            )}
        </View>
    );
}
