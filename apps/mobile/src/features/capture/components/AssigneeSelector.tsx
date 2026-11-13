import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp, Check, Search, User } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';

export interface MemberItem {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface AssigneeSelectorProps {
  members: MemberItem[];
  selectedAssigneeId: string | null;
  defaultAssigneeId: string | null;
  onSelectAssignee: (memberId: string) => void;
  isLoading?: boolean;
}

export const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  members,
  selectedAssigneeId,
  defaultAssigneeId,
  onSelectAssignee,
  isLoading = false,
}) => {
  const { colors, radius } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedMember = members.find((m) => m.id === selectedAssigneeId);
  const isDefaultSelected = selectedAssigneeId === defaultAssigneeId;

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );

  const getInitials = (name: string): string => {
    return (
      name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => setIsOpen((prev) => !prev)}
        style={[
          styles.row,
          {
            backgroundColor: colors.surface2,
            borderColor: isOpen ? colors.accent : colors.hairline,
            borderRadius: radius.md,
          },
        ]}
        activeOpacity={0.7}
        accessibilityRole="combobox"
        accessibilityLabel="Select Assignee"
        accessibilityState={{ expanded: isOpen }}
      >
        <View style={styles.leftContent}>
          {selectedMember ? (
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text style={[styles.avatarInitials, { color: colors.accentOnPrimary }]}>
                {getInitials(selectedMember.name)}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: colors.surface3,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <User size={13} color={colors.textTertiary} />
            </View>
          )}

          <View style={styles.nameRow}>
            <Text
              variant="body"
              numberOfLines={1}
              style={[
                styles.assigneeText,
                {
                  color: selectedMember ? colors.textPrimary : colors.textTertiary,
                  fontWeight: selectedMember ? '600' : '400',
                },
              ]}
            >
              {isLoading
                ? 'Loading assignees...'
                : selectedMember
                ? selectedMember.name
                : 'Select assignee *'}
            </Text>
            {selectedMember && isDefaultSelected && (
              <Text
                variant="caption"
                style={[styles.defaultBadge, { color: colors.textTertiary }]}
              >
                (Default)
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightContent}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : isOpen ? (
            <ChevronUp size={16} color={colors.textTertiary} />
          ) : (
            <ChevronDown size={16} color={colors.textTertiary} />
          )}
        </View>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surface2,
              borderColor: colors.hairline,
              borderRadius: radius.md,
            },
          ]}
        >
          {members.length > 4 && (
            <View style={[styles.searchBox, { borderBottomColor: colors.hairline }]}>
              <Search size={14} color={colors.textTertiary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search assignees..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.searchInput, { color: colors.textPrimary }]}
              />
            </View>
          )}

          <View style={styles.list}>
            {filteredMembers.map((member) => {
              const isSelected = member.id === selectedAssigneeId;
              const isDefault = member.id === defaultAssigneeId;
              return (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => {
                    onSelectAssignee(member.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  style={[
                    styles.item,
                    isSelected && { backgroundColor: colors.accentSoft },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberLeft}>
                    <View
                      style={[
                        styles.avatarCircleSmall,
                        {
                          backgroundColor: isSelected ? colors.accent : colors.surface3,
                          borderRadius: radius.pill,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarInitialsSmall,
                          { color: isSelected ? colors.accentOnPrimary : colors.textPrimary },
                        ]}
                      >
                        {getInitials(member.name)}
                      </Text>
                    </View>

                    <View style={styles.memberInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text
                          variant="body"
                          numberOfLines={1}
                          style={[
                            styles.itemText,
                            {
                              color: isSelected ? colors.accentText : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {member.name}
                        </Text>
                        {isDefault && (
                          <Text variant="caption" style={{ color: colors.textTertiary, fontSize: 11 }}>
                            (Default)
                          </Text>
                        )}
                      </View>
                      {member.email ? (
                        <Text
                          variant="caption"
                          numberOfLines={1}
                          style={{ color: colors.textTertiary, fontSize: 11 }}
                        >
                          {member.email}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {isSelected && <Check size={16} color={colors.accentText} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}

            {filteredMembers.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="caption" style={{ color: colors.textTertiary }}>
                  {members.length === 0 ? 'No members in this project' : 'No matching members'}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 10,
    fontWeight: '700',
  },
  avatarCircleSmall: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsSmall: {
    fontSize: 10,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  assigneeText: {
    fontSize: 14,
    flexShrink: 1,
  },
  defaultBadge: {
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    maxHeight: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  list: {
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 38,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 13,
  },
  emptyState: {
    padding: 12,
    alignItems: 'center',
  },
});
