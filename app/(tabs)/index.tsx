import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, RefreshControl, Platform, ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp, API } from '../../components/AppContext';
import TrackCard from '../../components/TrackCard';

const COLORS = ['#00cfff','#a855f7','#f59e0b','#10b981','#ef4444','#6366f1','#ec4899','#22d3ee'];

export default function HomeScreen() {
  const { tracks, setTracks, t, user } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const loadTracks = async () => {
    try {
      setError('');
      setLoading(true);
      const r = await fetch(`${API}/api/tracks`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setTracks(Array.isArray(d) ? d : (d.tracks || []));
    } catch (e: any) {
      setError('Nevar savienoties ar serveri. Pārbaudi internetu.');
      console.log('Tracks error:', e.message);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadTracks(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTracks();
    setRefreshing(false);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>👋 {user?.username || 'Viesis'}</Text>
          <Text style={s.logo}>SoundPulse</Text>
        </View>
        <Text style={s.count}>{tracks.length} {t.tracksCount || 'dziesmas'}</Text>
      </View>

      {/* Kļūdas paziņojums */}
      {!!error && (
        <View style={s.errorBox}>
          <Ionicons name="wifi-outline" size={16} color="#ef4444" />
          <Text style={s.errorTxt}>{error}</Text>
          <TouchableOpacity onPress={loadTracks} style={s.retryBtn}>
            <Text style={s.retryTxt}>Mēģināt vēlreiz</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#00cfff" 
          />
        }
        renderItem={({ item, index }) => (
          <TrackCard
            track={item}
            index={index}
            accentColor={COLORS[index % COLORS.length]}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#00cfff" />
                <Text style={s.emptyTxt}>{t.loading}</Text>
              </>
            ) : error ? null : (
              <>
                <Ionicons name="musical-notes-outline" size={60} color="#222" />
                <Text style={s.emptyTxt}>{t.noTracks}</Text>
                <Text style={s.emptySub}>Admins vēl nav pievienojis dziesmas</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 15,
    backgroundColor: '#111118',
  },
  greeting: { color: '#555', fontSize: 12 },
  logo: { fontSize: 24, fontWeight: '900', color: '#00cfff' },
  count: { color: '#333', fontSize: 12, paddingBottom: 2 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: '#1a0a0a', margin: 12, borderRadius: 10,
    padding: 12, gap: 8, borderWidth: 1, borderColor: '#ef444433',
  },
  errorTxt: { color: '#ef4444', fontSize: 12, flex: 1 },
  retryBtn: { backgroundColor: '#ef444422', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  retryTxt: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 100, gap: 12 },
  emptyTxt: { color: '#444', marginTop: 10, fontSize: 15 },
  emptySub: { color: '#333', fontSize: 12 },
});
