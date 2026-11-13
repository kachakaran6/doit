import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';

export interface CaptureFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  submitLabel?: string;
}

export const CaptureFooter: React.FC<CaptureFooterProps> = ({
  onCancel,
  onSubmit,
  isSubmitDisabled,
  isSubmitting,
  submitLabel = 'Submit',
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        onPress={onCancel}
        style={[
          styles.cancelButton,
          {
            backgroundColor: colors.surface2,
            borderColor: colors.hairline,
            borderRadius: 14,
            flex: 0.85,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Cancel capture"
      >
        <Text
          variant="body"
          style={[styles.cancelText, { color: colors.textSecondary }]}
        >
          Cancel
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitDisabled || isSubmitting}
        style={[
          styles.submitButton,
          {
            backgroundColor: isSubmitDisabled ? colors.surface3 : colors.accent,
            borderRadius: 14,
            opacity: isSubmitDisabled ? 0.6 : 1,
            flex: 1.15,
          },
        ]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        accessibilityState={{ disabled: isSubmitDisabled }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.accentOnPrimary} />
        ) : (
          <View style={styles.submitContent}>
            <Send
              size={14}
              color={isSubmitDisabled ? colors.textTertiary : colors.accentOnPrimary}
              strokeWidth={2.2}
            />
            <Text
              variant="body"
              style={[
                styles.submitText,
                {
                  color: isSubmitDisabled ? colors.textTertiary : colors.accentOnPrimary,
                },
              ]}
            >
              {submitLabel}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 46,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    minHeight: 42,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
