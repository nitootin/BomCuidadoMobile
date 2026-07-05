import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AcessoScreen from './src/screens/AcessoScreen';
import HomeScreen from './src/screens/HomeScreen';
import { colors } from './src/constants/colors';
import { existeSessaoValida } from './src/services/sessionService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [rotaInicial, setRotaInicial] = useState(null);

  useEffect(() => {
    let montado = true;

    async function verificarSessao() {
      const autenticado = await existeSessaoValida();
      if (montado) setRotaInicial(autenticado ? 'Home' : 'Acesso');
    }

    verificarSessao();
    return () => {
      montado = false;
    };
  }, []);

  if (!rotaInicial) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.verde} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={rotaInicial} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Acesso" component={AcessoScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cinzaBg,
  },
});
