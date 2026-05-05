import {
  View, Text, StyleSheet, FlatList, TextInput,
  RefreshControl, ActivityIndicator, useWindowDimensions,
  TouchableOpacity, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp, API } from '../../components/AppContext';
import TrackCard from '../../components/TrackCard';

const COLORS = [
  '#00cfff','#a855f7','#f59e0b','#10b981',
  '#ef4444','#6366f1','#ec4899','#22d3ee',
];

type SortKey = 'default' | 'plays' | 'title' | 'artist';

export default function HomeScreen() {
  const { tracks, setTracks, accentColor, colors, t } = useApp();
  const { width, height } = useWindowDimensions();
  const isTablet    = width >= 768;
  const isLandscape = width > height;
  const numColumns  = isTablet ? (isLandscape ? 3 : 2) : 1;

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [sort, setSort]             = useState<SortKey>('default');
  const [focused, setFocused]       = useState(false);

  const loadTracks = async () => {
    try {
      const r = await fetch(`${API}/api/tracks`);
      const d = await r.json();
      setTracks(Array.isArray(d) ? d : (d.tracks || []));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadTracks(); }, []);

  const featured = useMemo(() =>
    [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6),
    [tracks]
  );

  const filtered = useMemo(() => {
    let list = [...tracks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tr: any) =>
        tr.title?.toLowerCase().includes(q) ||
        tr.artist?.toLowerCase().includes(q)
      );
    }
    if (sort === 'plays')  list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    if (sort === 'title')  list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (sort === 'artist') list.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
    return list;
  }, [tracks, search, sort]);

  const SORTS: [SortKey, string, string][] = [
    ['default', '🆕', 'Jaunākās'],
    ['plays',   '🔥', 'Populāri'],
    ['title',   '🔤', 'A–Z'],
    ['artist',  '🎤', 'Mākslinieks'],
  ];

  if (loading) return (
    <View style={[s.center, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={accentColor} />
    </View>
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <FlatList
        key={`home-${numColumns}`}
        numColumns={numColumns}
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 160 }}
        columnWrapperStyle={numColumns > 1 ? { gap: 8 } : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadTracks(); }}
            tintColor={accentColor}
            colors={[accentColor]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Search */}
            <View style={[s.searchBox, {
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

            {/* Sort chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.sortRow}
            >
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
            </ScrollView>

            {/* Featured — tikai bez meklēšanas */}
            {!search && sort === 'default' && featured.length > 0 && (
              <View style={s.featuredSection}>
                <Text style={[s.sectionTitle, { color: colors.text }]}>
                  🔥 {t.popularTracks ?? 'Populārākās'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingRight: 12 }}
                >
                  {featured.map((tr: any, i: number) => (
                    <FeaturedCard key={tr._id} track={tr} rank={i + 1} color={COLORS[i % COLORS.length]} />
                  ))}
                </ScrollView>
                <Text style={[s.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                  🎵 {t.allTracks ?? 'Visas dziesmas'}
                </Text>
              </View>
            )}
          </View>
        }
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
            <Ionicons name="musical-notes-outline" size={60} color={colors.border} />
            <Text style={[s.emptyTxt, { color: colors.subText }]}>
              {search ? t.noResults ?? 'Nav rezultātu' : t.noTracks ?? 'Nav dziesmu'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ── Featured kartīte ──
function FeaturedCard({ track, rank, color }: { track: any; rank: number; color: string }) {
  const { setPlaying, playing, isPlaying, colors } = useApp();
  const isActive = playing?._id === track._id;

  return (
    <TouchableOpacity
      style={[fc.card, {
        backgroundColor: color + '15',
        borderColor: isActive ? color : color + '30',
        borderWidth: isActive ? 2 : 1,
      }]}
      onPress={() => setPlaying(track)}
      activeOpacity={0.8}
    >
      <View style={[fc.cover, { backgroundColor: color + '22' }]}>
        {track.coverUrl
          ? <Image source={{ uri: track.coverUrl }} style={fc.coverImg} />
          : <Ionicons name="musical-notes" size={28} color={color} />
        }
        <View style={[fc.rank, { backgroundColor: color }]}>
          <Text style={fc.rankTxt}>#{rank}</Text>
        </View>
        {isActive && (
          <View style={[fc.overlay, { backgroundColor: color + 'cc' }]}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[fc.title, { color: isActive ? color : colors.text }]} numberOfLines={2}>
        {track.title || '—'}
      </Text>
      <Text style={[fc.artist, { color: colors.subText }]} numberOfLines={1}>
        {track.artist || '—'}
      </Text>
      {(track.plays || 0) > 0 && (
        <Text style={[fc.plays, { color: color }]}>{track.plays}▶</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBox:      {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, gap: 8,
  },
  searchInput:    { flex: 1, fontSize: 15, fontWeight: '600' },
  sortRow:        { paddingHorizontal: 12, paddingBottom: 10, gap: 6 },
  chip:           {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  chipEmoji:      { fontSize: 12 },
  chipTxt:        { fontSize: 12, fontWeight: '600' },
  featuredSection:{ paddingLeft: 8, paddingBottom: 4 },
  sectionTitle:   { fontSize: 16, fontWeight: '800', marginBottom: 12, paddingHorizontal: 4 },
  empty:          { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTxt:       { fontSize: 15 },
});

const fc = StyleSheet.create({
  card:    { width: 145, borderRadius: 16, padding: 10, gap: 5 },
  cover:   {
    width: 125, height: 125, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', marginBottom: 4,
  },
  coverImg:{ width: 125, height: 125, borderRadius: 12 },
  rank:    {
    position: 'absolute', top: 6, left: 6,
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  rankTxt: { color: '#000', fontSize: 10, fontWeight: '900' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  title:   { fontSize: 12, fontWeight: '700', lineHeight: 16 },
  artist:  { fontSize: 11 },
  plays:   { fontSize: 10, fontWeight: '700' },
});
