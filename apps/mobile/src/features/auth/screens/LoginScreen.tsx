import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Input } from '../../../components/ui';
import { useTheme } from '../../../theme/useTheme';
import { useLoginMutation } from '../api/mutations';
import { RootStackParamList } from '../../../navigation/types';

export const LoginScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('tester@samyukt.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const handleSignIn = async () => {
    setErrorMessage(null);
    try {
      await loginMutation.mutateAsync({ email, password });
      navigation.replace('MainTabs');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text variant="h1">
            Samyukt Doit
          </Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
            Sign in to access your workspace
          </Text>
        </View>

        {errorMessage && (
          <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.danger, padding: spacing.md }]}>
            <Text variant="caption" color="danger">
              {errorMessage}
            </Text>
          </View>
        )}

        <View style={[styles.form, { gap: spacing.md, marginTop: spacing.xl }]}>
          <Input
            label="Email"
            placeholder="tester@samyukt.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Sign In"
            variant="primary"
            loading={loginMutation.isPending}
            style={{ marginTop: spacing.md }}
            onPress={handleSignIn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 48,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
});
