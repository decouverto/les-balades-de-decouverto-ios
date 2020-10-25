import React from "react";
import { Linking, Alert, View, ScrollView, Button } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {
  Icon,
  ThemeProvider,
  Header,
  ListItem,
  Text,
  SearchBar,
} from "react-native-elements";

const rootURL = "http://decouverto.fr/walks/";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let state = {
      errLoading: false,
      walks: [],
      downloadedWalks: [],
      wlkToDisplay: [],
      downloading: false,
      search: "",
      searching: false,
    };
    this.state = state;
  }

  componentDidMount() {
    this._mounted = true;

    var openDeepLink = (url) => {
      if (url) {
        const route = url.replace(/.*?:\/\//g, "");
        const id = route.match(/\/([^\/]+)\/?$/)[1];
        const routeName = route.split("/")[1];
        if (routeName === "rando") {
          this.calculateWlkToDisplay(id);
        }
      }
    };

    //AsyncStorage.multiSet([['walks', JSON.stringify([])], ['downloadedWalks', JSON.stringify([])]]);
    AsyncStorage.multiGet(["walks", "downloadedWalks"], (err, values) => {
      if (values !== null && !err) {
        var obj = {};
        for (var i in values) {
          if (values[i][1] != null) {
            obj[values[i][0]] = JSON.parse(values[i][1]);
          }
        }
        this.setState(obj, () => {
          Linking.addEventListener("url", (event) => {
            openDeepLink(event.url);
          });
          this.calculateWlkToDisplay();
        });
      }
      fetch(rootURL + "index.json")
        .then((response) => response.json())
        .then((responseJson) => {
          if (this._mounted) {
            responseJson.sort(function (a, b) {
              if (a.title < b.title) {
                return -1;
              }
              if (a.title > b.title) {
                return 1;
              }
              return 0;
            });
            this.setState(
              {
                errLoading: false,
                walks: responseJson,
              },
              () => {
                if (this.state.wlkToDisplay.length == 0) {
                  Linking.addEventListener("url", (event) => {
                    openDeepLink(event.url);
                  });
                }
                this.calculateWlkToDisplay();
              }
            );
          }
          AsyncStorage.setItem("walks", JSON.stringify(responseJson));
        })
        .catch(() => {
          this.setState({
            errLoading: true,
          });
        });
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  calculateWlkToDisplay(id) {
    if (id) {
      var found = this.state.walks.find(function (element) {
        return element.id === id;
      });
      if (found) {
        return this.setState({ wlkToDisplay: [found], search: found.title });
      }
    }
    var arr = [];
    this.state.walks.forEach((data) => {
      let err = false;
      if (this.state.search != "") {
        if (
          data.zone.search(new RegExp(this.state.search, "i")) == -1 &&
          data.theme.search(new RegExp(this.state.search, "i")) == -1 &&
          data.description.search(new RegExp(this.state.search, "i")) == -1 &&
          data.title.search(new RegExp(this.state.search, "i")) == -1
        ) {
          err = true;
        }
      }
      if (!err) {
        //data.downloaded = this.isDownloaded(data.id);
        arr.push(data);
      }
    });
    arr.sort(function (a, b) {
      if (a.downloaded == b.downloaded) return 0;
      if (a.downloaded && !b.downloaded) return -1;
      if (b.downloaded && !a.downloaded) return 1;
      return 0;
    });
    this.setState({ wlkToDisplay: arr });
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
          rightComponent={
            <Icon
              name="search"
              type="search"
              color="#fff"
              onPress={() => false}
            />
          }
          containerStyle={{
            backgroundColor: "#dc3133",
            justifyContent: "space-around",
          }}
        />

        <View>
          <SearchBar
            placeholder="Rechercher une balade"
            onChangeText={(search) =>
              this.setState({ search: search }, () =>
                this.calculateWlkToDisplay()
              )
            }
            value={this.state.search}
          />
          <ScrollView>
            {this.state.wlkToDisplay.map((data, i) => (
              <ListItem key={i} bottomDivider>
                <ListItem.Content>
                  <ListItem.Title style={{ color: "#2c3e50" }}>
                    {data.title}
                  </ListItem.Title>
                  <ListItem.Subtitle style={{ color: "#34495e" }}>
                    {(data.distance / 1000).toFixed(1)}km
                  </ListItem.Subtitle>
                  {data.fromBook == "true" ? (
                    <Text style={{ color: "#7f8c8d" }}>Tracé uniquement</Text>
                  ) : (
                    <Text style={{ color: "#7f8c8d" }}>Balade commentée</Text>
                  )}
                  <Text italic={data.fromBook}>{data.description}</Text>
                  <Button
                    title="Télécharger"
                    onPress={() => /*this.downloadWalk(data)*/ false}
                  />
                </ListItem.Content>
              </ListItem>
            ))}
          </ScrollView>
        </View>
      </ThemeProvider>
    );
  }
}
