import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

// TopBar — TIKAI UI komponents
// Audio tiek pārvaldīts PlayerBar.tsx (tabs layout apakšā)
// TopBar rāda banner ticker un papildu kontroles ja vajag

export default function TopBar() {
  const {
    playing, isPlaying,
    playNext, playPrev,
    shuffle, setShuffle,
    repeat, setRepeat,
    banner,
  } = useApp();

  const tickerAnim = useRef(new Animated.Value(400)).current;
  const tickerLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Banner ticker animācija
  useEffect(() => {
    if (tickerLoop.current) tickerLoop.current.stop();
    if (!banner) return;
    tickerAnim.setValue(400);
    tickerLoop.current = Animated.loop(
      Animated.timing(tickerAnim, {
        toValue: -800,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    tickerLoop.current.start();
    return () => { tickerLoop.current?.stop(); };
  }, [banner]);

  // Nav nekas ja nav banner un nav playing
  if (!banner && !playing) return null;

  return (
    <View style={s.wrapper}>
      {/* Banner ticker */}
      {!!banner && (
        <View style={s.ticker}>
          <Animated.Text
            style={[s.tickerText, { transform: [{ translateX: tickerAnim }] }]}
          >
            📢  {banner}  •  {banner}  •  {banner}
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: '#111118',
    borderBottomColor: '#00cfff22',
    borderBottomWidth: 1,
  },
  ticker: {
    backgroundColor: '#001a00',
    overflow: 'hidden',
    height: 26,
    justifyContent: 'center',
  },
  tickerText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
  } as any,
});
