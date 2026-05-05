import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './AppContext';

const { height: SH } = Dimensions.get('window');

interface Props {
  track: any;
  onClose: () => void;
  position: number; // Pašreizējais laiks sekundēs
}

export default function LyricsView({ track, onClose, position }: Props) {
  const { colors, accentColor, t } = useApp();
  const scrollRef = useRef<ScrollView>(null);

  // Pieņemsim, ka vārdi nāk kā masīvs ar objektiem: { time: 12, text: "Sveika, pasaule" }
  // Ja datubāzē vārdu nav, izmantojam tukšu masīvu.
  const lyrics = track.lyrics || [];

  // Automātiska rullēšana pie aktīvā vārda
  useEffect(() => {
    const activeIndex = lyrics.findIndex((l: any, i: number) => {
      const next = lyrics[i + 1];
      return position >= l.time && (!next || position < next.time);
    });

    if (activeIndex !== -1 && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: activeIndex * 60, // Pieņemam, ka rindas augstums ir ~60
        animated: true,
      });
    }
  }, [position]);

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: colors.text }]} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={[s.artist, { color: colors.subText }]}>{track.artist}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Lyrics List */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lyrics.length > 0 ? (
          lyrics.map((line: any, index: number) => {
            const isNext = lyrics[index + 1];
            const isActive = position >= line.time && (!isNext || position < isNext.time);

            return (
              <View key={index} style={s.lineBox}>
                <Text
                  style={[
                    s.lineText,
                    {
                      color: isActive ? accentColor : colors.subText,
                      fontSize: isActive ? 28 : 22,
                      opacity: isActive ? 1 : 0.4,
                    },
                  ]}
                >
                  {line.text}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={s.emptyBox}>
            <Ionicons name="mic-off-outline" size={64} color={colors.border} />
            <Text style={[s.emptyText, { color: colors.subText }]}>
              {lang === 'lv' ? 'Dziesmas vārdi nav pieejami' : 'Lyrics not available'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  artist: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: SH / 2,
    paddingTop: 40,
  },
  lineBox: {
    minHeight: 60,
    justifyContent: 'center',
    marginVertical: 10,
  },
  lineText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  emptyBox: {
    height: SH / 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});