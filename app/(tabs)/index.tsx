import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Platform,
  ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router'; // Pievienots routeris
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp, API } from '../../components/AppContext';
import TrackCard from '../../components/TrackCard';

const COLORS = [
  '#00cfff','#a855f7','#f59e0b','#10b981',
  '#ef4444','#6366f1','#ec4899','#22d3ee',
];

type SortKey = 'default' | 'title' | 'artist' | 'plays';

export default function HomeScreen() {
  const { tracks, setTracks, t, user } = useApp();
  const router = useRouter(); // Inicializējam routeri
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [sort, setSort]             = useState<SortKey>('default');

  const loadTracks = async () => {
    try {
      setError('');
      setLoading(true);
      const r = await fetch(`${API}/api/tracks`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setTracks(Array.isArray(d) ? d : (d.tracks || []));
    } catch (e: any) {
      setError(t.serverError || 'Nevar savienoties ar serveri.');
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

  const filtered = useMemo(() => {
    let list = [...tracks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tr: any) =>
        tr.title?.toLowerCase().includes(q) ||
        tr.artist?.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'title':  list.sort((a,b) => (a.title||'').localeCompare(b.title||'')); break;
      case 'artist': list.sort((a,b) => (a.artist||'').localeCompare(b.artist||'')); break;
      case 'plays':  list.sort((a,b) => (b.plays||0) - (a.plays||0)); break;
      default: break; 
    }
    return list;
  }, [tracks, search, sort]);

  const SORTS: [SortKey, string][] = [
    ['default', '🆕 Jaunākās'],
    ['plays',   '🔥 Populāri'],
    ['title',   '🔤 A–Z'],
    ['artist',  '🎤 Mākslinieks'],
  ];

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>👋 {user?.username || 'Viesis'}</Text>
          <Text style={s.logo}>SoundPulse</Text>
        </View>
        
        {/* Šeit parādīsies poga, ja esi ielogojies kā admins */}
        {user?.isAdmin && (
          <TouchableOpacity 
            onPress={() => router.push('/admin')}
            style={s.adminBtn}
          >
            <Ionicons name="add-circle" size={26} color="#00cfff" />
          </TouchableOpacity>
        )}
        
        <Text style={s.count}>{tracks.length} {t.tracksCount}</Text>
      </View>

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={17} color="#555" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor="#444"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── Sort chips ── */}
      <View style={s.sortRow}>
        {SORTS.map(([id, label]) => (
          <TouchableOpacity
            key={id}
            style={[s.sortChip, sort === id && s.sortChipActive]}
            onPress={() => setSort(id)}
          >
            <Text style={[s.sortTxt, sort === id && s.sortTxtActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Error ── */}
      {!!error && (
        <View style={s.errorBox}>
          <Text style={s.errorTxt}>{error}</Text>
          <TouchableOpacity onPress={loadTracks} style={s.retryBtn}>
            <Text style={s.retryTxt}>↻</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 150 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00cfff" />}
        renderItem={({ item, index }: any) => (
          <TrackCard track={item} index={index} accentColor={COLORS[index % COLORS.length]} showAddBtn />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            {loading ? (
              <ActivityIndicator size="large" color="#00cfff" />
            ) : (
              <>
                <Ionicons name="musical-notes-outline" size={60} color="#222" />
                <Text style={s.emptyTxt}>{t.noTracks}</Text>
                {user?.isAdmin && (
                   <TouchableOpacity onPress={() => router.push('/admin')} style={s.bigAdminBtn}>
                      <Text style={s.bigAdminBtnTxt}>➕ PIEVIENOT DZIESMAS</Text>
                   </TouchableOpacity>
                )}
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
    paddingBottom: 14,
    backgroundColor: '#111118',
  },
  greeting: { color: '#555', fontSize: 12 },
  logo:     { fontSize: 24, fontWeight: '900', color: '#00cfff', marginTop: 2 },
  count:    { color: '#333', fontSize: 12, paddingBottom: 2 },
  adminBtn: { padding: 5, marginBottom: -5 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111118',
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1e1e2a',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  sortRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  sortChip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, backgroundColor: '#111118', borderWidth: 1, borderColor: '#1e1e2a' },
  sortChipActive: { backgroundColor: '#00cfff22', borderColor: '#00cfff55' },
  sortTxt:       { color: '#444', fontSize: 11, fontWeight: '600' },
  sortTxtActive: { color: '#00cfff' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a0a0a', margin: 12, borderRadius: 12, padding: 12, gap: 8 },
  errorTxt:  { color: '#ef4444', fontSize: 12, flex: 1 },
  retryBtn:  { backgroundColor: '#ef444422', borderRadius: 8, padding: 5 },
  retryTxt:  { color: '#ef4444', fontWeight: 'bold' },
  empty:    { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTxt: { color: '#444', fontSize: 15 },
  bigAdminBtn: { backgroundColor: '#00cfff', padding: 15, borderRadius: 12, marginTop: 10 },
  bigAdminBtnTxt: { color: '#000', fontWeight: 'bold' }
});