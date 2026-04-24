import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from './AppContext';

export default function TopBar() {
  const { playing, setPlaying, isPlaying, setIsPlaying, playNext, playPrev, shuffle, setShuffle, repeat, setRepeat, ticker, tickerActive, loadTicker } = useApp();
  const soundRef = useRef<Audio.Sound | null>(null);
  const playingIdRef = useRef<string>('');
  const tickerAnim = useRef(new Animated.Value(0)).current;
  const tickerLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
    loadTicker();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  useEffect(() => {
    if (tickerLoop.current) { tickerLoop.current.stop(); }
    if (!tickerActive || !ticker) return;
    tickerAnim.setValue(400);
    tickerLoop.current = Animated.loop(
      Animated.timing(tickerAnim, { toValue: -800, duration: 14000, easing: Easing.linear, useNativeDriver: true })
    );
    tickerLoop.current.start();
  }, [ticker, tickerActive]);

  useEffect(() => {
    if (!playing) { soundRef.current?.unloadAsync(); soundRef.current = null; return; }
    if (playingIdRef.current === playing._id) {
      isPlaying ? soundRef.current?.playAsync() : soundRef.current?.pauseAsync();
      return;
    }
    loadTrack();
  }, [playing, isPlaying]);

  const loadTrack = async () => {
    try {
      if (soundRef.current) { await soundRef.current.unloadAsync(); soundRef.current = null; }
      if (!playing?.cloudUrl) return;
      playingIdRef.current = playing._id;
      const { sound } = await Audio.Sound.createAsync({ uri: playing.cloudUrl }, { shouldPlay: true });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((s: any) => { if (s.didJustFinish) playNext(); });
    } catch {}
  };

  const toggle = async () => {
    if (!soundRef.current) return;
    if (isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
    else { await soundRef.current.playAsync(); setIsPlaying(true); }
  };

  const stop = async () => {
    await soundRef.current?.unloadAsync();
    soundRef.current = null; playingIdRef.current = '';
    setPlaying(null); setIsPlaying(false);
  };

  return (
    <View style={s.wrapper}>
      {tickerActive && ticker ? (
        <View style={s.ticker}>
          <Animated.Text style={[s.tickerText, { transform: [{ translateX: tickerAnim }] }]}>
            📢  {ticker}  •  {ticker}  •  {ticker}
          </Animated.Text>
        </View>
      ) : null}

      {playing ? (
        <View style={s.player}>
          <View style={s.info}>
            <View style={[s.disc, isPlaying && s.discPlaying]}>
              <Ionicons name="musical-note" size={13} color={isPlaying ? '#000' : '#00cfff'} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.title} numberOfLines={1}>{playing.title || '---'}</Text>
              <Text style={s.artist} numberOfLines={1}>{playing.artist || '---'}</Text>
            </View>
          </View>
          <View style={s.controls}>
            <TouchableOpacity onPress={() => setShuffle(!shuffle)} style={s.btn}>
              <Ionicons name="shuffle" size={15} color={shuffle ? '#00cfff' : '#444'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={playPrev} style={s.btn}>
              <Ionicons name="play-skip-back" size={17} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggle} style={s.playBtn}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={17} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={playNext} style={s.btn}>
              <Ionicons name="play-skip-forward" size={17} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRepeat(!repeat)} style={s.btn}>
              <Ionicons name="repeat" size={15} color={repeat ? '#00cfff' : '#444'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={stop} style={s.btn}>
              <Ionicons name="close" size={17} color="#ff4466" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { backgroundColor: '#111118', borderBottomColor: '#00cfff22', borderBottomWidth: 1 },
  ticker: { backgroundColor: '#001500', overflow: 'hidden', height: 24, justifyContent: 'center' },
  tickerText: { color: '#00ff88', fontSize: 12, fontWeight: '700', position: 'absolute'} as any,
  player: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7 },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  disc: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0d1a2a', justifyContent: 'center', alignItems: 'center' },
  discPlaying: { backgroundColor: '#00cfff' },
  title: { color: '#fff', fontSize: 12, fontWeight: '600' },
  artist: { color: '#888', fontSize: 10 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  btn: { padding: 4 },
  playBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#00cfff', justifyContent: 'center', alignItems: 'center', marginHorizontal: 3 },
});
