import HomeScreen from "./app/screens/home.js";
import ShopsScreen from "./app/screens/shops.js";
import SettingsScreen from "./app/screens/settings.js";
import AboutWalkScreen from "./app/screens/about-walk.js";
import { Linking, Share, Alert } from "react-native";
import { Icon } from "react-native-elements";

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";

import Geolocation from "@react-native-community/geolocation";

const Drawer = createDrawerNavigator();

const routes = [{
  way: 'Home', text: 'Accueil', icon: 'home', iconFont: 'font-awesome-5'
}, {
  way: 'Shops', text: 'Points de vente', icon: 'shopping-cart', iconFont: 'font-awesome-5'
}, {
  way: 'Settings', text: 'Paramètres', icon: 'settings', iconFont: 'material'
}];

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {routes.map((data, i) => (
        <DrawerItem
        label={data.text}
        key={i}
        onPress={() => props.navigation.navigate(data.way)}
        icon={({ focused, color, size }) => <Icon color={color} size={size} type={data.iconFont} name={data.icon} />} />
      ))}
      <DrawerItem
        label="Site internet"
        onPress={() => {
          Linking.openURL("https://www.decouverto.fr");
        }}
        icon={({ focused, color, size }) => <Icon color={color} size={size} type="font-awesome-5" name="globe-europe" />}
      />
      <DrawerItem
        label="Partager ma position"
        icon={({ focused, color, size }) => <Icon color={color} size={size} type="material" name="pin-drop" />}
        onPress={() => {
          Geolocation.getCurrentPosition((location) => {
              var date = new Date();
              date.setTime(location.timestamp);
              Share.share({
                message: `Je suis actuellement aux coordonnées GPS suivante: ${location.coords.latitude} ${location.coords.longitude} https://www.google.fr/maps/place/${location.coords.latitude}+${location.coords.longitude} (position mesurée à ${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()})`,
              });
            },() => {
              Alert.alert("Erreur", "Impossible de vous géolocaliser.", [
                { text: "Ok" },
              ]);
            },
            { enableHighAccuracy: true }
          );
        }}
      />
    </DrawerContentScrollView>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Shops" component={ShopsScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="AboutWalk" component={AboutWalkScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
