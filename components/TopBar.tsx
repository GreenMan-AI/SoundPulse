import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useApp } from './AppContext';

export default function TopBar() {
  const { banner } = useApp();
  const anim = useRef(new Animated.Value(400)).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (loop.current) loop.current.stop();
    if (!banner) return;
    anim.setValue(400);
    loop.current = Animated.loop(
      Animated.timing(anim, {
        toValue: -900,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.current.start();
    return () => { loop.current?.stop(); };
  }, [banner]);

  if (!banner) return null;

  return (
    <View style={s.wrapper}>
      <View style={s.ticker}>
        <Text style={s.icon}>📢</Text>
        <View style={s.overflow}>
          <Animated.Text style={[s.text, { transform: [{ translateX: anim }] }]}>
            {banner}  •  {banner}  •  {banner}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:  { backgroundColor: '#00ff8810', borderBottomWidth: 1, borderBottomColor: '#00ff8828' },
  ticker:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 26, overflow: 'hidden' },
  icon:     { fontSize: 13, marginRight: 6, flexShrink: 0 },
  overflow: { flex: 1, overflow: 'hidden' },
  text:     { color: '#22c679', fontSize: 12, fontWeight: '800', position: 'absolute', width: 2000 },
});
