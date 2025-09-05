import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async () => {
    const e = email.trim();
    const p = password;
    if (!e || !p) return;

    try {
      setBusy(true);
      if (mode === 'signin') {
        await auth().signInWithEmailAndPassword(e, p);
      } else {
        await auth().createUserWithEmailAndPassword(e, p);
      }
    } catch (err: any) {
      Alert.alert('Authentication error', err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </Text>

        <View style={styles.card}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#7c89b3"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#7c89b3"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity
            disabled={!email.trim() || !password || busy}
            onPress={go}
            style={[
              styles.btn,
              (!email.trim() || !password || busy) && styles.btnDisabled,
            ]}
          >
            <Text style={styles.btnText}>
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(m => (m === 'signin' ? 'signup' : 'signin'))}
          >
            <Text style={styles.link}>
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1220' },
  container: { flex: 1, padding: 16 },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 16,
  },
  card: { backgroundColor: '#121a33', borderRadius: 14, padding: 16, gap: 12 },
  input: {
    backgroundColor: '#1a2340',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
  },
  btn: {
    backgroundColor: '#4f7cff',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: 'white', fontWeight: '700' },
  link: { color: '#ffb84d', textAlign: 'center', marginTop: 8 },
});
