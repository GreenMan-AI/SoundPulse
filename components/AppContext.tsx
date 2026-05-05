import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Lang } from '../i18n';

export const API = 'https://soundpulse-oe3r.onrender.com';

export const themes = {
  dark: { bg: '#0a0a0f', card: '#111118', text: '#ffffff', subText: '#999999', border: '#1e1e2a', tabBar: '#0f0f14' },
  light: { bg: '#f4f4f9', card: '#ffffff', text: '#1a1a1a', subText: '#666666', border: '#e0e0e0', tabBar: '#ffffff' }
};

export type ThemeMode = 'light' | 'dark';

interface AppContextType {
  lang: Lang; setLang: (l: Lang) => void;
  t: any; themeMode: ThemeMode; setThemeMode: (m: ThemeMode) => void;
  accentColor: string; setAccentColor: (c: string) => void;
  colors: any; langChosen: boolean; setLangChosen: (v: boolean) => void;
  user: any; token: string;
  login: (u: string, p: string) => Promise<string | null>;
  logout: () => void;
  tracks: any[]; setTracks: (t: any[]) => void;
  playing: any; setPlaying: (t: any) => void;
  isPlaying: boolean; setIsPlaying: (v: boolean) => void;
  playlist: any[]; addToPlaylist: (t: any) => void; removeFromPlaylist: (id: string) => void;
  playNext: () => void; playPrev: () => void;
  sleepTimer: number | null; setSleepTimer: (min: number | null) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('lv');
  const [langChosen, setLangChosen] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState('#00cfff');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [playing, setPlaying] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);

  const colors = { ...themes[themeMode], accent: accentColor };
  const t = translations[lang];

  useEffect(() => {
    (async () => {
      const [sLang, sTheme, sColor, sToken] = await Promise.all([
        AsyncStorage.getItem('user_lang'), AsyncStorage.getItem('user_theme'),
        AsyncStorage.getItem('user_accent'), AsyncStorage.getItem('user_token')
      ]);
      if (sLang) setLangState(sLang as Lang);
      if (sTheme) setThemeModeState(sTheme as ThemeMode);
      if (sColor) setAccentColorState(sColor);
      if (sToken) {
        setToken(sToken);
        try {
          const res = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${sToken}` } });
          const d = await res.json();
          if (d.username) { setUser({ ...d, isAdmin: d.role === 'admin' }); setLangChosen(true); }
        } catch { setLangChosen(false); }
      }
    })();
  }, []);

  const playNext = () => {
    const list = playlist.length > 0 ? playlist : tracks;
    const idx = list.findIndex(i => i._id === playing?._id);
    if (idx !== -1 && idx < list.length - 1) setPlaying(list[idx + 1]);
  };

  const playPrev = () => {
    const list = playlist.length > 0 ? playlist : tracks;
    const idx = list.findIndex(i => i._id === playing?._id);
    if (idx > 0) setPlaying(list[idx - 1]);
  };

  const login = async (u: string, p: string) => {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const d = await res.json();
      if (d.token) {
        setUser({ ...d, isAdmin: d.role === 'admin' });
        setToken(d.token);
        await AsyncStorage.setItem('user_token', d.token);
        setLangChosen(true);
        return null;
      }
      return d.error || "Login error";
    } catch { return "Server error"; }
  };

  const logout = () => { setUser(null); setToken(''); AsyncStorage.removeItem('user_token'); setLangChosen(false); };

  return (
    <AppContext.Provider value={{
      lang, setLang: (l) => { setLangState(l); AsyncStorage.setItem('user_lang', l); },
      t, themeMode, setThemeMode: (m) => { setThemeModeState(m); AsyncStorage.setItem('user_theme', m); },
      accentColor, setAccentColor: (c) => { setAccentColorState(c); AsyncStorage.setItem('user_accent', c); },
      colors, langChosen, setLangChosen, user, token, login, logout,
      tracks, setTracks, playing, setPlaying, isPlaying, setIsPlaying,
      playlist, addToPlaylist: (tr) => { if (!playlist.find(x => x._id === tr._id)) setPlaylist([...playlist, tr]); },
      removeFromPlaylist: (id) => setPlaylist(playlist.filter(x => x._id !== id)),
      playNext, playPrev, sleepTimer, setSleepTimer
    }}>
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);