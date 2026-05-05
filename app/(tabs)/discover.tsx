import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Image, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../components/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen() {
  const { tracks, accentColor, colors, setPlaying, setIsPlaying } = useApp();

  // Atlasām populārākās dziesmas pēc atskaņojumu skaita
  const trending = [...tracks]
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 6);

  const categories = [
    { id: '1', title: 'Enerģijai', icon: 'flash', color: '#f59e0b' },
    { id: '2', title: 'Atpūtai', icon: 'leaf', color: '#10b981' },
    { id: '3', title: 'Fokusam', icon: 'bulb', color: '#3b82f6' }, 
    { id: '4', title: 'Pusnakts', icon: 'moon', color: '#8b5cf6' },
  ];

  const handlePlay = (track: any) => {
    setPlaying(track);
    setIsPlaying(true);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        {/* VIRSRAKSTS */}
        <View style={s.header}>
          <Text style={[s.title, { color: colors.text }]}>Atklāj</Text>
          <Text style={{ color: colors.subText }}>Jaunākās un populārākās dziesmas</Text>
        </View>

        {/* KATEGORIJAS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={s.catScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[s.catCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name={cat.icon as any} size={18} color={cat.color} />
              <Text style={[s.catText, { color: colors.text }]}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* POPULĀRĀS DZIESMAS */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>Populāri tagad</Text>
          <Ionicons name="stats-chart" size={18} color={accentColor} />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={s.trendScroll}
        >
          {trending.map((track, idx) => (
            <TouchableOpacity 
              key={track._id} 
              style={s.card}
              onPress={() => handlePlay(track)}
            >
              <View style={s.cardImageWrapper}>
                <Image 
                  source={{ uri: track.coverUrl || 'https://via.placeholder.com/150' }} 
                  style={s.cardImg} 
                />
                <View style={[s.rankBadge, { backgroundColor: accentColor }]}>
                  <Text style={s.rankText}>{idx + 1}</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={[s.cardTitle, { color: colors.text }]}>
                {track.title}
              </Text>
              <Text numberOfLines={1} style={[s.cardArtist, { color: colors.subText }]}>
                {track.artist}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  header: { padding: 20 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  catScroll: { paddingLeft: 20, paddingRight: 20, marginBottom: 30, gap: 10 },
  catCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 15, 
    borderWidth: 1, 
    gap: 8 
  },
  catText: { fontWeight: '700', fontSize: 14 },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  trendScroll: { paddingLeft: 20 },
  card: { width: 160, marginRight: 16 },
  cardImageWrapper: { position: 'relative' },
  cardImg: { 
    width: 160, 
    height: 160, 
    borderRadius: 24, 
    backgroundColor: '#1a1a1a' 
  },
  rankBadge: { 
    position: 'absolute', 
    bottom: -5, 
    right: -5, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#000' 
  },
  rankText: { fontWeight: '900', fontSize: 14, color: '#000' },
  cardTitle: { fontWeight: '800', fontSize: 15, marginTop: 12 },
  cardArtist: { fontSize: 13, marginTop: 2 },
});