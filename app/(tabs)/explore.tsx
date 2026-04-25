import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../components/AppContext';
import TrackCard from '../../components/TrackCard';

const COLORS = [
  '#00cfff','#a855f7','#f59e0b','#10b981',
  '#ef4444','#6366f1','#ec4899','#22d3ee',
];

type SortKey = 'title' | 'artist' | 'plays';

export default function ExploreScreen() {
  const { tracks, t } = useApp();
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState<SortKey>('title');

  const filtered = useMemo(() => {
    let list = [...tracks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tr: any) =>
        tr.title?.toLowerCase().includes(q) ||
        tr.artist?.toLowerCase().includes(q)
      );
    }
    list.sort((a: any, b: any) => {
      if (sort === 'plays') return (b.plays || 0) - (a.plays || 0);
      return (a[sort] || '').toLowerCase()
        .localeCompare((b[sort] || '').toLowerCase());
    });
    return list;
  }, [tracks, search, sort]);

  const SORTS: [SortKey, string][] = [
    ['title',  '🔤 Nosaukums'],
    ['artist', '🎤 Izpildītājs'],
    ['plays',  '🔥 Populāri'],
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>🔍 {t.search}</Text>
      </View>

      <View style={s.searchBox}>
        <Ionicons name="search" size={17} color="#555" />
        <TextInput
          style={s.searchInput}
          placeholder={t.searchPlaceholder}
          placeholderTextColor="#333"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={17} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      <View style={s.sortRow}>
        {SORTS.map(([id, label]) => (
          <TouchableOpacity
            key={id}
            style={[s.sortBtn, sort === id && s.sortActive]}
            onPress={() => setSort(id)}
          >
            <Text style={[s.sortTxt, sort === id && s.sortTxtActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.resultCount}>{filtered.length} rezultāti</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 150 }}
        renderItem={({ item, index }: any) => (
          <TrackCard
            track={item}
            index={index}
            accentColor={COLORS[index % COLORS.length]}
            showAddBtn
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={50} color="#1a1a25" />
            <Text style={s.emptyTxt}>
              {search ? 'Nav rezultātu' : t.noTracks}
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
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14,
    backgroundColor: '#111118',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#00cfff' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111118',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e2a',
    gap: 8,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  sortRow: {
    flexDirection: 'row', paddingHorizontal: 12,
    gap: 8, marginBottom: 6,
  },
  sortBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#111118',
    borderWidth: 1, borderColor: '#1e1e2a',
  },
  sortActive: {
    backgroundColor: '#00cfff22',
    borderColor: '#00cfff55',
  },
  sortTxt: { color: '#444', fontSize: 12, fontWeight: '600' },
  sortTxtActive: { color: '#00cfff' },
  resultCount: {
    color: '#333', fontSize: 11,
    paddingHorizontal: 14, marginBottom: 4,
  },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTxt: { color: '#333', fontSize: 14 },
});
