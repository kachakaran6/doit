import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckSquare, Bug } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';

export type CaptureType = 'task' | 'bug';

export interface CaptureTypeSelectorProps {
  type: CaptureType;
  onChangeType: (type: CaptureType) => void;
}

export const CaptureTypeSelector: React.FC<CaptureTypeSelectorProps> = ({
  type,
  onChangeType,
}) => {
  const { colors, radius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface2, borderColor: colors.hairline, borderRadius: radius.md }]}>
      <TouchableOpacity
        onPress={() => onChangeType('task')}
        style={[
          styles.segment,
          { borderRadius: radius.sm },
          type === 'task' && [styles.activeSegment, { backgroundColor: colors.accent }],
        ]}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: type === 'task' }}
        accessibilityLabel="Task type"
      >
        <CheckSquare
          size={15}
          color={type === 'task' ? colors.accentOnPrimary : colors.textSecondary}
          strokeWidth={2}
        />
        <Text
          variant="body"
          style={[
            styles.segmentText,
            {
              color: type === 'task' ? colors.accentOnPrimary : colors.textSecondary,
              fontWeight: type === 'task' ? '700' : '500',
            },
          ]}
        >
          Task
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChangeType('bug')}
        style={[
          styles.segment,
          { borderRadius: radius.sm },
          type === 'bug' && [styles.activeSegment, { backgroundColor: colors.accent }],
        ]}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: type === 'bug' }}
        accessibilityLabel="Bug type"
      >
        <Bug
          size={15}
          color={type === 'bug' ? colors.accentOnPrimary : colors.textSecondary}
          strokeWidth={2}
        />
        <Text
          variant="body"
          style={[
            styles.segmentText,
            {
              color: type === 'bug' ? colors.accentOnPrimary : colors.textSecondary,
              fontWeight: type === 'bug' ? '700' : '500',
            },
          ]}
        >
          Bug
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderWidth: 1,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 7,
  },
  activeSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
  },
});
