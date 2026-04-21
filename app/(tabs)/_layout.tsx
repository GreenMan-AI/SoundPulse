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
        <Tabs.Screen
          name="index"
          options={{
            title: t.music ?? 'Mūzika',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: t.search ?? 'Meklēt',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="playlist"
          options={{
            title: t.playlist ?? 'Playliste',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mood"
          options={{
            title: 'Mood',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="share"
          options={{
            title: 'Dalīties',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="share-social" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t.profile ?? 'Profils',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
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
