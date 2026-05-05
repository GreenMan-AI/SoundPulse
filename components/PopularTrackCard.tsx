import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

interface Props {
  track: any;
}

export default function PopularTrackCard({ track }: Props) {
  // Paņemam visu nepieciešamo no Context
  const { playing, isPlaying, setPlaying, setIsPlaying, accentColor, colors } = useApp();

  // Pārbaudām, vai šī dziesma pašlaik ir aktīva
  const isActive = playing?._id === track._id;

  const handlePress = () => {
    if (isActive) {
      // Ja jau skan, tad pārslēdzam Play/Pause
      setIsPlaying(!isPlaying);
    } else {
      // Ja jauna dziesma, iestatām to un palaižam
      setPlaying(track);
      setIsPlaying(true);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.8}
      style={[
        s.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: isActive ? accentColor : colors.border 
        }
      ]}
    >
      <View style={s.coverWrap}>
        {track.coverUrl ? (
          <Image source={{ uri: track.coverUrl }} style={s.cover} />
        ) : (
          <View style={[s.noCover, { backgroundColor: accentColor + '15' }]}>
            <Ionicons name="musical-note" size={24} color={accentColor} />
          </View>
        )}

        {/* Play/Pause indikators tieši uz kartītes bildes */}
        <View style={s.overlay}>
          <View style={[s.playIconBg, { backgroundColor: isActive ? accentColor : '#00000099' }]}>
             <Ionicons 
               name={isActive && isPlaying ? "pause" : "play"} 
               size={18} 
               color={isActive ? "#000" : "#fff"} 
             />
          </View>
        </View>
      </View>

      <View style={s.info}>
        <Text style={[s.title, { color: isActive ? accentColor : colors.text }]} numberOfLines={1}>
          {track.title || 'Bez nosaukuma'}
        </Text>
        <Text style={[s.artist, { color: colors.subText }]} numberOfLines={1}>
          {track.artist || 'Nezināms mākslinieks'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    width: 140,
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverWrap: {
    width: '100%',
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  cover: { width: '100%', height: '100%' },
  noCover: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { paddingHorizontal: 2 },
  title: { fontSize: 13, fontWeight: '800' },
  artist: { fontSize: 10, marginTop: 2 },
});