import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type Row = {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  count: number;
};

const LEADERBOARD_URL =
  'https://todolist-backend-oakw.onrender.com/leaderboard';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(LEADERBOARD_URL, {});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows: Row[] = Array.isArray(data) ? data : data?.top ?? [];
      setLeaders(rows);
      setError(null);
    } catch (e: any) {
      setError('Failed to load leaderboard. Pull to refresh to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Leaderboard</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={leaders}
        keyExtractor={(item, idx) => item.uid || item.email || String(idx)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
            tintColor="#fff"
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.user}>
                {item.displayName || item.email || item.uid || 'Unknown'}
              </Text>
              <Text style={styles.sub}> tasks</Text>
            </View>
            <Text style={styles.count}>{item.count}</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No data available</Text> : null
        }
        contentContainerStyle={
          leaders.length === 0
            ? { flexGrow: 1, justifyContent: 'center' }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1220',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121a33',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rank: { width: 28, color: '#93a0c6', fontWeight: '700', fontSize: 16 },
  user: { color: 'white', fontSize: 16 },
  sub: { color: '#93a0c6', fontSize: 12 },
  count: { color: '#ffb84d', fontWeight: '700', fontSize: 18, marginLeft: 8 },
  error: { color: '#ff6b6b', textAlign: 'center', marginBottom: 8 },
  empty: { color: '#93a0c6', textAlign: 'center' },
});
