import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Lang } from '../i18n';

export const API = 'https://soundpulse-oe3r.onrender.com';

// Bāzes tēmu krāsas
export const themes = {
  dark: {
    bg: '#0a0a0f',
    card: '#111118',
    text: '#ffffff',
    subText: '#999999',
    border: '#1e1e2a',
    tabBar: '#0f0f14',
  },
  light: {
    bg: '#f4f4f9',
    card: '#ffffff',
    text: '#1a1a1a',
    subText: '#666666',
    border: '#e0e0e0',
    tabBar: '#ffffff',
  }
};

export type ThemeMode = 'light' | 'dark';
export interface NamedPlaylist { id: string; name: string; tracks: any[]; }

interface AppContextType {
  lang: Lang; setLang: (l: Lang) => void;
  t: typeof translations.lv;
  themeMode: ThemeMode; setThemeMode: (m: ThemeMode) => void;
  accentColor: string; setAccentColor: (c: string) => void;
  colors: any; 
  
  langChosen: boolean; setLangChosen: (v: boolean) => void;
  user: any; token: string;
  login: (u: string, p: string) => Promise<string | null>;
  register: (u: string, p: string) => Promise<string | null>;
  logout: () => void;
  tracks: any[]; setTracks: (t: any[]) => void;
  playing: any; setPlaying: (t: any) => void;
  isPlaying: boolean; setIsPlaying: (v: boolean) => void;
  playNext: () => void; playPrev: () => void;
  shuffle: boolean; setShuffle: (v: boolean) => void;
  repeat: boolean; setRepeat: (v: boolean) => void;
  playlist: any[];
  addToPlaylist: (track: any) => void;
  removeFromPlaylist: (id: string) => void;
  namedPlaylists: NamedPlaylist[];
  createNamedPlaylist: (name: string) => void;
  deleteNamedPlaylist: (id: string) => void;
  addTrackToNamedPlaylist: (plId: string, track: any) => void;
  removeTrackFromNamedPlaylist: (plId: string, trackId: string) => void;
  likes: string[]; toggleLike: (id: string) => void;
  banner: string; setBanner: (v: string) => void;
  profileData: { nick: string; avatarUrl: string; bio: string; mood: string; };
  saveProfile: (data: { nick?: string; bio?: string; mood?: string; }) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string | null>;
  uploadLimits: { remaining: number; maxSizeMB: number; maxDurationMin: number; } | null;
  fetchUploadLimits: () => Promise<void>;
  serverOnline: boolean;
  appIntegrity: { isPrivate: boolean; isEncrypted: boolean; noTracking: boolean; };
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('lv');
  const [langChosen, setLangChosen] = useState(false);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState('#00cfff');
  
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState('');
  const [serverOnline, setServerOnline] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [playing, setPlaying] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [namedPlaylists, setNamedPlaylists] = useState<NamedPlaylist[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [banner, setBanner] = useState('');
  const [profileData, setProfileData] = useState({ nick: '', avatarUrl: '', bio: '', mood: '' });
  const [uploadLimits, setUploadLimits] = useState<any>(null);

  // --- DINAMISKĀS KRĀSAS ---
  // Šis objekts tiek pārrēķināts ikreiz, kad mainās tēma vai akcents
  const colors = { 
    ...themes[themeMode], 
    accent: accentColor 
  };

  const t = translations[lang];
  const appIntegrity = { isPrivate: true, isEncrypted: true, noTracking: true };

  // Ielāde no atmiņas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [sLang, sTheme, sColor] = await Promise.all([
          AsyncStorage.getItem('user_lang'),
          AsyncStorage.getItem('user_theme'),
          AsyncStorage.getItem('user_accent')
        ]);
        if (sLang) setLangState(sLang as Lang);
        if (sTheme) setThemeModeState(sTheme as ThemeMode);
        if (sColor) setAccentColorState(sColor);
      } catch (e) { console.log('Kļūda ielādējot iestatījumus'); }
    };
    loadSettings();
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('user_lang', l);
  };

  const setThemeMode = (m: ThemeMode) => {
    setThemeModeState(m);
    AsyncStorage.setItem('user_theme', m);
  };

  const setAccentColor = (c: string) => {
    setAccentColorState(c);
    AsyncStorage.setItem('user_accent', c);
  };

  // Audio iestatījumi
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  // Servera veselības pārbaude
  useEffect(() => {
    const wakeUp = async () => {
      try {
        const r = await fetch(`${API}/api/health`);
        const d = await r.json();
        if (d.ok) setServerOnline(true);
      } catch { setTimeout(wakeUp, 5000); }
    };
    wakeUp();
  }, []);

  const login = async (u: string, p: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const d = await res.json();
      if (d.token) {
        setUser({ username: d.username, role: d.role, isAdmin: d.role === 'admin' });
        setToken(d.token);
        loadProfile(d.username, d.token);
        return null;
      }
      return d.error || t.error;
    } catch { return t.serverError; }
  };

  const register = async (u: string, p: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const d = await res.json();
      if (d.token) {
        setUser({ username: d.username, role: d.role, isAdmin: d.role === 'admin' });
        setToken(d.token);
        return null;
      }
      return d.error || t.error;
    } catch { return t.serverError; }
  };

  const logout = () => {
    setUser(null); setToken('');
    setPlaying(null); setIsPlaying(false);
    setPlaylist([]); setLikes([]);
    setProfileData({ nick: '', avatarUrl: '', bio: '', mood: '' });
  };

  const loadProfile = async (username: string, tok: string) => {
    try {
      const res = await fetch(`${API}/api/profiles/${username}`);
      const d = await res.json();
      if (d.profile) {
        setProfileData({
          nick:      d.profile.nick      || username,
          avatarUrl: d.profile.avatarUrl || '',
          bio:       d.profile.bio       || '',
          mood:      d.profile.mood      || '',
        });
      }
    } catch {}
  };

  const saveProfile = async (data: { nick?: string; bio?: string; mood?: string; }) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/me/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (res.ok && d.profile) {
        setProfileData(prev => ({ ...prev, ...d.profile }));
        Alert.alert(t.info, t.saved);
      }
    } catch { Alert.alert(t.error, t.serverError); }
  };

  const uploadAvatar = async (uri: string): Promise<string | null> => {
    if (!token) return null;
    try {
      const form = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
      form.append('avatar', { uri, type, name: filename } as any);
      const res = await fetch(`${API}/api/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const d = await res.json();
      if (d.avatarUrl) {
        setProfileData(prev => ({ ...prev, avatarUrl: d.avatarUrl }));
        return d.avatarUrl;
      }
      return null;
    } catch { return null; }
  };

  const fetchUploadLimits = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/upload/limits`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setUploadLimits(d);
    } catch {}
  };

  const tracksRef = useRef<any[]>([]);
  const playingRef = useRef<any>(null);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  const playNext = () => {
    if (!tracksRef.current.length) return;
    const idx = tracksRef.current.findIndex(t => t._id === playingRef.current?._id);
    setPlaying(tracksRef.current[(idx + 1) % tracksRef.current.length]);
  };

  const playPrev = () => {
    if (!tracksRef.current.length) return;
    const idx = tracksRef.current.findIndex(t => t._id === playingRef.current?._id);
    setPlaying(tracksRef.current[(idx - 1 + tracksRef.current.length) % tracksRef.current.length]);
  };

  return (
    <AppContext.Provider value={{
      lang, setLang, t, 
      themeMode, setThemeMode, accentColor, setAccentColor, colors,
      langChosen, setLangChosen,
      user, token, login, register, logout,
      tracks, setTracks,
      playing, setPlaying, isPlaying, setIsPlaying,
      playNext, playPrev, shuffle, setShuffle, repeat, setRepeat,
      playlist, 
      addToPlaylist: (track) => {
        if (playlist.find(t => t._id === track._id)) return Alert.alert(t.info, t.alreadyAdded);
        setPlaylist(p => [...p, track]);
      },
      removeFromPlaylist: (id) => setPlaylist(p => p.filter(t => t._id !== id)),
      namedPlaylists, 
      createNamedPlaylist: (name) => setNamedPlaylists(p => [...p, { id: Date.now().toString(), name, tracks: [] }]), 
      deleteNamedPlaylist: (id) => setNamedPlaylists(p => p.filter(x => x.id !== id)),
      addTrackToNamedPlaylist: (plId, track) => setNamedPlaylists(p => p.map(x => x.id === plId ? (x.tracks.find(t=>t._id===track._id) ? (Alert.alert(t.info, t.alreadyAdded), x) : {...x, tracks: [...x.tracks, track]}) : x)),
      removeTrackFromNamedPlaylist: (plId, trackId) => setNamedPlaylists(p => p.map(x => x.id === plId ? { ...x, tracks: x.tracks.filter(t => t._id !== trackId) } : x)),
      likes, toggleLike: (id) => setLikes(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]),
      banner, setBanner,
      profileData, saveProfile, uploadAvatar,
      uploadLimits, fetchUploadLimits,
      serverOnline,
      appIntegrity,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);