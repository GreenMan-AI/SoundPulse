import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useApp } from './AppContext';

const { width } = Dimensions.get('window');

export default function Player() {
  const { 
    playing, isPlaying, setIsPlaying, 
    playNext, playPrev, colors, accentColor 
  } = useApp();
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Audio ielādes loģika
  useEffect(() => {
    async function loadAudio() {
      if (playing?.audioUrl) {
        // Apturam iepriekšējo skaņu, ja tāda bija
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: playing.audioUrl },
          { shouldPlay: isPlaying }
        );
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            playNext();
          }
        });
      }
    }
    loadAudio();
  }, [playing]);

  // Atskaņošanas/Pauzes kontrole
  useEffect(() => {
    if (sound) {
      if (isPlaying) {
        sound.playAsync();
      } else {
        sound.pauseAsync();
      }
    }
  }, [isPlaying, sound]);

  // Ja nekas netiek atskaņots, neko nerādām
  if (!playing) return null;

  return (
    <View style={[s.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <View style={s.content}>
        
        {/* DZIESMAS INFO */}
        <TouchableOpacity style={s.infoSide} activeOpacity={0.8}>
          <Image 
            source={{ uri: playing.coverUrl || 'https://via.placeholder.com/150' }} 
            style={s.cover} 
          />
          <View style={s.textContainer}>
            <Text numberOfLines={1} style={[s.title, { color: colors.text }]}>
              {playing.title}
            </Text>
            <Text numberOfLines={1} style={[s.artist, { color: colors.subText }]}>
              {playing.artist}
            </Text>
          </View>
        </TouchableOpacity>

        {/* KONTROLES POGAS */}
        <View style={s.controls}>
          <TouchableOpacity onPress={playPrev}>
            <Ionicons name="play-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setIsPlaying(!isPlaying)} 
            style={[s.playBtn, { backgroundColor: accentColor }]}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={26} 
              color="#000" 
              style={{ marginLeft: isPlaying ? 0 : 3 }} 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext}>
            <Ionicons name="play-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

      </View>
      
      {/* MAZA PROGRESA JOSLA APAKŠĀ (Dekoratīva) */}
      <View style={[s.progressBarBg, { backgroundColor: colors.border }]}>
        <View style={[s.progressBarFill, { backgroundColor: accentColor, width: '35%' }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 68, // Precīzi virs Tab joslas
    width: width - 20,
    marginHorizontal: 10,
    height: 70,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between'
  },
  infoSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a1a'
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  artist: {
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  }
});