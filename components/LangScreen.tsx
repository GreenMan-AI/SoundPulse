import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Animated, Easing,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from './AppContext';

const LANGS = [
  { code: 'lv', flag: '🇱🇻', name: 'Latviešu', sub: 'Latvian' },
  { code: 'en', flag: '🇬🇧', name: 'English',  sub: 'English' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский',  sub: 'Russian' },
];

const RAINBOW = [
  '#ff0000','#ff4400','#ff8800','#ffcc00',
  '#aaff00','#00ff44','#00ccff','#0044ff',
  '#8800ff','#ff00cc','#ff0066','#ff0000',
];

// ── Krāsu maiņa caur setInterval — JS puse, NEKAD nekonflikē ar useNativeDriver ──
function useColor(ms: number, offset = 0) {
  const [i, setI] = useState(offset % RAINBOW.length);
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % RAINBOW.length), ms);
    return () => clearInterval(id);
  }, [ms]);
  return RAINBOW[i];
}

export default function LangScreen() {
  const { setLang, setLangChosen } = useApp();

  // ── GRIEŠANĀS — useNativeDriver: true (tikai transform) ──
  const rotO = useRef(new Animated.Value(0)).current;
  const rotM = useRef(new Animated.Value(0)).current;
  const rotI = useRef(new Animated.Value(0)).current;
  const sc   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const go = (a: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.timing(a, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true })
      ).start();

    go(rotO, 18000);
    go(rotM, 12000);
    go(rotI,  7500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(sc, { toValue: 1.14, duration: 850, useNativeDriver: true }),
        Animated.timing(sc, { toValue: 1,    duration: 850, useNativeDriver: true }),
      ])
    ).start();

    return () => [rotO, rotM, rotI, sc].forEach(a => a.stopAnimation());
  }, []);

  const deg = (a: Animated.Value, rev = false) =>
    a.interpolate({ inputRange: [0,1], outputRange: rev ? ['360deg','0deg'] : ['0deg','360deg'] });

  // ── KRĀSAS — setInterval, JS puse ──
  const cRing1 = useColor(220,  0);
  const cRing2 = useColor(280,  4);
  const cRing3 = useColor(190,  8);
  const cLogo  = useColor(160,  2);
  const cTitle = useColor(200,  6);
  const cOrb1  = useColor(240,  1);
  const cOrb2  = useColor(310,  5);
  const cOrb3  = useColor(195,  9);
  const cOrb4  = useColor(265,  3);
  const cOrb5  = useColor(175,  7);
  const cCenter= useColor(130, 10);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>

        {/* ── VIZUALIZATORS ── */}
        <View style={s.vis}>

          {/* Ārējais gredzens */}
          <Animated.View style={[s.ring, s.rOuter, {
            borderColor: cRing1,
            transform: [{ rotate: deg(rotO) }],
          }]}>
            <Text style={[s.orb, { top: '4%',  left: '16%', color: cOrb1, fontSize: 18 }]}>♩</Text>
            <Text style={[s.orb, { top: '44%', right: -8,   color: cOrb2, fontSize: 20 }]}>𝄞</Text>
            <Text style={[s.orb, { bottom: '8%', right: '18%', color: cOrb3, fontSize: 16 }]}>🎸</Text>
          </Animated.View>

          {/* Vidējais gredzens — otrādi */}
          <Animated.View style={[s.ring, s.rMiddle, {
            borderColor: cRing2,
            transform: [{ rotate: deg(rotM, true) }],
          }]}>
            <Text style={[s.orb, { top: -10, left: '43%', color: cOrb4, fontSize: 18 }]}>♪</Text>
            <Text style={[s.orb, { bottom: '8%', left: '6%', color: cOrb5, fontSize: 16 }]}>♬</Text>
            <Text style={[s.orb, { top: '20%', right: -4, color: cRing1, fontSize: 14 }]}>🎵</Text>
          </Animated.View>

          {/* Iekšējais gredzens */}
          <Animated.View style={[s.ring, s.rInner, {
            borderColor: cRing3,
            transform: [{ rotate: deg(rotI) }],
          }]}>
            <Text style={[s.orb, { top: '10%', right: '10%', color: cOrb1, fontSize: 14 }]}>♫</Text>
            <Text style={[s.orb, { bottom: '8%', left: '12%', color: cRing2, fontSize: 12 }]}>🎶</Text>
          </Animated.View>

          {/* Centrālais aplis — pulss ar scale (native OK) */}
          <Animated.View style={[s.center, {
            borderColor: cRing1,
            transform: [{ scale: sc }],
          }]}>
            <Text style={[s.centerIcon, { color: cCenter }]}>🎵</Text>
          </Animated.View>

        </View>

        {/* ── LOGO ── */}
        <View style={s.logoRow}>
          <Text style={[s.logoWave, { color: cRing2 }]}>〜</Text>
          <Text style={[s.logoTxt, { color: cLogo }]}>SoundPulse</Text>
        </View>
        <Text style={[s.platform, { color: cRing3 }]}>MUSIC PLATFORM</Text>

        {/* ── VIRSRAKSTS ── */}
        <View style={s.titleRow}>
          <Text style={{ fontSize: 28, color: cRing3 }}>🎻</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={[s.mainTitle, { color: cTitle }]}>Izvēlies savu valodu</Text>
            <Text style={s.subTitle}>Choose your language</Text>
          </View>
        </View>

        {/* ── VALODAS ── */}
        <View style={s.list}>
          {LANGS.map(l => (
            <TouchableOpacity
              key={l.code}
              style={s.langBtn}
              onPress={() => { setLang(l.code as any); setLangChosen(true); }}
              activeOpacity={0.75}
            >
              <Text style={s.flag}>{l.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.langName}>{l.name}</Text>
                <Text style={s.langSub}>{l.sub}</Text>
              </View>
              <View style={s.radio} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.footer}>SoundPulse v1.1 • 2025</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#080810' },
  content:    { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 40 },

  vis:        { width: 260, height: 260, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ring:       { position: 'absolute', borderRadius: 1000, borderWidth: 1.5, borderStyle: 'dashed' },
  rOuter:     { width: 252, height: 252 },
  rMiddle:    { width: 196, height: 196 },
  rInner:     { width: 146, height: 146 },
  orb:        { position: 'absolute', fontWeight: '700' },

  center:     {
    width: 106, height: 106, borderRadius: 53,
    backgroundColor: '#0d0d1a',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#8800ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 20,
  },
  centerIcon: { fontSize: 46 },

  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  logoWave:   { fontSize: 26, fontWeight: '900' },
  logoTxt:    { fontSize: 38, fontWeight: '900', letterSpacing: -1.5 },
  platform:   { fontSize: 9, letterSpacing: 5, marginTop: 2, fontWeight: '900' },

  titleRow:   { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 24, marginBottom: 16 },
  mainTitle:  { fontSize: 20, fontWeight: '900' },
  subTitle:   { color: '#555', fontSize: 13, marginTop: 2 },

  list:       { width: '100%', gap: 10 },
  langBtn:    {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0e0e18', padding: 18,
    borderRadius: 24, borderWidth: 1, borderColor: '#1a1a28',
  },
  flag:       { fontSize: 30, marginRight: 14 },
  langName:   { color: '#fff', fontSize: 17, fontWeight: '700' },
  langSub:    { color: '#444', fontSize: 12, marginTop: 2 },
  radio:      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#2a2a3a' },
  footer:     { marginTop: 'auto', marginBottom: 16, color: '#1e1e2e', fontSize: 9, letterSpacing: 3 },
});
