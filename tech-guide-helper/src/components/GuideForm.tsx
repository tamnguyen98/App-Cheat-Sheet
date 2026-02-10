import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { StepEditor } from './StepEditor';
import { GuideBuilderState, GuideStep, Guide } from '../types/guide';
import { Picker } from '@react-native-picker/picker'; // Use if available, fallback to simple select? It's in package.json

// If picker not available, use simple list or modal? Picker is installed.
// import { Picker } from '@react-native-picker/picker';

interface GuideFormProps {
    initialState?: Guide;
    onSave: (guide: Partial<Guide>) => void;
    onCancel: () => void;
    onDelete?: () => void;
    isEditMode: boolean;
}

const CATEGORIES = [
    'Video Calls',
    'Phone Basics',
    'Email',
    'Photos',
    'Security',
    'Other'
];

const DEVICE_FAMILIES = [
    { label: 'Android', value: 'android-generic' },
    { label: 'iPhone/iOS', value: 'ios-iphone' },
    { label: 'Web/Browser', value: 'web' },
];

export function GuideForm({
    initialState,
    onSave,
    onCancel,
    onDelete,
    isEditMode
}: GuideFormProps) {
    const { t } = useTranslation();
    const theme = useTheme();

    const [title, setTitle] = useState(initialState?.title || '');
    const [category, setCategory] = useState(initialState?.category || CATEGORIES[0]);
    const [deviceFamilies, setDeviceFamilies] = useState<string[]>(initialState?.deviceFamilies || []);
    const [steps, setSteps] = useState<GuideStep[]>(initialState?.steps || []);

    // Validation Errors
    const [errors, setErrors] = useState<{ title?: string; steps?: string }>({});

    const handleAddStep = () => {
        const newStep: GuideStep = {
            stepNumber: steps.length + 1,
            text: '',
            image: '',
            tts: '',
        };
        setSteps([...steps, newStep]);
    };

    const handleUpdateStep = (index: number, updatedStep: GuideStep) => {
        const newSteps = [...steps];
        newSteps[index] = updatedStep;
        setSteps(newSteps);
    };

    const handleDeleteStep = (index: number) => {
        Alert.alert(
            t('editor.deleteStepTitle'),
            t('editor.deleteStepConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        const newSteps = steps.filter((_, i) => i !== index);
                        // Re-number steps
                        const reordered = newSteps.map((s, i) => ({ ...s, stepNumber: i + 1 }));
                        setSteps(reordered);
                    }
                }
            ]
        );
    };

    const handleMoveStep = (fromIndex: number, direction: 'up' | 'down') => {
        if (direction === 'up' && fromIndex === 0) return;
        if (direction === 'down' && fromIndex === steps.length - 1) return;

        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        const newSteps = [...steps];

        // Swap
        const temp = newSteps[fromIndex];
        newSteps[fromIndex] = newSteps[toIndex];
        newSteps[toIndex] = temp;

        // Re-number
        const reordered = newSteps.map((s, i) => ({ ...s, stepNumber: i + 1 }));
        setSteps(reordered);
    };

    const validate = (): boolean => {
        let valid = true;
        const newErrors: typeof errors = {};

        if (!title.trim()) {
            newErrors.title = t('editor.errorTitleRequired');
            valid = false;
        }

        if (steps.length === 0) {
            newErrors.steps = t('editor.errorNoSteps');
            valid = false;
        }

        // Check each step for content
        const emptyStepIndex = steps.findIndex(s => !s.text.trim());
        if (emptyStepIndex !== -1) {
            newErrors.steps = t('editor.errorStepEmpty', { number: emptyStepIndex + 1 });
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSave = () => {
        if (!validate()) {
            Alert.alert(t('common.error'), t('editor.fixErrors'));
            return;
        }

        onSave({
            title,
            category,
            steps,
            deviceFamilies: deviceFamilies.length > 0 ? deviceFamilies : ['N/A'],
            language: 'en', // Should inherit from app or user setting
        });
    };

    const toggleDeviceFamily = (value: string) => {
        if (deviceFamilies.includes(value)) {
            setDeviceFamilies(deviceFamilies.filter(d => d !== value));
        } else {
            setDeviceFamilies([...deviceFamilies, value]);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        section: {
            marginBottom: 24,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.textSecondary,
            marginBottom: 8,
        },
        input: {
            minHeight: 48,
            borderWidth: 1,
            borderColor: errors.title ? theme.error : theme.border,
            borderRadius: 8,
            padding: 12,
            fontSize: 18,
            backgroundColor: theme.surface,
            color: theme.textPrimary,
        },
        errorText: {
            color: theme.error,
            fontSize: 14,
            marginTop: 4,
        },
        picker: {
            backgroundColor: theme.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
        addStepButton: {
            minHeight: 56,
            backgroundColor: theme.primaryLight,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.primary,
            borderStyle: 'dashed',
            marginTop: 12,
            marginBottom: 40,
        },
        addStepText: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.primary,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
        },
        button: {
            flex: 1,
            minHeight: 48,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
        },
        saveButton: {
            backgroundColor: theme.primary,
        },
        deleteButton: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.error,
            marginTop: 20,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        saveText: {
            color: theme.textInverse,
        },
        deleteText: {
            color: theme.error,
        },
        cancelText: {
            color: theme.textPrimary,
        },
        deviceRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        deviceChip: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
        },
        deviceChipSelected: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        deviceChipText: {
            fontSize: 16,
            color: theme.textSecondary,
        },
        deviceChipTextSelected: {
            color: theme.textInverse,
            fontWeight: '600',
        },
        hintText: {
            fontSize: 14,
            color: theme.textTertiary,
            marginTop: 8,
            fontStyle: 'italic',
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.label}>{t('editor.guideTitle')}</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('editor.titlePlaceholder')}
                    placeholderTextColor={theme.inputPlaceholder}
                    accessibilityLabel={t('editor.guideTitle')}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>{t('editor.category')}</Text>
                <View style={styles.picker}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        dropdownIconColor={theme.primary}
                        style={{ color: theme.textPrimary }} // Ensure text is visible
                    >
                        {CATEGORIES.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>
                </View>
            </View>


            <View style={styles.section}>
                <Text style={styles.label}>{t('editor.deviceSupport') || 'Device Support'}</Text>
                <View style={styles.deviceRow}>
                    {DEVICE_FAMILIES.map((df) => {
                        const isSelected = deviceFamilies.includes(df.value);
                        return (
                            <Pressable
                                key={df.value}
                                onPress={() => toggleDeviceFamily(df.value)}
                                style={[
                                    styles.deviceChip,
                                    isSelected && styles.deviceChipSelected
                                ]}
                                accessibilityLabel={df.label}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: isSelected }}
                            >
                                <Text style={[
                                    styles.deviceChipText,
                                    isSelected && styles.deviceChipTextSelected
                                ]}>
                                    {df.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                {deviceFamilies.length === 0 && (
                    <Text style={styles.hintText}>No device selected. Defaulting to 'N/A'.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>{t('editor.steps')}</Text>
                {errors.steps && <Text style={styles.errorText}>{errors.steps}</Text>}

                {steps.map((step, index) => (
                    <StepEditor
                        key={index} // Using index as key since simple list. Ideally use unique ID if available.
                        step={step}
                        index={index}
                        totalSteps={steps.length}
                        onUpdate={(updated) => handleUpdateStep(index, updated)}
                        onDelete={() => handleDeleteStep(index)}
                        onMoveUp={() => handleMoveStep(index, 'up')}
                        onMoveDown={() => handleMoveStep(index, 'down')}
                    />
                ))}

                <Pressable
                    onPress={handleAddStep}
                    style={styles.addStepButton}
                    accessibilityLabel={t('editor.addStep')}
                    accessibilityRole="button"
                >
                    <Text style={styles.addStepText}>+ {t('editor.addStep')}</Text>
                </Pressable>
            </View>

            <View style={styles.buttonRow}>
                <Pressable
                    onPress={onCancel}
                    style={[styles.button, styles.cancelButton]}
                    accessibilityLabel={t('common.cancel')}
                    accessibilityRole="button"
                >
                    <Text style={[styles.buttonText, styles.cancelText]}>{t('common.cancel')}</Text>
                </Pressable>

                <Pressable
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton]}
                    accessibilityLabel={t('common.save')}
                    accessibilityRole="button"
                >
                    <Text style={[styles.buttonText, styles.saveText]}>{t('common.save')}</Text>
                </Pressable>
            </View>

            {
                isEditMode && onDelete && (
                    <Pressable
                        onPress={() => {
                            Alert.alert(
                                t('editor.deleteGuideTitle'),
                                t('editor.deleteGuideConfirm'),
                                [
                                    { text: t('common.cancel'), style: 'cancel' },
                                    { text: t('common.delete'), style: 'destructive', onPress: onDelete }
                                ]
                            );
                        }}
                        style={[styles.button, styles.deleteButton]}
                        accessibilityLabel={t('editor.deleteGuide')}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.buttonText, styles.deleteText]}>{t('editor.deleteGuide')}</Text>
                    </Pressable>
                )
            }
        </View >
    );
}
