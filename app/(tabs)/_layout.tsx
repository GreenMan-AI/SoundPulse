import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../components/AppContext';
import PlayerBar from '../../components/PlayerBar';
import TopBar from '../../components/TopBar';

// ── Augšējā josla ar logo un lietotāju ──
function TopNav() {
  const { colors, accentColor, user } = useApp();
  return (
    <View style={[tn.wrapper, {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
        <View style={tn.row}>
          <Text style={[tn.logo, { color: accentColor }]}>
            Sound<Text style={{ color: colors.text }}>Pulse</Text>
          </Text>
          <View style={tn.right}>
            {user?.isAdmin && (
              <View style={[tn.badge, { backgroundColor: '#f59e0b18', borderColor: '#f59e0b33' }]}>
                <Ionicons name="shield-checkmark" size={11} color="#f59e0b" />
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

const tn = StyleSheet.create({
  wrapper:   { borderBottomWidth: 1, zIndex: 10 },
  row:       {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 13,
  },
  logo:      { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  right:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:     {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  adminTxt:  { color: '#f59e0b', fontSize: 11, fontWeight: '800' },
  userPill:  {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1, maxWidth: 130,
  },
  userTxt:   { fontSize: 12, fontWeight: '700' },
});

// ── Galvenais layout ──
export default function TabLayout() {
  const { t, user, accentColor, colors } = useApp();
  const isAdmin = user?.isAdmin;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopNav />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor:  accentColor + '22',
            borderTopWidth:  1,
            height:          Platform.OS === 'ios' ? 80 : 62,
            paddingBottom:   Platform.OS === 'ios' ? 20 : 8,
            paddingTop:      6,
          },
          tabBarActiveTintColor:   accentColor,
          tabBarInactiveTintColor: colors.subText,
          tabBarLabelStyle:        { fontSize: 10, fontWeight: '700' },
        }}
      >
        {/* 1. Mūzika */}
        <Tabs.Screen
          name="index"
          options={{
            title: t.music ?? 'Mūzika',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" size={size} color={color} />
            ),
          }}
        />

        {/* 2. Atklāt */}
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Atklāt',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass" size={size} color={color} />
            ),
          }}
        />

        {/* 3. Upload — centrālā poga */}
        <Tabs.Screen
          name="upload"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={[
                fab.btn,
                {
                  backgroundColor: accentColor,
                  shadowColor:     accentColor,
                  transform:       [{ scale: focused ? 1.08 : 1 }],
                },
              ]}>
                <Ionicons name="cloud-upload" size={24} color="#000" />
              </View>
            ),
          }}
        />

        {/* 4. Mood — slēpts adminam */}
        <Tabs.Screen
          name="mood"
          options={{
            title: t.mood ?? 'Mood',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles" size={size} color={color} />
            ),
            tabBarItemStyle: isAdmin ? { display: 'none' } : {},
          }}
        />

        {/* 5. Profils */}
        <Tabs.Screen
          name="profile"
          options={{
            title: t.profile ?? 'Profils',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        {/* Slēptie — nav tab joslā */}
        <Tabs.Screen name="explore"  options={{ href: null }} />
        <Tabs.Screen name="playlist" options={{ href: null }} />
        <Tabs.Screen name="share"    options={{ href: null }} />
        <Tabs.Screen name="admin"    options={{ href: null }} />
        <Tabs.Screen name="diag"     options={{ href: null }} />
      </Tabs>

      <PlayerBar />
    </View>
  );
}

const fab = StyleSheet.create({
  btn: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 12,
  },
});
