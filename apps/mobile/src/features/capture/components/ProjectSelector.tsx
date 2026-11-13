import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Folder, ChevronDown, ChevronUp, Check, Search } from 'lucide-react-native';
import { Text } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';

export interface ProjectItem {
  id: string;
  name: string;
}

export interface ProjectSelectorProps {
  projects: ProjectItem[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  isLoading?: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  isLoading = false,
}) => {
  const { colors, radius } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

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
        accessibilityLabel="Select Project"
        accessibilityState={{ expanded: isOpen }}
      >
        <View style={styles.leftContent}>
          <Folder
            size={17}
            color={selectedProjectId ? colors.accentText : colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            variant="body"
            numberOfLines={1}
            style={[
              styles.projectText,
              {
                color: selectedProject ? colors.textPrimary : colors.textTertiary,
                fontWeight: selectedProject ? '600' : '400',
              },
            ]}
          >
            {isLoading
              ? 'Loading projects...'
              : selectedProject
              ? selectedProject.name
              : 'Select project *'}
          </Text>
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
          {projects.length > 4 && (
            <View style={[styles.searchBox, { borderBottomColor: colors.hairline }]}>
              <Search size={14} color={colors.textTertiary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search projects..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.searchInput, { color: colors.textPrimary }]}
              />
            </View>
          )}

          <View style={styles.list}>
            {filteredProjects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              return (
                <TouchableOpacity
                  key={project.id}
                  onPress={() => {
                    onSelectProject(project.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  style={[
                    styles.item,
                    isSelected && { backgroundColor: colors.accentSoft },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="body"
                    numberOfLines={1}
                    style={[
                      styles.itemText,
                      {
                        color: isSelected ? colors.accentText : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
                    {project.name}
                  </Text>
                  {isSelected && <Check size={16} color={colors.accentText} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}

            {filteredProjects.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="caption" style={{ color: colors.textTertiary }}>
                  {projects.length === 0 ? 'No projects available' : 'No matching projects'}
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
    marginBottom: 8,
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
  projectText: {
    fontSize: 14,
    flexShrink: 1,
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
    paddingVertical: 9,
    minHeight: 40,
  },
  itemText: {
    fontSize: 13,
    flex: 1,
  },
  emptyState: {
    padding: 12,
    alignItems: 'center',
  },
});
