import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  InputAccessoryView,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useKeyboardBar } from '../../core/providers/KeyboardProvider';
import { KeyboardChip } from './KeyboardChip';
import { Text } from './Text';
import {
  Mic,
  Paperclip,
  Send,
  Calendar,
  Flag,
  Tag,
  CheckSquare,
  AlertCircle,
  AtSign,
  Palette,
} from 'lucide-react-native';

export interface KeyboardAccessoryBarProps {
  nativeID?: string;
  onSend?: () => void;
  onVoice?: () => void;
  onVoiceLongPress?: () => void;
  onAttach?: () => void;
}

export const KeyboardAccessoryBar: React.FC<KeyboardAccessoryBarProps> = ({
  nativeID = 'samyukt-keyboard-accessory',
  onSend,
  onVoice,
  onVoiceLongPress,
  onAttach,
}) => {
  const { colors, spacing } = useTheme();
  const { keyboardContext, isKeyboardVisible, keyboardHeight, onAction, activeValues } =
    useKeyboardBar();

  if (!isKeyboardVisible && Platform.OS !== 'ios') {
    return null;
  }

  const triggerAction = (actionId: string, payload?: any) => {
    if (onAction) {
      onAction(actionId, payload);
    }
  };

  const renderContextChips = () => {
    switch (keyboardContext) {
      case 'task_title':
        return (
          <>
            <KeyboardChip
              label="Today"
              icon={<Calendar size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('due_date', 'today')}
            />
            <KeyboardChip
              label="Tomorrow"
              onPress={() => triggerAction('due_date', 'tomorrow')}
            />
            <KeyboardChip
              label="Priority"
              value={activeValues['priority']}
              icon={<Flag size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('pick_priority')}
            />
            <KeyboardChip
              label="Label"
              icon={<Tag size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('pick_label')}
            />
            <KeyboardChip
              label="Voice"
              icon={<Mic size={13} color={colors.accentText} />}
              onPress={() => (onVoice ? onVoice() : triggerAction('voice'))}
            />
          </>
        );

      case 'task_desc':
        return (
          <>
            <KeyboardChip
              label="Voice"
              icon={<Mic size={13} color={colors.accentText} />}
              onPress={() => (onVoice ? onVoice() : triggerAction('voice'))}
            />
            <KeyboardChip
              label="Attach"
              icon={<Paperclip size={13} color={colors.textSecondary} />}
              onPress={() => (onAttach ? onAttach() : triggerAction('attach'))}
            />
            <KeyboardChip
              label="Checklist"
              icon={<CheckSquare size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('insert_checklist')}
            />
          </>
        );

      case 'bug_desc':
        return (
          <>
            <KeyboardChip
              label="Severity"
              value={activeValues['severity']}
              icon={<AlertCircle size={13} color={colors.danger} />}
              onPress={() => triggerAction('pick_severity')}
            />
            <KeyboardChip
              label="Screenshot"
              icon={<Paperclip size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('attach_screenshot')}
            />
            <KeyboardChip
              label="Voice"
              icon={<Mic size={13} color={colors.accentText} />}
              onPress={() => (onVoice ? onVoice() : triggerAction('voice'))}
            />
          </>
        );

      case 'comment':
        return (
          <>
            <KeyboardChip
              label="Voice"
              icon={<Mic size={13} color={colors.accentText} />}
              onPress={() => (onVoice ? onVoice() : triggerAction('voice'))}
            />
            <KeyboardChip
              label="Mention"
              icon={<AtSign size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('mention')}
            />
          </>
        );

      case 'sticky_body':
        return (
          <>
            <KeyboardChip
              label="Color"
              icon={<Palette size={13} color={colors.textSecondary} />}
              onPress={() => triggerAction('pick_color')}
            />
            <KeyboardChip
              label="Convert to Task"
              onPress={() => triggerAction('convert_to_task')}
            />
            <KeyboardChip
              label="Pin"
              onPress={() => triggerAction('toggle_pin')}
            />
          </>
        );

      case 'search':
        return (
          <>
            <KeyboardChip label="Recent" onPress={() => triggerAction('recent')} />
            <KeyboardChip label="Filters" onPress={() => triggerAction('filters')} />
            <KeyboardChip label="Clear" onPress={() => triggerAction('clear')} />
          </>
        );

      default:
        return (
          <>
            <KeyboardChip
              label="Voice"
              icon={<Mic size={13} color={colors.accentText} />}
              onPress={() => (onVoice ? onVoice() : triggerAction('voice'))}
            />
            <KeyboardChip
              label="Attach"
              icon={<Paperclip size={13} color={colors.textSecondary} />}
              onPress={() => (onAttach ? onAttach() : triggerAction('attach'))}
            />
          </>
        );
    }
  };

  const content = (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.bgSubtle,
          borderTopColor: colors.border,
          bottom: 0,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { gap: spacing.xs }]}
      >
        {renderContextChips()}
      </ScrollView>

      {/* Pinned Send Chip on the right */}
      <Pressable
        onPress={() => {
          if (onSend) onSend();
          else triggerAction('send');
        }}
        accessibilityRole="button"
        accessibilityLabel="Send or save item"
        style={[styles.sendButton, { backgroundColor: colors.accent, marginHorizontal: spacing.sm }]}
      >
        <Send size={16} color={colors.accentOnPrimary} />
      </Pressable>
    </View>
  );

  if (Platform.OS === 'ios') {
    return <InputAccessoryView nativeID={nativeID}>{content}</InputAccessoryView>;
  }

  return content;
};

const styles = StyleSheet.create({
  bar: {
    height: 44,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
