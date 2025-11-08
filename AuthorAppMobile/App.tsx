import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import LibraryScreen from './src/screens/LibraryScreen';

export type RootStackParamList = {
  Login: undefined;
  Library: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Library" component={LibraryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
