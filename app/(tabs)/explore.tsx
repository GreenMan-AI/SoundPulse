import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { tracks, t, accentColor, colors } = useApp();
  const { width, height } = useWindowDimensions();
  const isTablet    = width >= 768;
  const isLandscape = width > height;
  const numColumns  = isTablet ? (isLandscape ? 3 : 2) : (isLandscape ? 2 : 1);

  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState<SortKey>('title');
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    let list = [...tracks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tr: any) =>
        tr.title?.toLowerCase().includes(q) ||
        tr.artist?.toLowerCase().includes(q)
      );
    }
    if (sort === 'plays')  list.sort((a: any, b: any) => (b.plays || 0) - (a.plays || 0));
    if (sort === 'title')  list.sort((a: any, b: any) => (a.title  || '').localeCompare(b.title  || ''));
    if (sort === 'artist') list.sort((a: any, b: any) => (a.artist || '').localeCompare(b.artist || ''));
    return list;
  }, [tracks, search, sort]);

  const SORTS: [SortKey, string, string][] = [
    ['title',  '🔤', 'Nosaukums'],
    ['artist', '🎤', 'Izpildītājs'],
    ['plays',  '🔥', 'Populāri'],
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      {/* Meklēšanas lauks */}
      <View style={[s.searchWrap, {
        backgroundColor: colors.card,
        borderColor: focused ? accentColor : colors.border,
        margin: 12, marginBottom: 8,
      }]}>
        <Ionicons name="search" size={18} color={focused ? accentColor : colors.subText} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder={t.searchPlaceholder ?? 'Meklēt dziesmas...'}
          placeholderTextColor={colors.subText}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.subText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort + skaits */}
      <View style={s.sortRow}>
        {SORTS.map(([id, emoji, label]) => (
          <TouchableOpacity
            key={id}
            style={[s.chip, {
              backgroundColor: sort === id ? accentColor : colors.card,
              borderColor:     sort === id ? accentColor : colors.border,
            }]}
            onPress={() => setSort(id)}
          >
            <Text style={s.chipEmoji}>{emoji}</Text>
            <Text style={[s.chipTxt, { color: sort === id ? '#000' : colors.subText }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={[s.countBadge, { backgroundColor: accentColor + '18', marginLeft: 'auto' }]}>
          <Text style={[s.countTxt, { color: accentColor }]}>{filtered.length}</Text>
        </View>
      </View>

      {/* Saraksts */}
      <FlatList
        key={`exp-${numColumns}`}
        numColumns={numColumns}
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 16 : 8,
          paddingTop: 4,
          paddingBottom: 160,
        }}
        columnWrapperStyle={numColumns > 1 ? { gap: 8 } : undefined}
        renderItem={({ item, index }: any) => (
          <View style={{ flex: 1 / numColumns }}>
            <TrackCard
              track={item}
              index={index}
              accentColor={COLORS[index % COLORS.length]}
              showAddBtn
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={56} color={colors.border} />
            <Text style={[s.emptyTitle, { color: colors.subText }]}>
              {search ? (t.noResults ?? 'Nav rezultātu') : (t.noTracks ?? 'Nav dziesmu')}
            </Text>
            {!!search && (
              <Text style={[s.emptyHint, { color: colors.border }]}>
                Mēģini citu meklēšanas vārdu
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  searchWrap:  {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  sortRow:     {
    flexDirection: 'row', paddingHorizontal: 12,
    gap: 8, paddingBottom: 8, alignItems: 'center',
  },
  chip:        {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  chipEmoji:   { fontSize: 12 },
  chipTxt:     { fontSize: 12, fontWeight: '600' },
  countBadge:  { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  countTxt:    { fontSize: 12, fontWeight: '800' },
  empty:       { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle:  { fontSize: 16, fontWeight: '600' },
  emptyHint:   { fontSize: 13 },
});
