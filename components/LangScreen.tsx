import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { Lang } from '../i18n';

const LANGS = [
  { code: 'lv' as Lang, flag: '🇱🇻', name: 'Latviešu' },
  { code: 'en' as Lang, flag: '🇬🇧', name: 'English' },
  { code: 'ru' as Lang, flag: '🇷🇺', name: 'Русский' },
];

export default function LangScreen() {
  const { setLang, setLangChosen, colors, accentColor } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(); // Šeit tagad viss ir aizvērts pareizi
  }, []);

  const select = (code: Lang) => {
    setLang(code);
    setLangChosen(true);
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]}>
      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <View style={s.header}>
          <Text style={[s.emoji, { textShadowColor: accentColor, textShadowRadius: 15 }]}>🌐</Text>
          <Text style={[s.title, { color: colors.text }]}>Izvēlies valodu</Text>
          <Text style={[s.subtitle, { color: colors.subText }]}>Choose your language</Text>
        </View>

        <View style={s.list}>
          {LANGS.map((l) => (
            <TouchableOpacity 
              key={l.code} 
              style={[s.btn, { backgroundColor: colors.card, borderColor: colors.border }]} 
              onPress={() => select(l.code)}
              activeOpacity={0.7}
            >
              <Text style={s.flag}>{l.flag}</Text>
              <Text style={[s.name, { color: colors.text }]}>{l.name}</Text>
              <View style={[s.arrow, { backgroundColor: accentColor + '20' }]}>
                <Text style={{ color: accentColor, fontWeight: '900' }}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 50 },
  emoji: { fontSize: 64, marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 5, opacity: 0.7 },
  list: { gap: 15 },
  btn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    elevation: 2 
  },
  flag: { fontSize: 24, marginRight: 15 },
  name: { flex: 1, fontSize: 18, fontWeight: '800' },
  arrow: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});