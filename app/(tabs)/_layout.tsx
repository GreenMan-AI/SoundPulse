import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useApp } from '../../components/AppContext';
import PlayerBar from '../../components/PlayerBar';

export default function TabLayout() {
  const { t, user } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0d0d18',
            borderTopColor: '#1a1a2a',
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: '#00cfff',
          tabBarInactiveTintColor: '#444',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
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

        {/* 2. Meklēt */}
        <Tabs.Screen
          name="explore"
          options={{
            title: t.search ?? 'Meklēt',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />

        {/* 3. Augšupielādēt — PIEEJAMS VISIEM LIETOTĀJIEM */}
        <Tabs.Screen
          name="upload"
          options={{
            title: t.upload ?? 'Augšupielādēt',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload" size={size} color={color} />
            ),
          }}
        />

        {/* 4. Playliste */}
        <Tabs.Screen
          name="playlist"
          options={{
            title: t.playlist ?? 'Playliste',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />

        {/* 5. Mood */}
        <Tabs.Screen
          name="mood"
          options={{
            title: 'Mood',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles" size={size} color={color} />
            ),
          }}
        />

        {/* 6. Profils */}
        <Tabs.Screen
          name="profile"
          options={{
            title: t.profile ?? 'Profils',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        {/* 7. Dalīties */}
        <Tabs.Screen
          name="share"
          options={{
            title: 'Dalīties',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="share-social" size={size} color={color} />
            ),
          }}
        />

        {/* 8. Admin — tikai adminiem */}
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark" size={size} color={color} />
            ),
            tabBarItemStyle: user?.isAdmin ? {} : { display: 'none' },
          }}
        />

        {/* 9. Diag — tikai adminiem */}
        <Tabs.Screen
          name="diag"
          options={{
            title: 'Diag',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="construct" size={size} color={color} />
            ),
            tabBarItemStyle: user?.isAdmin ? {} : { display: 'none' },
          }}
        />
      </Tabs>
      <PlayerBar />
    </View>
  );
}
