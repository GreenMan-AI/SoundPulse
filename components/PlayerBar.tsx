import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, useWindowDimensions, Platform,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from './AppContext';

export default function PlayerBar() {
  const {
    playing, setPlaying,
    isPlaying, setIsPlaying,
    playNext, playPrev,
    accentColor, colors,
  } = useApp();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const sound   = useRef<Audio.Sound | null>(null);
  const curId   = useRef('');
  const pulse   = useRef(new Animated.Value(1)).current;
  const slideIn = useRef(new Animated.Value(80)).current;

  // Slide-in animācija kad parādās
  useEffect(() => {
    if (playing) {
      Animated.spring(slideIn, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      slideIn.setValue(80);
    }
  }, [!!playing]);

  // Pulse animācija atskaņošanas laikā
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isPlaying]);

  // ── Audio loģika (nemainīta) ──
  useEffect(() => {
    if (!playing) return;
    if (curId.current === playing._id && sound.current) {
      if (isPlaying) sound.current.playAsync().catch(() => {});
      else           sound.current.pauseAsync().catch(() => {});
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
    <Animated.View
      style={[
        st.bar,
        {
          backgroundColor: colors.card,
          borderTopColor: accentColor + '33',
          transform: [{ translateY: slideIn }],
          maxWidth: isTablet ? 600 : undefined,
          alignSelf: isTablet ? 'center' : undefined,
          width: isTablet ? '90%' : undefined,
          borderRadius: isTablet ? 20 : 0,
          marginBottom: isTablet ? 8 : 0,
        },
      ]}
    >
      {/* Accent josla augšā */}
      <View style={[st.topAccent, { backgroundColor: accentColor }]} />

      {/* Dziesmas ikona */}
      <Animated.View style={[
        st.iconWrap,
        {
          backgroundColor: accentColor + '20',
          borderColor: accentColor + '44',
          transform: [{ scale: pulse }],
        },
      ]}>
        <Ionicons
          name={isPlaying ? 'musical-notes' : 'musical-note'}
          size={16}
          color={accentColor}
        />
      </Animated.View>

      {/* Info */}
      <View style={st.info}>
        <Text style={[st.title, { color: colors.text }]} numberOfLines={1}>
          {playing.title || '—'}
        </Text>
        <Text style={[st.artist, { color: colors.subText }]} numberOfLines={1}>
          {playing.artist || '—'}
        </Text>
      </View>

      {/* Kontroles */}
      <TouchableOpacity onPress={playPrev} style={st.ctrlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="play-skip-back" size={20} color={colors.subText} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggle}
        style={[st.playBtn, { backgroundColor: accentColor, shadowColor: accentColor }]}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color="#000"
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={playNext} style={st.ctrlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="play-skip-forward" size={20} color={colors.subText} />
      </TouchableOpacity>

      <TouchableOpacity onPress={close} style={st.ctrlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={20} color="#ff446699" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
  },
  iconWrap: {
    width: 38, height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  info:    { flex: 1, minWidth: 0 },
  title:   { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  artist:  { fontSize: 11 },
  ctrlBtn: { padding: 4, flexShrink: 0 },
  playBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
