import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../components/AppContext';
import PlayerBar from '../../components/PlayerBar';
import TopBar from '../../components/TopBar';

// ── 1. Augšējā josla ar logo un lietotāju ──
function TopNav() {
  const { colors, accentColor, user } = useApp();
  return (
    <View style={[tn.wrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
        <View style={tn.row}>
          <Text style={[tn.logo, { color: accentColor }]}>
            Sound<Text style={{ color: colors.text }}>Pulse</Text>
          </Text>
          <View style={tn.right}>
            {user?.isAdmin && (
              <View style={[tn.badge, { backgroundColor: '#f59e0b18', borderColor: '#f59e0b33' }]}>
                <Ionicons name="shield-checkmark" size={11} color="#095c1d" />
                <Text style={tn.adminTxt}>Admin</Text>
              </View>
            )}
            <View style={[tn.userPill, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}>
              <Ionicons name="person-circle-outline" size={14} color={accentColor} />
              <Text style={[tn.userTxt, { color: accentColor }]} numberOfLines={1}>
                {user?.username ?? '—'}
              </Text>
            </View>
          </View>
        </View>
        <TopBar />
      </SafeAreaView>
    </View>
  );
}

// ── 2. Galvenais layout ──
export default function TabLayout() {
  const { t, user, accentColor, colors } = useApp();
  const isAdmin = user?.isAdmin;

  // Fiksēts izvēlnes joslas augstums
  const TAB_BAR_HEIGHT = 50;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Logo un TopBar (pašā augšā) */}
      <TopNav />

      {/* 
          Ietvars, kas satur navigāciju un ekrānu saturu.
          marginTop nobīda saturu uz leju, lai atbrīvotu vietu izvēlnei.
      */}
      <View style={{ flex: 1, marginTop: TAB_BAR_HEIGHT }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderBottomColor: accentColor + '22',
              borderBottomWidth: 1,
              borderTopWidth: 0,
              height: TAB_BAR_HEIGHT,
              position: 'absolute',
              // Uzvelkam navigāciju augšā tukšajā vietā (zem TopNav)
              top: -TAB_BAR_HEIGHT, 
              left: 0,
              right: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarActiveTintColor: accentColor,
            tabBarInactiveTintColor: colors.subText,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 5 },
            tabBarIconStyle: { marginTop: 5 },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t.music ?? 'Mūzika',
              tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={20} color={color} />,
            }}
          />
          {/* 2. Atklāt — Šis bloks tagad ir "dzīvāks" */}
          <Tabs.Screen
            name="discover"
            options={{
              title: 'Atklāt',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  backgroundColor: focused ? accentColor + '15' : 'transparent', // Maigs fons, kad aktīvs
                  padding: 8,
                  borderRadius: 12,
                  marginBottom: -2,
                }}>
                  <Ionicons 
                    name={focused ? "compass" : "compass-outline"} // Maina ikonu uz pilno versiju
                    size={focused ? 24 : 20} // Nedaudz palielinās, kad aktīvs
                    color={color} 
                  />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="upload"
            options={{
              title: 'Lādēt',
              tabBarIcon: ({ color }) => <Ionicons name="cloud-upload" size={20} color={color} />,
            }}
          />
          <Tabs.Screen
            name="mood"
            options={{
              title: t.mood ?? 'Mood',
              tabBarIcon: ({ color }) => <Ionicons name="sparkles" size={20} color={color} />,
              tabBarItemStyle: isAdmin ? { display: 'none' } : {},
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: t.profile ?? 'Profils',
              tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
            }}
          />

          {/* Slēptie ekrāni (bez ikonām joslā) */}
          <Tabs.Screen name="explore"  options={{ href: null }} />
          <Tabs.Screen name="playlist" options={{ href: null }} />
          <Tabs.Screen name="share"    options={{ href: null }} />
          <Tabs.Screen name="admin"    options={{ href: null }} />
          <Tabs.Screen name="diag"     options={{ href: null }} />
        </Tabs>
      </View>

      {/* Atskaņotājs (apakšā) */}
      <PlayerBar />
    </View>
  );
}

// ── 3. Stili (Tavs tn objekts) ──
const tn = StyleSheet.create({
  wrapper: { borderBottomWidth: 1, zIndex: 10 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 18, 
    paddingVertical: 13 
  },
  logo: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    borderWidth: 1 
  },
  adminTxt: { color: '#f59e0b', fontSize: 11, fontWeight: '800' },
  userPill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10, 
    borderWidth: 1, 
    maxWidth: 130 
  },
  userTxt: { fontSize: 12, fontWeight: '700' },
});