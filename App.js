import HomeScreen from './app/screens/home.js';
import ShopsScreen from './app/screens/shops.js';
import { Linking } from 'react-native';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Site internet" onPress={() => { Linking.openURL('https://www.decouverto.fr');}} />
    </DrawerContentScrollView>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Accueil" drawerContent={props => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="Accueil" component={HomeScreen} />
        <Drawer.Screen name="Liste des points de vente" component={ShopsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
