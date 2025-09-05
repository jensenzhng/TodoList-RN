import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth } from './src/firebase';
import LoginScreen from './src/screens/LoginScreen';
import TodoScreen from './src/screens/TodoScreen';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Todos: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const sub = auth().onAuthStateChanged(user => {
      setUid(user ? user.uid : null);
      if (initializing) setInitializing(false);
    });
    return sub;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#0b1220'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {uid ? (
            <Stack.Screen name="Todos" component={TodoScreen} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
