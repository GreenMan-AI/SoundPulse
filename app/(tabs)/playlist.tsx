import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput,Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../components/AppContext';

export default function PlaylistScreen() {
  const { playlist, removeFromPlaylist, namedPlaylists, createNamedPlaylist, deleteNamedPlaylist,
          removeTrackFromNamedPlaylist, setPlaying, playing, isPlaying, t } = useApp();
  const [tab, setTab] = useState('quick');
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const COLORS = ['#00cfff','#a855f7','#f59e0b','#10b981','#ef4444','#6366f1','#ec4899'];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>📋 {t.playlist}</Text>
      </View>

      <View style={s.tabs}>
        {[['quick', `⚡ ${t.quickPlaylist || 'Ātrā'} (${playlist.length})`],
          ['named', `📂 ${t.namedPlaylists || 'Manas'} (${namedPlaylists.length})`]].map(([id, label]) => (
          <TouchableOpacity key={id} style={[s.tab, tab === id && s.tabActive]} onPress={() => setTab(id)}>
            <Text style={[s.tabTxt, tab === id && s.tabTxtActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'quick' && (
        <FlatList
          data={playlist}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          renderItem={({ item, index }: any) => {
            const tc = COLORS[index % COLORS.length];
            const active = playing?._id === item._id;
            return (
              <View style={[s.row, active && { borderColor: tc + '55', borderWidth: 1 }]}>
                <View style={[s.idx, { backgroundColor: tc + '22' }]}>
                  {active && isPlaying
                    ? <Ionicons name="volume-high" size={13} color={tc} />
                    : <Text style={[s.idxTxt, { color: tc }]}>{index + 1}</Text>}
                </View>
                <TouchableOpacity style={s.info} onPress={() => setPlaying(item)}>
                  <Text style={[s.trackTitle, active && { color: tc }]} numberOfLines={1}>{item.title || t.noTitle}</Text>
                  <Text style={s.trackArtist} numberOfLines={1}>{item.artist || t.noArtist}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromPlaylist(item._id)} style={s.removeBtn}>
                  <Ionicons name="close-circle" size={22} color="#ff446666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPlaying(item)}>
                  <Ionicons name={active && isPlaying ? 'pause-circle' : 'play-circle'} size={32} color={tc} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="list-outline" size={50} color="#1a1a25" />
              <Text style={s.emptyTxt}>{t.playlistEmpty}</Text>
              <Text style={s.emptyHint}>{t.playlistEmptySub}</Text>
            </View>
          }
        />
      )}

      {tab === 'named' && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={s.createBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add-circle" size={20} color="#00cfff" />
            <Text style={s.createTxt}>{t.createPlaylist}</Text>
          </TouchableOpacity>

          {showCreate && (
            <View style={s.createForm}>
              <TextInput
                style={s.nameInput}
                placeholder={t.playlistName}
                placeholderTextColor="#333"
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowCreate(false); setNewName(''); }}>
                  <Text style={{ color: '#555', fontWeight: '700' }}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.okBtn}
                  onPress={() => {
                    if (newName.trim()) { createNamedPlaylist(newName.trim()); setNewName(''); setShowCreate(false); }
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: '800' }}>{t.create}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={namedPlaylists}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
            renderItem={({ item, index }: any) => {
              const tc = COLORS[index % COLORS.length];
              return (
                <View style={[s.plCard, { borderLeftColor: tc }]}>
                  <View style={[s.plIcon, { backgroundColor: tc + '22' }]}>
                    <Ionicons name="musical-notes" size={20} color={tc} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.plName, { color: tc }]}>{item.name}</Text>
                    <Text style={s.plCount}>{item.tracks.length} {t.tracksCount}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Alert.alert(t.delete + '?', item.name, [
                      { text: t.cancel, style: 'cancel' },
                      { text: t.delete, style: 'destructive', onPress: () => deleteNamedPlaylist(item.id) },
                    ])}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff446688" />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="folder-open-outline" size={50} color="#1a1a25" />
                <Text style={s.emptyTxt}>{t.playlistEmpty}</Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, backgroundColor: '#111118' },
  title: { fontSize: 22, fontWeight: '800', color: '#00cfff' },
  tabs: { flexDirection: 'row', margin: 14, backgroundColor: '#111118', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#00cfff' },
  tabTxt: { color: '#444', fontWeight: '700', fontSize: 12 },
  tabTxtActive: { color: '#000' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 12, padding: 10, marginBottom: 6, gap: 10 },
  idx: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  idxTxt: { fontSize: 11, fontWeight: '700' },
  info: { flex: 1 },
  trackTitle: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  trackArtist: { color: '#444', fontSize: 11, marginTop: 2 },
  removeBtn: { padding: 4 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTxt: { color: '#333', fontSize: 14 },
  emptyHint: { color: '#222', fontSize: 12 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 14, marginBottom: 0 },
  createTxt: { color: '#00cfff', fontWeight: '700', fontSize: 14 },
  createForm: { backgroundColor: '#111118', borderRadius: 14, padding: 14, margin: 14, marginTop: 8, gap: 10 },
  nameInput: { backgroundColor: '#0a0a0f', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#1e1e2a' },
  cancelBtn: { flex: 1, backgroundColor: '#1a1a25', borderRadius: 10, padding: 10, alignItems: 'center' },
  okBtn: { flex: 1, backgroundColor: '#00cfff', borderRadius: 10, padding: 10, alignItems: 'center' },
  plCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111118', borderRadius: 14, padding: 14, marginBottom: 8, borderLeftWidth: 3, gap: 12 },
  plIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  plName: { fontSize: 14, fontWeight: '700' },
  plCount: { color: '#444', fontSize: 11, marginTop: 2 },
});
