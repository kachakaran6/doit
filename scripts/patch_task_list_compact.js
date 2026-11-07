import fs from 'fs';

const p = 'apps/mobile/src/features/tasks/screens/TaskListScreen.tsx';
let c = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// 1. Replace the Card enclosure with View
const oldCardMarkup = `                {/* Grouped Card with 1px Inset Hairlines */}
                <Card
                  variant="surface1"
                  style={[styles.groupedCard, { borderRadius: radius.lg }]}
                >
                  {group.items.map((item, idx) => {
                    const isLast = idx === group.items.length - 1;

                    return (
                      <View key={item.id}>
                        <Pressable
                          style={styles.taskRow}
                          onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
                          onLongPress={() => handleConfirmDelete(item)}
                        >
                          <Checkbox
                            checked={item.status === 'DONE'}
                            onChange={() => handleToggleStatus(item.id, item.status)}
                          />
                          <View style={{ flex: 1, marginLeft: spacing.sm }}>
                            <Text
                              variant="bodyStrong"
                              numberOfLines={1}
                              style={item.status === 'DONE' ? styles.completedText : undefined}
                            >
                              {item.title}
                            </Text>
                            <View style={[styles.metaRow, { gap: spacing.xs, marginTop: 2 }]}>
                              {item.priority && <PriorityDot level={item.priority} />}
                              {item.dueDate && <DueText date={item.dueDate} />}
                              {item.humanId && (
                                <Text variant="caption" color="secondary">
                                  {item.humanId}
                                </Text>
                              )}
                            </View>
                          </View>
                        </Pressable>
                        {!isLast && (
                          <View
                            style={[
                              styles.hairlineDivider,
                              { backgroundColor: colors.hairline || colors.border },
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </Card>`;

const newCardMarkup = `                {/* Clean Task List (No background square, compact rows) */}
                <View style={styles.taskListContainer}>
                  {group.items.map((item, idx) => {
                    const isLast = idx === group.items.length - 1;

                    return (
                      <View key={item.id}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.taskRow,
                            pressed && { opacity: 0.6 },
                          ]}
                          onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
                          onLongPress={() => handleConfirmDelete(item)}
                        >
                          <Checkbox
                            checked={item.status === 'DONE'}
                            onChange={() => handleToggleStatus(item.id, item.status)}
                          />
                          <View style={{ flex: 1, marginLeft: spacing.sm }}>
                            <Text
                              variant="body"
                              numberOfLines={1}
                              style={[
                                styles.taskTitle,
                                item.status === 'DONE' ? styles.completedText : undefined,
                              ]}
                            >
                              {item.title}
                            </Text>
                            <View style={[styles.metaRow, { gap: spacing.xs, marginTop: 2 }]}>
                              {item.priority && <PriorityDot level={item.priority} />}
                              {item.dueDate && <DueText date={item.dueDate} />}
                              {item.humanId && (
                                <Text variant="caption" color="secondary" style={styles.humanIdText}>
                                  {item.humanId}
                                </Text>
                              )}
                            </View>
                          </View>
                        </Pressable>
                        {!isLast && (
                          <View
                            style={[
                              styles.hairlineDivider,
                              { backgroundColor: colors.hairline || colors.border },
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>`;

if (!c.includes(oldCardMarkup)) {
  console.error("Could not find oldCardMarkup");
  process.exit(1);
}
c = c.replace(oldCardMarkup, newCardMarkup);

// 2. Update styles: taskRow, taskListContainer, taskTitle, humanIdText
const oldStyles = `  groupedCard: {
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hairlineDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 46,
  },`;

const newStyles = `  taskListContainer: {
    paddingVertical: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  humanIdText: {
    fontSize: 11,
    lineHeight: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  hairlineDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 36,
    opacity: 0.35,
  },`;

if (!c.includes(oldStyles)) {
  console.error("Could not find oldStyles");
  process.exit(1);
}
c = c.replace(oldStyles, newStyles);

fs.writeFileSync(p, c, 'utf8');
console.log('Successfully updated TaskListScreen.tsx with compact borderless list!');

