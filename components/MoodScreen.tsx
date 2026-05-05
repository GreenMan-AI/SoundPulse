// Mood ekrāns izmanto SafeAreaView edges={['bottom']} jo augšējā josla
// jau tiek pārvaldīta TopNav komponentā _layout.tsx
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Easing, ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

const MOODS = {
  focus: {
    key: 'focus' as const, labelKey: 'moodFocus', descKey: 'moodFocusDesc',
    emoji: '🔵', color: '#3b82f6', bg: '#0d1a3a',
    keywords: ['study','focus','ambient','lofi','piano','instrumental','calm','deep'],
    icon: 'bulb-outline' as const,
  },
  energy: {
    key: 'energy' as const, labelKey: 'moodEnergy', descKey: 'moodEnergyDesc',
    emoji: '🔴', color: '#ef4444', bg: '#3a0d0d',
    keywords: ['rock','metal','energy','power','pump','workout','fast','hard','beat'],
    icon: 'flash-outline' as const,
  },
  relax: {
    key: 'relax' as const, labelKey: 'moodRelax', descKey: 'moodRelaxDesc',
    emoji: '🟢', color: '#22c55e', bg: '#0d3a1a',
    keywords: ['relax','chill','slow','sleep','soft','gentle','peaceful','nature','jazz'],
    icon: 'leaf-outline' as const,
  },
};
type MoodKey = keyof typeof MOODS;

function PulseRing({ color, active, size }: { color: string; active: boolean; size: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) { anim.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active]);
  const scale   = anim.interpolate({ inputRange: [0,1], outputRange: [1, 1.55] });
  const opacity = anim.interpolate({ inputRange: [0,0.5,1], outputRange: [0.6,0.2,0] });
  return (
    <Animated.View style={{
      position: 'absolute', width: size, height: size, borderRadius: size/2,
      borderWidth: 2, borderColor: color, transform: [{ scale }], opacity,
    }} />
  );
}

function MoodButton({ moodKey, active, onPress, playCount, btnSize, t }: any) {
  const mood = MOODS[moodKey as MoodKey];
  const sc   = useRef(new Animated.Value(1)).current;
  const handle = () => {
    Animated.sequence([
      Animated.timing(sc, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale: sc }] }}>
      <TouchableOpacity onPress={handle} activeOpacity={0.85}>
        <View style={[mb.btn, {
          width: btnSize, height: btnSize * 1.15,
          borderColor:     active ? mood.color : mood.color + '44',
          backgroundColor: active ? mood.bg    : '#111118',
          shadowColor:     active ? mood.color : 'transparent',
          shadowOpacity:   active ? 0.5 : 0,
          shadowRadius:    active ? 20  : 0,
          elevation:       active ? 10  : 0,
        }]}>
          <PulseRing color={mood.color} active={active} size={btnSize * 0.85} />
          <Text style={{ fontSize: btnSize * 0.22 }}>{mood.emoji}</Text>
          <Text style={[mb.label, { color: active ? mood.color : '#888', fontSize: btnSize * 0.12 }]}>
            {t[mood.labelKey] || mood.key}
          </Text>
          <Text style={[mb.desc, { color: active ? mood.color + 'bb' : '#444', fontSize: btnSize * 0.075 }]}>
            {t[mood.descKey] || ''}
          </Text>
          {playCount > 0 && (
            <View style={[mb.badge, { backgroundColor: mood.color + '33' }]}>
              <Text style={[mb.badgeTxt, { color: mood.color }]}>{playCount}x</Text>
            </View>
          )}
          {active && <View style={[mb.dot, { backgroundColor: mood.color }]} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const mb = StyleSheet.create({
  btn:      {
    borderRadius: 20, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingHorizontal: 6, position: 'relative', overflow: 'visible',
  },
  label:    { fontWeight: '800' },
  desc:     { textAlign: 'center', fontWeight: '600', lineHeight: 13 },
  badge:    { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  dot:      { position: 'absolute', bottom: 8, width: 6, height: 6, borderRadius: 3 },
});

export default function MoodScreen() {
  const { tracks, setPlaying, playing, isPlaying, t, accentColor, colors } = useApp() as any;
  const { width, height } = useWindowDimensions();
  const isTablet    = width >= 768;
  const isLandscape = width > height;
  const gap    = 12;
  const hPad   = isTablet ? 32 : 16;
  const btnSize = Math.floor((width - hPad * 2 - gap * 2) / 3);

  const [activeMood, setActiveMood]     = useState<MoodKey | null>(null);
  const [moodPlaylist, setMoodPlaylist] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [djMode, setDjMode]             = useState(false);
  const [moodCounts, setMoodCounts]     = useState<Record<MoodKey,number>>({ focus:0, energy:0, relax:0 });

  const cfg = activeMood ? MOODS[activeMood] : null;

  const filterByMood = (mood: MoodKey) => {
    const kws = MOODS[mood].keywords;
    const scored = tracks.map((tr: any) => {
      const txt   = `${tr.title||''} ${tr.artist||''} ${(tr.tags||[]).join(' ')}`.toLowerCase();
      const score = kws.reduce((s: number, k: string) => s + (txt.includes(k) ? 1 : 0), 0);
      return { ...tr, _score: score };
    });
    return [
      ...scored.filter((x: any) => x._score > 0).sort((a: any, b: any) => b._score - a._score),
      ...scored.filter((x: any) => x._score === 0).sort(() => Math.random() - 0.5),
    ];
  };

  const selectMood = (mood: MoodKey) => {
    if (activeMood === mood) { setActiveMood(null); setMoodPlaylist([]); return; }
    const pl = filterByMood(mood);
    if (!pl.length) return;
    setActiveMood(mood); setMoodPlaylist(pl); setCurrentIdx(0);
    setPlaying(pl[0]);
    setMoodCounts(p => ({ ...p, [mood]: p[mood] + 1 }));
  };

  const moodNext = () => {
    if (!moodPlaylist.length) return;
    const n = djMode ? Math.floor(Math.random() * moodPlaylist.length) : (currentIdx + 1) % moodPlaylist.length;
    setCurrentIdx(n); setPlaying(moodPlaylist[n]);
  };
  const moodPrev = () => {
    if (!moodPlaylist.length) return;
    const p = (currentIdx - 1 + moodPlaylist.length) % moodPlaylist.length;
    setCurrentIdx(p); setPlaying(moodPlaylist[p]);
  };

  return (
    <SafeAreaView style={[st.screen, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>

        {/* Subheader */}
        <View style={[st.subHeader, {
          backgroundColor: colors.card,
          borderBottomColor: accentColor + '22',
          flexDirection: isLandscape ? 'row' : 'row',
          alignItems: 'center',
        }]}>
          <View style={{ flex: 1 }}>
            <Text style={[st.title, { color: accentColor }]}>
              {t.moodTitle ?? '✨ Mood Player'}
            </Text>
            <Text style={[st.sub, { color: colors.subText }]}>
              {t.moodSubtitle ?? 'Izvēlies savu garastāvokli'}
            </Text>
          </View>
          <TouchableOpacity
            style={[st.djBtn, djMode && { backgroundColor: '#a855f7' }]}
            onPress={() => setDjMode(v => !v)}
          >
            <Ionicons name={djMode ? 'radio' : 'radio-outline'} size={15} color={djMode ? '#000' : '#a855f7'} />
            <Text style={[st.djTxt, djMode && { color: '#000' }]}>
              {t.moodAiDj ?? 'AI DJ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mood pogas */}
        <View style={[st.moodRow, { paddingHorizontal: hPad, paddingVertical: isTablet ? 24 : 16, gap, justifyContent: 'center' }]}>
          {(Object.keys(MOODS) as MoodKey[]).map(key => (
            <MoodButton
              key={key} moodKey={key}
              active={activeMood === key}
              onPress={() => selectMood(key)}
              playCount={moodCounts[key]}
              btnSize={btnSize} t={t}
            />
          ))}
        </View>

        {/* Now playing */}
        {cfg && moodPlaylist.length > 0 && (
          <View style={[st.nowPlaying, { backgroundColor: cfg.bg, borderColor: cfg.color + '55', marginHorizontal: hPad }]}>
            <Text style={[st.npLabel, { color: cfg.color + '88' }]}>▶ NOW PLAYING</Text>
            <View style={st.npTrack}>
              <View style={[st.npIcon, { backgroundColor: cfg.color + '22' }]}>
                <Ionicons name={cfg.icon} size={22} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[st.npTitle, { color: colors.text }]} numberOfLines={1}>
                  {moodPlaylist[currentIdx]?.title || '—'}
                </Text>
                <Text style={[st.npArtist, { color: cfg.color + '88' }]} numberOfLines={1}>
                  {moodPlaylist[currentIdx]?.artist || '—'}
                </Text>
                <Text style={[st.npIdx, { color: colors.subText }]}>
                  {currentIdx + 1} / {moodPlaylist.length}
                </Text>
              </View>
            </View>
            <View style={st.npControls}>
              <TouchableOpacity onPress={moodPrev} style={st.npBtn}>
                <Ionicons name="play-skip-back" size={20} color={colors.subText} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPlaying(moodPlaylist[currentIdx])}
                style={[st.npPlay, { backgroundColor: cfg.color }]}
              >
                <Ionicons
                  name={isPlaying && playing?._id === moodPlaylist[currentIdx]?._id ? 'pause' : 'play'}
                  size={24} color="#000"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={moodNext} style={st.npBtn}>
                <Ionicons name="play-skip-forward" size={20} color={colors.subText} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { const r = Math.floor(Math.random()*moodPlaylist.length); setCurrentIdx(r); setPlaying(moodPlaylist[r]); }}
                style={st.npBtn}
              >
                <Ionicons name="shuffle" size={18} color={cfg.color} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Playlist saraksts */}
        {cfg && moodPlaylist.length > 0 && (
          <View style={[st.listSection, { paddingHorizontal: hPad }]}>
            <Text style={[st.listTitle, { color: cfg.color }]}>
              📋 Playlist ({moodPlaylist.length})
            </Text>
            {moodPlaylist.slice(0, isTablet ? 15 : 10).map((tr: any, i: number) => {
              const active = i === currentIdx;
              return (
                <TouchableOpacity
                  key={tr._id}
                  style={[st.listRow, {
                    backgroundColor: active ? cfg.bg : colors.card,
                    borderColor:     active ? cfg.color + '55' : colors.border,
                  }]}
                  onPress={() => { setCurrentIdx(i); setPlaying(tr); }}
                >
                  <Text style={[st.listNum, { color: active ? cfg.color : colors.subText }]}>
                    {active ? '▶' : i + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[st.listName, { color: active ? cfg.color : colors.text }]} numberOfLines={1}>
                      {tr.title || '—'}
                    </Text>
                    <Text style={[st.listArtist, { color: colors.subText }]} numberOfLines={1}>
                      {tr.artist || '—'}
                    </Text>
                  </View>
                  {tr._score > 0 && (
                    <View style={[st.matchBadge, { backgroundColor: cfg.color + '22' }]}>
                      <Text style={[st.matchTxt, { color: cfg.color }]}>
                        ✓ {t.moodMatch ?? 'Piemērots'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Statistika */}
        <View style={[st.statsSection, { paddingHorizontal: hPad }]}>
          <Text style={[st.statsTitle, { color: colors.subText }]}>
            {t.moodHistory ?? '📊 Tavs Mood Vēsturē'}
          </Text>
          <View style={[st.statsRow, { gap }]}>
            {(Object.entries(moodCounts) as [MoodKey, number][]).map(([key, count]) => {
              const m     = MOODS[key];
              const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <View key={key} style={[st.statCard, { backgroundColor: colors.card, borderTopColor: m.color, flex: 1 }]}>
                  <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                  <Text style={[st.statVal, { color: m.color }]}>{pct}%</Text>
                  <Text style={[st.statLbl, { color: colors.subText }]}>{t[m.labelKey] || m.key}</Text>
                  <View style={[st.statBar, { backgroundColor: colors.border }]}>
                    <View style={[st.statFill, { width: `${pct}%` as any, backgroundColor: m.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* DJ info */}
        {djMode && (
          <View style={[st.djInfo, { marginHorizontal: hPad }]}>
            <Ionicons name="radio" size={16} color="#a855f7" />
            <Text style={st.djInfoTxt}>
              {t.moodDjActive ?? 'AI DJ režīms aktīvs — dziesmas tiek izlases kārtībā! 🎛️'}
            </Text>
          </View>
        )}

        {/* Tukšs */}
        {tracks.length === 0 && (
          <View style={st.empty}>
            <Ionicons name="musical-notes-outline" size={52} color={colors.border} />
            <Text style={[st.emptyTxt, { color: colors.subText }]}>
              {t.moodNoTracks ?? 'Nav dziesmu'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen:      { flex: 1 },
  subHeader:   { paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, gap: 4 },
  title:       { fontSize: 18, fontWeight: '900' },
  sub:         { fontSize: 12 },
  djBtn:       {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1a0a2a', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#a855f744',
  },
  djTxt:       { color: '#a855f7', fontSize: 12, fontWeight: '700' },
  moodRow:     { flexDirection: 'row' },
  nowPlaying:  { borderRadius: 20, padding: 16, borderWidth: 1, gap: 10, marginBottom: 14 },
  npLabel:     { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  npTrack:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  npIcon:      { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  npTitle:     { fontSize: 14, fontWeight: '700' },
  npArtist:    { fontSize: 11, marginTop: 2 },
  npIdx:       { fontSize: 10, marginTop: 3 },
  npControls:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  npBtn:       { padding: 8 },
  npPlay:      { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6 },
  listSection: { marginBottom: 14 },
  listTitle:   { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  listRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 10, marginBottom: 5, borderWidth: 1 },
  listNum:     { width: 20, fontSize: 12, textAlign: 'center' },
  listName:    { fontSize: 13, fontWeight: '600' },
  listArtist:  { fontSize: 11, marginTop: 2 },
  matchBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  matchTxt:    { fontSize: 10, fontWeight: '700' },
  statsSection:{ marginTop: 4, marginBottom: 14 },
  statsTitle:  { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  statsRow:    { flexDirection: 'row' },
  statCard:    { borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderTopWidth: 2 },
  statVal:     { fontSize: 20, fontWeight: '900' },
  statLbl:     { fontSize: 10 },
  statBar:     { width: '100%', height: 3, borderRadius: 2, marginTop: 4 },
  statFill:    { height: 3, borderRadius: 2 },
  djInfo:      {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1a0a2a', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#a855f733', marginBottom: 14,
  },
  djInfoTxt:   { flex: 1, color: '#a855f7', fontSize: 12, lineHeight: 18 },
  empty:       { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTxt:    { fontSize: 14, textAlign: 'center' },
});
