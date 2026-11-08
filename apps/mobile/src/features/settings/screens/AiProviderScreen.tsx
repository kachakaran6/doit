import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Screen, LargeHeader, Text, Button, Card, Input, Chip, Switch } from '../../../components/ui';
import { http } from '../../../lib/http';
import { KeyRound, Sparkles } from 'lucide-react-native';

const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];

export const AiProviderScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing, radius } = useTheme();
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('not configured');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await http.get<any>('/me/ai-providers').catch(() => null);
    setNotice(res?.notice || '');
    const row = res?.credentials?.[0];
    if (row) {
      setModel(row.model || 'gpt-4o-mini');
      setEnabled(row.enabled !== false);
      setHint(row.keyHint);
      setStatus(`${row.status}${row.lastTestedAt ? ` · tested ${new Date(row.lastTestedAt).toLocaleString()}` : ''}`);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader title="AI Provider" onBack={() => navigation.goBack()} />
      <View style={{ gap: spacing.lg, paddingBottom: 48 }}>
        {notice ? (
          <View style={{ padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.accentSoft }}>
            <Text variant="caption" color="accent">{notice}</Text>
          </View>
        ) : null}

        {/* Status Card */}
        <Card variant="surface1">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            <Sparkles size={18} color={colors.accentText} />
            <Text variant="headline">OpenAI Integration</Text>
          </View>
          <Text variant="caption" color="secondary">
            Status: <Text variant="caption" color={status.includes('valid') ? 'accent' : 'secondary'}>{status}</Text>
            {hint ? ` · key ••••${hint}` : ''}
          </Text>
          <View style={{ height: 1, backgroundColor: colors.hairline, marginVertical: spacing.md }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyStrong">Enable AI Assistant</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
        </Card>

        {/* API Key Input Section */}
        <Card variant="surface1">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <KeyRound size={16} color={colors.textSecondary} />
            <Text variant="headline">API Key</Text>
          </View>
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.sm }}>
            The key is encrypted on the server and is never returned in plaintext.
          </Text>
          <Input
            value={apiKey}
            onChangeText={setApiKey}
            placeholder={hint ? '•••••••••••••••• (Leave blank to keep)' : 'Enter OpenAI API Key'}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Card>

        {/* Model Selection */}
        <Card variant="surface1">
          <Text variant="headline" style={{ marginBottom: spacing.xs }}>Default Model</Text>
          <Text variant="caption" color="secondary" style={{ marginBottom: spacing.md }}>
            Select the model used for bug structuring and task context prompts.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {MODELS.map((item) => {
              const selected = model === item;
              return (
                <Chip
                  key={item}
                  label={item}
                  selected={selected}
                  onPress={() => setModel(item)}
                />
              );
            })}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ gap: spacing.sm }}>
          <Button
            title="Save Configuration"
            loading={busy}
            variant="primary"
            onPress={async () => {
              try {
                setBusy(true);
                await http.put('/me/ai-providers/openai', {
                  model,
                  enabled,
                  ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
                });
                setApiKey('');
                await load();
                Alert.alert('Saved', 'AI provider configuration saved successfully.');
              } catch (err: any) {
                Alert.alert('Save failed', err?.message || 'Could not save AI provider settings.');
              } finally {
                setBusy(false);
              }
            }}
          />

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Test Connection"
                variant="secondary"
                disabled={busy}
                onPress={async () => {
                  try {
                    setBusy(true);
                    const res = await http.post<any>('/me/ai-providers/openai/test', {});
                    await load();
                    Alert.alert('Connection Test', res?.valid ? 'The provider accepted this key.' : 'Key test completed.');
                  } catch (err: any) {
                    Alert.alert('Test Failed', err?.message || 'The provider could not be reached.');
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Button
                title="Remove Key"
                variant="danger"
                disabled={busy}
                onPress={() => {
                  Alert.alert('Remove OpenAI Key', 'Are you sure you want to remove your API key?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          setBusy(true);
                          await http.delete('/me/ai-providers/openai');
                          setHint(null);
                          setStatus('not configured');
                          Alert.alert('Removed', 'OpenAI API key removed.');
                        } catch (err: any) {
                          Alert.alert('Removal Error', err?.message || 'Could not remove key.');
                        } finally {
                          setBusy(false);
                        }
                      },
                    },
                  ]);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
};
