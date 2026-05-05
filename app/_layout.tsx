import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../components/AppContext';
import LangScreen from '../components/LangScreen';
import AuthScreen from '../components/AuthScreen';
import { View } from 'react-native';

function RootContent() {
  const { langChosen, user, colors } = useApp();
  if (!langChosen) return <LangScreen />;
  if (!user) return <AuthScreen />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}