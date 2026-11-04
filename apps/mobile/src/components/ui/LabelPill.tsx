import React from 'react';
import { View, StyleSheet } from 'react-native';
import { accentFor } from '@doit/design-tokens';
import { useTheme } from '../../theme/useTheme';
import { Text } from './Text';

export interface LabelPillProps {
  id: string;
  name?: string;
}

/**
 * P-01 LabelPill:
 * 04-COLOUR-AS-INFORMATION.md §4.4
 * 20px pill, radius 10: rgba(labelColour, 0.12) background, labelColour text.
 * Colors mapped via deterministic accentFor(labelId).
 */
export const LabelPill: React.FC<LabelPillProps> = ({ id, name }) => {
  const { mode } = useTheme();
  const labelAccent = accentFor(id);
  const color = mode === 'dark' ? labelAccent.accentTextDark : labelAccent.accentTextLight;
  const bg = mode === 'dark' ? labelAccent.tintDark : labelAccent.tintLight;

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text variant="caption" style={{ color, fontSize: 11, fontWeight: '500' }}>
        {name || id}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});

