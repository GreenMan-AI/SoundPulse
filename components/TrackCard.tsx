import {
  View, Text, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

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
  const { playing, isPlaying, setPlaying, addToPlaylist, t } = useApp();
  const isActive = playing?._id === track._id;

  return (
    <TouchableOpacity
      style={[
        s.row,
        isActive && { backgroundColor: accentColor + '12', borderColor: accentColor + '44', borderWidth: 1 },
      ]}
      onPress={() => setPlaying(track)}
      activeOpacity={0.75}
    >
      {/* Index / equalizer */}
      <View style={s.indexBox}>
        {isActive && isPlaying ? (
          <Ionicons name="volume-high" size={15} color={accentColor} />
        ) : (
          <Text style={s.indexNum}>{index + 1}</Text>
        )}
      </View>

      {/* Cover art */}
      <View style={[s.coverBox, { backgroundColor: accentColor + '18' }]}>
        {track.coverUrl ? (
          <Image source={{ uri: track.coverUrl }} style={s.cover} />
        ) : (
          <Ionicons
            name="musical-note"
            size={18}
            color={isActive ? accentColor : '#444'}
          />
        )}
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text
          style={[s.title, isActive && { color: accentColor }]}
          numberOfLines={1}
        >
          {track.title || t.noTitle}
        </Text>
        <Text style={s.artist} numberOfLines={1}>
          {track.artist || t.noArtist}
          {track.plays ? `  ·  ${track.plays}▶` : ''}
        </Text>
      </View>

      {/* Action buttons */}
      {showAddBtn && (
        <TouchableOpacity
          onPress={() => addToPlaylist(track)}
          style={s.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add-circle-outline" size={22} color={accentColor + '66'} />
        </TouchableOpacity>
      )}

      {showDeleteBtn && onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(track._id)}
          style={s.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color="#ff446688" />
        </TouchableOpacity>
      )}

      {/* Play button */}
      <TouchableOpacity onPress={() => setPlaying(track)}>
        <Ionicons
          name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
          size={32}
          color={accentColor}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111118',
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 4,
    marginBottom: 8,
    gap: 8,
    flex: 1,
  },
  indexBox: {
    width: 22,
    alignItems: 'center',
    flexShrink: 0,
  },
  indexNum: {
    color: '#333',
    fontSize: 11,
    fontWeight: '600',
  },
  coverBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '600',
  },
  artist: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  actionBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
