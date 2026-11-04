import React, { useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { Surface } from './Surface';
import { Text } from './Text';
import { Checkbox } from './Checkbox';
import { PriorityDot, PriorityLevel } from './PriorityDot';
import { DueText } from './DueText';
import { LabelPill } from './LabelPill';
import { Avatar } from './Avatar';

export interface RowProps {
  id: string;
  humanId: string;
  title: string;
  done?: boolean;
  priority?: PriorityLevel;
  dueAt?: string | Date;
  labels?: Array<{ id: string; name: string }>;
  assignee?: { id: string; name: string; avatarUrl?: string };
  onPress?: () => void;
  onToggleDone?: () => void;
}

/**
 * P-01 Row (The Density & Anatomy Fix):
 * 06-COMPOSITION.md §6.3
 * - Checkbox: 28 visual, 44 hit area, left, vertically centred
 * - Meta row: label 12/500 — ID in textMuted, priority dot + name, due text
 * - Title: h3 18/600, max 2 lines, strikethrough if done
 * - Labels: 20px pills, only if present
 * - Avatar: 28, right, only if assigned
 * - Padding: 16 all around
 * - Min height: 96 (meta + title), 124 with labels
 * - Separated by Surface L1 (radius 20, no borders, top highlight)
 */
export const Row: React.FC<RowProps> = ({
  id,
  humanId,
  title,
  done = false,
  priority,
  dueAt,
  labels,
  assignee,
  onPress,
  onToggleDone,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const hasLabels = labels && labels.length > 0;
  const minHeight = hasLabels ? 124 : 96;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Surface level={1} radius="lg">
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.container, { minHeight }]}
        >
          {/* 44 Checkbox Column, vertically centred */}
          <View style={styles.checkboxCol}>
            <Checkbox checked={done} onPress={onToggleDone} />
          </View>

          {/* Main Info Column */}
          <View style={styles.mainCol}>
            {/* Meta Row: ID, Priority, Due Date */}
            <View style={styles.metaRow}>
              <Text variant="label" color="muted">
                {humanId}
              </Text>

              {priority && (
                <View style={styles.metaItem}>
                  <PriorityDot level={priority} withLabel />
                </View>
              )}

              {dueAt && (
                <View style={styles.metaItem}>
                  <DueText date={dueAt} />
                </View>
              )}
            </View>

            {/* Title */}
            <View style={styles.titleWrap}>
              <Text
                variant="h3"
                color={done ? 'secondary' : 'primary'}
                numberOfLines={2}
                style={done ? styles.doneTitle : undefined}
              >
                {title}
              </Text>
            </View>

            {/* Labels */}
            {hasLabels && (
              <View style={styles.labelsRow}>
                {labels.map((l) => (
                  <View key={l.id} style={{ marginRight: 6 }}>
                    <LabelPill id={l.id} name={l.name} />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Trailing Avatar (only if assigned) */}
          {assignee && (
            <View style={styles.avatarCol}>
              <Avatar
                id={assignee.id}
                name={assignee.name}
                imageUrl={assignee.avatarUrl}
                size={28}
              />
            </View>
          )}
        </Pressable>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // 16 padding all around per §6.3
  },
  checkboxCol: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  mainCol: {
    flex: 1,
    paddingLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWrap: {
    marginTop: 8, // 8 between meta and title per §6.4
  },
  doneTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10, // 10 between title and labels per §6.4
  },
  avatarCol: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

