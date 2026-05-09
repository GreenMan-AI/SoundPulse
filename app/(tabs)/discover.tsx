import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useApp } from '../../components/AppContext';
import { Ionicons } from '@expo/vector-icons';
import TrackCard from '../../components/TrackCard';

const COLORS = [
  '#00cfff','#a855f7','#f59e0b','#10b981',
  '#ef4444','#6366f1','#ec4899','#22d3ee',
];

const CATEGORIES = [
  { id: 'all',    title: 'Visas',    icon: 'musical-notes', color: '#00cfff',  keywords: [] },
  { id: 'energy', title: 'Enerģijai',icon: 'flash',         color: '#f59e0b',  keywords: ['rock','metal','energy','power','fast','enerģija','spēks'] },
  { id: 'relax',  title: 'Atpūtai',  icon: 'leaf',          color: '#10b981',  keywords: ['relax','chill','slow','soft','jazz','miers','kluss'] },
  { id: 'focus',  title: 'Fokusam',  icon: 'bulb',          color: '#3b82f6',  keywords: ['focus','study','lofi','piano','ambient','koncentrācija'] },
  { id: 'night',  title: 'Pusnakts', icon: 'moon',          color: '#8b5cf6',  keywords: ['night','dark','slow','nakts','tumsa'] },
];

export default function DiscoverScreen() {
  const { tracks, accentColor, colors, setPlaying, t } = useApp();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [activeCategory, setActiveCategory] = useState('all');

  // Top 6 pēc plays
  const trending = useMemo(() =>
    [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6),
    [tracks]
  );

  // Filtrētās dziesmas pēc kategorijas
  const categoryTracks = useMemo(() => {
    if (activeCategory === 'all') return tracks;
    const cat = CATEGORIES.find(c => c.id === activeCategory);
    if (!cat || !cat.keywords.length) return tracks;
    return tracks.filter((tr: any) => {
      const txt = `${tr.title || ''} ${tr.artist || ''}`.toLowerCase();
      return cat.keywords.some(kw => txt.includes(kw));
    });
  }, [tracks, activeCategory]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* ── KATEGORIJAS ── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>🗂️ Kategorijas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.catScroll}
          >
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catCard, {
                    backgroundColor: isActive ? cat.color : colors.card,
                    borderColor:     isActive ? cat.color : colors.border,
                  }]}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isActive ? '#000' : cat.color}
                  />
                  <Text style={[s.catText, { color: isActive ? '#000' : colors.text }]}>
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── POPULĀRĀKĀS (tikai "Visas" kategorijā) ── */}
        {activeCategory === 'all' && trending.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>🔥 Populāri tagad</Text>
              <Ionicons name="stats-chart" size={16} color={accentColor} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.trendScroll}
            >
              {trending.map((track: any, idx: number) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <TouchableOpacity
                    key={track._id}
                    style={s.trendCard}
                    onPress={() => setPlaying(track)}
                    activeOpacity={0.8}
                  >
                    <View style={s.trendImgWrap}>
                      {track.coverUrl ? (
                        <Image
                          source={{ uri: track.coverUrl }}
                          style={s.trendImg}
                        />
                      ) : (
                        <View style={[s.trendImg, s.trendImgPlaceholder, { backgroundColor: color + '22' }]}>
                          <Ionicons name="musical-notes" size={36} color={color} />
                        </View>
                      )}
                      <View style={[s.rankBadge, { backgroundColor: color }]}>
                        <Text style={s.rankText}>{idx + 1}</Text>
                      </View>
                    </View>
                    <Text numberOfLines={1} style={[s.trendTitle, { color: colors.text }]}>
                      {track.title || '—'}
                    </Text>
                    <Text numberOfLines={1} style={[s.trendArtist, { color: colors.subText }]}>
                      {track.artist || '—'}
                    </Text>
                    {(track.plays || 0) > 0 && (
                      <Text style={[s.trendPlays, { color: color }]}>
                        {track.plays}▶
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── FILTRĒTAS DZIESMAS ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>
              {activeCategory === 'all'
                ? `🎵 Visas dziesmas`
                : `${CATEGORIES.find(c => c.id === activeCategory)?.title ?? ''} (${categoryTracks.length})`
              }
            </Text>
          </View>

          {categoryTracks.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="musical-notes-outline" size={52} color={colors.border} />
              <Text style={[s.emptyTxt, { color: colors.subText }]}>
                Nav dziesmu šajā kategorijā
              </Text>
            </View>
          ) : (
            <View style={isTablet ? s.gridWrap : undefined}>
              {categoryTracks.map((item: any, index: number) => (
                <View key={item._id} style={isTablet ? s.gridItem : undefined}>
                  <TrackCard
                    track={item}
                    index={index}
                    accentColor={COLORS[index % COLORS.length]}
                    showAddBtn
                  />
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1 },
  section:      { marginBottom: 8 },
  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', paddingHorizontal: 16, marginBottom: 12, marginTop: 16 },

  // Kategorijas
  catScroll:    { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  catCard:      {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, gap: 6,
  },
  catText:      { fontWeight: '700', fontSize: 13 },

  // Trending kartītes
  trendScroll:  { paddingHorizontal: 16, gap: 12 },
  trendCard:    { width: 150 },
  trendImgWrap: { position: 'relative', marginBottom: 8 },
  trendImg:     { width: 150, height: 150, borderRadius: 20 },
  trendImgPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  rankBadge:    {
    position: 'absolute', bottom: -6, right: -6,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#080810',
  },
  rankText:     { fontWeight: '900', fontSize: 13, color: '#000' },
  trendTitle:   { fontWeight: '800', fontSize: 14, marginBottom: 2 },
  trendArtist:  { fontSize: 12 },
  trendPlays:   { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Tukšs
  empty:        { alignItems: 'center', paddingVertical: 40, gap: 10, paddingHorizontal: 16 },
  emptyTxt:     { fontSize: 14, textAlign: 'center' },

  // Planšete grid
  gridWrap:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  gridItem:     { width: '50%' },
});
