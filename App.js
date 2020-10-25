
import HomeScreen from './app/screens/home.js';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Accueil" component={HomeScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}