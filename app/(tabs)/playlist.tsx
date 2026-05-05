import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, TextInput, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../components/AppContext';
import TrackCard from '../../components/TrackCard';

const COLORS = ['#00cfff','#a855f7','#f59e0b','#10b981','#ef4444','#6366f1','#ec4899'];

export default function PlaylistScreen() {
  const {
    playlist, removeFromPlaylist,
    namedPlaylists, createNamedPlaylist, deleteNamedPlaylist,
    setPlaying, playing, isPlaying,
    t, accentColor, colors,
  } = useApp();

  const { width } = useWindowDimensions();
  const isTablet  = width >= 768;

  const [tab, setTab]           = useState<'quick' | 'named'>('quick');
  const [newName, setNewName]   = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const safeList    = Array.isArray(playlist)       ? playlist       : [];
  const safePls     = Array.isArray(namedPlaylists) ? namedPlaylists : [];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>

      {/* TABS */}
      <View style={[s.tabsWrap, { backgroundColor: colors.bg }]}>
        <View style={[s.tabs, { backgroundColor: colors.card }]}>
          {[
            ['quick', `⚡ ${t.quickPlaylist ?? 'Ātrā'} (${safeList.length})`],
            ['named', `📋 ${t.namedPlaylists ?? 'Manas'} (${safePls.length})`],
          ].map(([id, label]) => (
            <TouchableOpacity
              key={id}
              style={[s.tab, tab === id && { backgroundColor: accentColor }]}
              onPress={() => setTab(id as any)}
            >
              <Text style={[s.tabTxt, { color: tab === id ? '#000' : colors.subText }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ĀTRĀ PLAYLISTE */}
      {tab === 'quick' && (
        <FlatList
          data={safeList}
          keyExtractor={(item: any, i) => `q-${item._id}-${i}`}
          contentContainerStyle={{ padding: isTablet ? 16 : 10, paddingBottom: 160 }}
          renderItem={({ item, index }: any) => {
            const tc     = COLORS[index % COLORS.length];
            const active = playing?._id === item._id;
            return (
              <TouchableOpacity
                style={[s.trackRow, {
                  backgroundColor: active ? tc + '14' : colors.card,
                  borderColor:     active ? tc + '55' : colors.border,
                }]}
                onPress={() => setPlaying(item)}
              >
                <View style={[s.idx, { backgroundColor: tc + '22' }]}>
                  {active && isPlaying
                    ? <Ionicons name="volume-high" size={13} color={tc} />
                    : <Text style={[s.idxTxt, { color: tc }]}>{index + 1}</Text>
                  }
                </View>
                <View style={s.trackInfo}>
                  <Text style={[s.trackTitle, { color: active ? tc : colors.text }]} numberOfLines={1}>
                    {item.title || t.noTitle}
                  </Text>
                  <Text style={[s.trackArtist, { color: colors.subText }]} numberOfLines={1}>
                    {item.artist || t.noArtist}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeFromPlaylist(item._id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={22} color="#ff446655" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaying(item)}>
                  <View style={[s.playCircle, {
                    backgroundColor: active ? tc : tc + '18',
                    borderColor: tc + '44',
                  }]}>
                    <Ionicons
                      name={active && isPlaying ? 'pause' : 'play'}
                      size={14}
                      color={active ? '#000' : tc}
                    />
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="list-outline" size={56} color={colors.border} />
              <Text style={[s.emptyTitle, { color: colors.subText }]}>
                {t.playlistEmpty ?? 'Playliste ir tukša'}
              </Text>
              <Text style={[s.emptyHint, { color: colors.border }]}>
                {t.playlistEmptySub ?? 'Nospied + pie dziesmas'}
              </Text>
            </View>
          }
        />
      )}

      {/* NOSAUKTĀS PLAYLISTES */}
      {tab === 'named' && (
        <FlatList
          data={safePls}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: isTablet ? 16 : 10, paddingBottom: 160 }}
          ListHeaderComponent={
            <View>
              <TouchableOpacity
                style={[s.createBtn, { borderColor: accentColor + '44' }]}
                onPress={() => setShowCreate(v => !v)}
              >
                <Ionicons name={showCreate ? 'close-circle' : 'add-circle'} size={20} color={accentColor} />
                <Text style={[s.createTxt, { color: accentColor }]}>
                  {showCreate ? t.cancel : t.createPlaylist ?? 'Izveidot playlisti'}
                </Text>
              </TouchableOpacity>
              {showCreate && (
                <View style={[s.createForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[s.nameInput, {
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: accentColor + '44',
                    }]}
                    placeholder={t.playlistName ?? 'Nosaukums'}
                    placeholderTextColor={colors.subText}
                    value={newName}
                    onChangeText={setNewName}
                    autoFocus
                  />
                  <View style={s.formBtns}>
                    <TouchableOpacity
                      style={[s.formBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                      onPress={() => { setShowCreate(false); setNewName(''); }}
                    >
                      <Text style={{ color: colors.subText, fontWeight: '700' }}>{t.cancel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.formBtn, { backgroundColor: accentColor, flex: 2 }]}
                      onPress={() => {
                        if (newName.trim()) {
                          createNamedPlaylist(newName.trim());
                          setNewName(''); setShowCreate(false);
                        }
                      }}
                    >
                      <Text style={{ color: '#000', fontWeight: '900' }}>{t.create}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          }
          renderItem={({ item, index }: any) => {
            const tc = COLORS[index % COLORS.length];
            return (
              <View style={[s.plCard, {
                backgroundColor: colors.card,
                borderColor: tc + '44', borderLeftColor: tc,
              }]}>
                <View style={[s.plIcon, { backgroundColor: tc + '20' }]}>
                  <Ionicons name="musical-notes" size={20} color={tc} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.plName, { color: tc }]}>{item.name}</Text>
                  <Text style={[s.plCount, { color: colors.subText }]}>
                    {item.tracks?.length ?? 0} {t.tracksCount ?? 'dziesmas'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert(t.delete + '?', item.name, [
                    { text: t.cancel, style: 'cancel' },
                    { text: t.delete, style: 'destructive', onPress: () => deleteNamedPlaylist(item.id) },
                  ])}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ff446677" />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="folder-open-outline" size={56} color={colors.border} />
              <Text style={[s.emptyTitle, { color: colors.subText }]}>
                {t.playlistEmpty}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1 },
  tabsWrap:    { padding: 12, paddingBottom: 0 },
  tabs:        { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  tab:         { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabTxt:      { fontWeight: '700', fontSize: 12 },
  trackRow:    {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 10, marginBottom: 6,
    gap: 10, borderWidth: 1,
  },
  idx:         { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  idxTxt:      { fontSize: 11, fontWeight: '800' },
  trackInfo:   { flex: 1 },
  trackTitle:  { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  trackArtist: { fontSize: 11 },
  playCircle:  {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  empty:       { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle:  { fontSize: 16, fontWeight: '600' },
  emptyHint:   { fontSize: 13 },
  createBtn:   {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10,
  },
  createTxt:   { fontWeight: '700', fontSize: 14 },
  createForm:  { borderRadius: 14, padding: 14, marginBottom: 12, gap: 10, borderWidth: 1 },
  nameInput:   { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1.5 },
  formBtns:    { flexDirection: 'row', gap: 8 },
  formBtn:     { flex: 1, borderRadius: 10, padding: 11, alignItems: 'center', borderWidth: 1 },
  plCard:      {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderLeftWidth: 3, gap: 12,
  },
  plIcon:      { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  plName:      { fontSize: 14, fontWeight: '800' },
  plCount:     { fontSize: 11, marginTop: 2 },
});
