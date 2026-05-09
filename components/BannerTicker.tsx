import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity,
} from 'react-native';
import { useApp } from './AppContext';

const { width: SW } = Dimensions.get('window');

export default function BannerTicker() {
  const { banner, setBanner } = useApp();
  const translateX = useRef(new Animated.Value(SW)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!banner) {
      translateX.setValue(SW);
      anim.current?.stop();
      return;
    }
    // Estimate text width (aprox 9px per char) + padding
    const textWidth = banner.length * 9 + 80;
    const totalDistance = SW + textWidth;
    const duration = Math.max(8000, totalDistance * 18); // ~18ms per px

    translateX.setValue(SW);
    anim.current = Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration,
        useNativeDriver: true,
      })
    );
    anim.current.start();

    return () => { anim.current?.stop(); };
  }, [banner]);

  if (!banner) return null;

  return (
    <View style={s.wrap}>
      <View style={s.label}>
        <Text style={s.labelTxt}>📢</Text>
      </View>
      <View style={s.ticker}>
        <Animated.Text
          style={[s.text, { transform: [{ translateX }] }]}
          numberOfLines={1}
        >
          {banner}{'   ✦   '}{banner}
        </Animated.Text>
      </View>
      <TouchableOpacity
        style={s.close}
        onPress={() => setBanner('')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={s.closeTxt}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    borderTopWidth: 1,
    borderTopColor: '#f59e0b44',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  labelTxt: {
    fontSize: 14,
  },
  ticker: {
    flex: 1,
    overflow: 'hidden',
    height: 20,
  },
  text: {
    color: '#313c9e',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    position: 'absolute',
    whiteSpace: 'nowrap' as any,
  },
  close: {
    paddingHorizontal: 10,
    flexShrink: 0,
  },
  closeTxt: {
    color: '#a92323',
    fontSize: 14,
    fontWeight: '700',
  },
});
