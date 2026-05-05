import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, Modal, useWindowDimensions,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';
import TrackComments from './TrackComments';

interface Props {
  track: any;
  index: number;
  accentColor?: string;
  showAddBtn?: boolean;
  showDeleteBtn?: boolean;
  onDelete?: (id: string) => void;
}

export default function TrackCard({
  track,
  index,
  accentColor = '#00cfff',
  showAddBtn = true,
  showDeleteBtn = false,
  onDelete,
}: Props) {
  const { playing, isPlaying, setPlaying, addToPlaylist, t, colors } = useApp();
  const { width }        = useWindowDimensions();
  const isTablet         = width >= 768;
  const isActive         = playing?._id === track._id;
  const [showComments, setShowComments] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[
          s.row,
          {
            backgroundColor: isActive ? accentColor + '14' : colors.card,
            borderColor:     isActive ? accentColor + '55' : colors.border,
            paddingVertical: isTablet ? 13 : 10,
          },
        ]}
        onPress={() => setPlaying(track)}
        activeOpacity={0.72}
      >
        {/* Numurs / Equalizer */}
        <View style={s.indexBox}>
          {isActive && isPlaying ? (
            <View style={s.equalizerWrap}>
              {[1, 2, 3].map(i => (
                <View key={i} style={[s.eqBar, {
                  backgroundColor: accentColor,
                  height: i === 2 ? 14 : 10,
                }]} />
              ))}
            </View>
          ) : (
            <Text style={[s.indexNum, { color: colors.subText }]}>
              {index + 1}
            </Text>
          )}
        </View>

        {/* Cover */}
        <View style={[s.coverBox, {
          backgroundColor: accentColor + '18',
          borderColor:  isActive ? accentColor + '44' : 'transparent',
          borderWidth:  isActive ? 1.5 : 0,
        }]}>
          {track.coverUrl
            ? <Image source={{ uri: track.coverUrl }} style={s.cover} />
            : <Ionicons name="musical-note" size={isTablet ? 22 : 18}
                color={isActive ? accentColor : colors.subText} />
          }
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={[s.title, {
            color: isActive ? accentColor : colors.text,
            fontSize: isTablet ? 14 : 13,
          }]} numberOfLines={1}>
            {track.title || t.noTitle}
          </Text>
          <View style={s.metaRow}>
            <Text style={[s.artist, { color: colors.subText }]} numberOfLines={1}>
              {track.artist || t.noArtist}
            </Text>
            {(track.plays || 0) > 0 && (
              <Text style={[s.meta, { color: accentColor + '88' }]}>
                · {track.plays}▶
              </Text>
            )}
            {(track.commentCount || 0) > 0 && (
              <Text style={[s.meta, { color: colors.subText }]}>
                · 💬{track.commentCount}
              </Text>
            )}
          </View>
        </View>

        {/* 💬 Komentāri */}
        <TouchableOpacity
          onPress={() => setShowComments(true)}
          style={s.actionBtn}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Ionicons name="chatbubble-outline" size={18} color={accentColor + '77'} />
        </TouchableOpacity>

        {/* ＋ Playlist */}
        {showAddBtn && (
          <TouchableOpacity
            onPress={() => addToPlaylist(track)}
            style={s.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          >
            <Ionicons name="add-circle-outline" size={22} color={accentColor + '77'} />
          </TouchableOpacity>
        )}

        {/* 🗑️ Dzēst */}
        {showDeleteBtn && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(track._id)}
            style={s.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#ff446677" />
          </TouchableOpacity>
        )}

        {/* ▶ Play */}
        <TouchableOpacity
          onPress={() => setPlaying(track)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <View style={[s.playCircle, {
            backgroundColor: isActive ? accentColor : accentColor + '18',
            borderColor:     accentColor + '44',
          }]}>
            <Ionicons
              name={isActive && isPlaying ? 'pause' : 'play'}
              size={16}
              color={isActive ? '#000' : accentColor}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Komentāru modālais logs */}
      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComments(false)}
      >
        <TrackComments
          trackId={track._id}
          trackTitle={track.title || t.noTitle}
          onClose={() => setShowComments(false)}
        />
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 12,
    marginVertical: 3, marginHorizontal: 4,
    gap: 10, flex: 1, borderWidth: 1,
  },
  indexBox:      { width: 24, alignItems: 'center', flexShrink: 0 },
  indexNum:      { fontSize: 11, fontWeight: '600' },
  equalizerWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 },
  eqBar:         { width: 3, borderRadius: 2 },
  coverBox:      {
    width: 44, height: 44, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  cover:      { width: 44, height: 44, borderRadius: 10 },
  info:       { flex: 1, minWidth: 0 },
  title:      { fontWeight: '700', marginBottom: 3 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  artist:     { fontSize: 11 },
  meta:       { fontSize: 11 },
  actionBtn:  { padding: 4, flexShrink: 0 },
  playCircle: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, flexShrink: 0,
  },
});
