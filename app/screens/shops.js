import React from "react";
import { Linking, View, ScrollView, Button } from "react-native";
import Geolocation from '@react-native-community/geolocation';

import {
  Icon,
  ThemeProvider,
  Header,
  ListItem,
  Text,
} from 'react-native-elements';

import distanceBtwPoints from 'distance-between-points';
const rootURL = 'https://decouverto.fr/api/shops/';

export default class ShopsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errLoading: false, shops: [] };
  }

  openMap(initialPoint) {
    let url = `http://maps.google.com/maps?daddr=${initialPoint.latitude},${initialPoint.longitude}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  }

  componentDidMount() {
    this._mounted = true;
    Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse'
    });
    fetch(rootURL)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this._mounted) {
          let shops = responseJson;
          Geolocation.getCurrentPosition(
            (location) => {
              shops.forEach(function (item) {
                item.distance = Math.floor(
                  distanceBtwPoints(location.coords, item)
                );
              });
              shops.sort(function (a, b) {
                return a.distance - b.distance;
              });
              this.setState({
                shops: shops,
              });
            },
            () => {
                console.error(shops);
              this.setState({
                shops: shops,
              });
            },
            { enableHighAccuracy: true }
          );
        }
      })
      .catch((e) => {
        this.setState({
          errLoading: true,
        });
      });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  render() {
    return (
      <ThemeProvider>
        <Header
          leftComponent={
            <Icon
              name="menu"
              type="material"
              color="#fff"
              onPress={() => this.props.navigation.openDrawer()}
            />
          }
          centerComponent={{ text: "Découverto", style: { color: "#fff" } }}
          containerStyle={{
            backgroundColor: "#dc3133",
            justifyContent: "space-around",
          }}
        />

        <View>
          <ScrollView>
            {this.state.shops.map((data, i) => (
              <ListItem key={i} bottomDivider>
                <ListItem.Content>
                  <ListItem.Title style={{ color: "#2c3e50" }}>
                    {data.title}
                  </ListItem.Title>
                  <ListItem.Subtitle style={{ color: "#34495e" }}>
                    {(data.distance / 1000).toFixed(1)}km
                  </ListItem.Subtitle>
                  <Text>{data.address}</Text>
                  <Button
                    title="S'y rendre"
                    onPress={() => this.openMap(data)}
                  />
                </ListItem.Content>
              </ListItem>
            ))}
            {(this.state.errLoading) ? (
             <ListItem key={'error'} bottomDivider>
                <ListItem.Content>
                  <ListItem.Title style={{ color: "#f39c12" }}>
                    Erreur
                  </ListItem.Title>
                  <Text>Impossible de télécharger la liste des points de vente, vous êtes certainement hors-ligne.</Text>
                </ListItem.Content>
              </ListItem>
            ) : null}
          </ScrollView>
        </View>
      </ThemeProvider>
    );
  }
}
