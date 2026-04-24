import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from './AppContext';

export default function PlayerBar() {
  const { playing, setPlaying, isPlaying, setIsPlaying, playNext, playPrev } = useApp();
  const sound = useRef<Audio.Sound | null>(null);
  const curId = useRef('');
  const pulse = useRef(new Animated.Value(1)).current;

  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playing) return;
    if (curId.current === playing._id && sound.current) {
      if (isPlaying) sound.current.playAsync().catch(() => {});
      else sound.current.pauseAsync().catch(() => {});
      return;
    }
    loadAndPlay();
  }, [playing]);

  useEffect(() => {
    return () => { sound.current?.unloadAsync().catch(() => {}); };
  }, []);

  const loadAndPlay = async () => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }
      if (!playing?.cloudUrl) return;
      curId.current = playing._id;
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: playing.cloudUrl },
        { shouldPlay: true }
      );
      sound.current = s;
      setIsPlaying(true);
      s.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) playNext();
      });
    } catch {}
  };

  const toggle = async () => {
    if (!sound.current) { loadAndPlay(); return; }
    if (isPlaying) {
      await sound.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    } else {
      await sound.current.playAsync().catch(() => {});
      setIsPlaying(true);
    }
  };

  const close = async () => {
    await sound.current?.unloadAsync().catch(() => {});
    sound.current = null;
    curId.current = '';
    setPlaying(null);
    setIsPlaying(false);
  };

  if (!playing) return null;

  return (
    <View style={s.bar}>
      <Animated.View style={[s.iconWrap, { transform: [{ scale: pulse }] }]}>
        <Ionicons name="musical-note" size={18} color="#00cfff" />
      </Animated.View>

      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{playing.title || '—'}</Text>
        <Text style={s.artist} numberOfLines={1}>{playing.artist || '—'}</Text>
      </View>

      <TouchableOpacity onPress={playPrev} style={s.btn}>
        <Ionicons name="play-skip-back" size={20} color="#888" />
      </TouchableOpacity>

      <TouchableOpacity onPress={toggle} style={s.playBtn}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#000" />
      </TouchableOpacity>

      <TouchableOpacity onPress={playNext} style={s.btn}>
        <Ionicons name="play-skip-forward" size={20} color="#888" />
      </TouchableOpacity>

      <TouchableOpacity onPress={close} style={s.btn}>
        <Ionicons name="close" size={20} color="#ff4466" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111118',
    borderTopWidth: 1, borderTopColor: '#00cfff22',
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 8,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#00cfff18',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 13, fontWeight: '600' },
  artist: { color: '#555', fontSize: 11, marginTop: 1 },
  btn: { padding: 6 },
  playBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#00cfff',
    justifyContent: 'center', alignItems: 'center',
  },
});
