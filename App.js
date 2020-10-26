import HomeScreen from "./app/screens/home.js";
import ShopsScreen from "./app/screens/shops.js";
import { Linking, Share, Alert } from "react-native";

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

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Site internet"
        onPress={() => {
          Linking.openURL("https://www.decouverto.fr");
        }}
      />
      <DrawerItem
        label="Partager ma position GPS"
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
        initialRouteName="Accueil"
        drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="Accueil" component={HomeScreen} />
        <Drawer.Screen
          name="Liste des points de vente"
          component={ShopsScreen}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
