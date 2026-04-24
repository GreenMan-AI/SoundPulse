import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, RefreshControl, Platform}from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp, API } from '../../components/AppContext';
import TrackCard from '../../components/TrackCard';

const COLORS = ['#00cfff','#a855f7','#f59e0b','#10b981','#ef4444','#6366f1','#ec4899','#22d3ee'];

export default function HomeScreen() {
  const { tracks, setTracks, t, user } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]   = useState(false);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/api/tracks`);
      const d = await r.json();
      setTracks(Array.isArray(d) ? d : (d.tracks || []));
    } catch (e) {
      console.log("Error loading tracks:", e);
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
      {/* Headeris, kas pats pielāgojas ierīces izmēram */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{t.welcomeBack || 'Sveicināts atpakaļ!'}</Text>
          <Text style={s.logo}>SoundPulse</Text>
        </View>
        <Text style={s.count}>{tracks.length} {t.tracksCount || 'dziesmas'}</Text>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
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
            <Ionicons name="musical-notes-outline" size={60} color="#222" />
            <Text style={{color: '#444', marginTop: 10}}>
              {loading ? t.loading : t.noTracks}
            </Text>
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
    // Šī rinda ir maģija: tā pasargā no kameras izgriezuma
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 15,
    backgroundColor: '#111118',
  },
  greeting: { color: '#555', fontSize: 12 },
  logo: { fontSize: 24, fontWeight: '900', color: '#00cfff' },
  count: { color: '#333', fontSize: 12, paddingBottom: 2 },
  empty: { alignItems: 'center', marginTop: 100 }
});