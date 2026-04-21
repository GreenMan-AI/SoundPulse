import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { AppProvider, useApp } from '../components/AppContext';
import LangScreen from '../components/LangScreen';
import AuthScreen from '../components/AuthScreen';
import BannerTicker from '../components/BannerTicker';

function RootContent() {
  const { langChosen, user } = useApp();
  if (!langChosen) return <LangScreen />;
  if (!user)       return <AuthScreen />;
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <Slot />
      <BannerTicker />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="light" backgroundColor="#0a0a0f" />
      <RootContent />
    </AppProvider>
  );
}
