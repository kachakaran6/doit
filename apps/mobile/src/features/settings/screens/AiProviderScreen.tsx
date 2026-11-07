import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/useTheme';
import { Screen, LargeHeader, Text, Button } from '../../../components/ui';
import { http } from '../../../lib/http';

const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'];

export const AiProviderScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing } = useTheme();
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [hint, setHint] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('not configured');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await http.get<any>('/me/ai-providers');
    setNotice(res?.notice || '');
    const row = res?.credentials?.[0];
    if (row) {
      setModel(row.model);
      setEnabled(row.enabled);
      setHint(row.keyHint);
      setStatus(`${row.status}${row.lastTestedAt ? ` · tested ${new Date(row.lastTestedAt).toLocaleString()}` : ''}`);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <Screen scrollable includeBottomNavPadding={false}>
      <LargeHeader title="AI provider" onBack={() => navigation.goBack()} />
      <View style={{ gap: spacing.md, paddingBottom: 48 }}>
        <Text variant="caption" color="secondary">{notice}</Text>
        <Text variant="body">Status: {status}{hint ? ` · key ••••${hint}` : ''}</Text>
        <Text variant="caption" color="secondary">The key is encrypted on the server and is not shown again after saving.</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={hint ? 'Replace key (optional)' : 'API key'}
          placeholderTextColor={colors.textMuted}
          style={{ minHeight: 44, color: colors.textPrimary }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MODELS.map((item) => (
            <Button key={item} title={item} variant={model === item ? 'primary' : 'secondary'} onPress={() => setModel(item)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="body">Enabled</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
        <Button
          title="Save"
          loading={busy}
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
              Alert.alert('Saved', 'The key stays on the server.');
            } catch (err: any) {
              Alert.alert('Could not save', err?.message || 'Try again.');
            } finally {
              setBusy(false);
            }
          }}
        />
        <Button
          title="Test connection"
          variant="secondary"
          onPress={async () => {
            try {
              await http.post('/me/ai-providers/openai/test', {});
              await load();
              Alert.alert('Connected', 'The provider accepted this key.');
            } catch (err: any) {
              Alert.alert('Test failed', err?.message || 'The provider could not be reached.');
            }
          }}
        />
        <Button
          title="Remove key"
          variant="danger"
          onPress={async () => {
            await http.delete('/me/ai-providers/openai');
            setHint(null);
            setStatus('not configured');
          }}
        />
      </View>
    </Screen>
  );
};
