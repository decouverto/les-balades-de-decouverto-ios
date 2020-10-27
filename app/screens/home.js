import React from 'react';
import { Linking, Alert, View, ScrollView, Button, LogBox } from 'react-native';

LogBox.ignoreLogs([
  'RCTBridge'
]);

import AsyncStorage from '@react-native-community/async-storage';
import {
  Icon,
  ThemeProvider,
  Header,
  ListItem,
  Text,
  SearchBar,
} from 'react-native-elements';

import fs from 'react-native-fs';
import DialogProgress from 'react-native-dialog-progress';
import { unzip } from 'react-native-zip-archive';

const rootURL = 'http://decouverto.fr/walks/';
const rootDirectory = fs.LibraryDirectoryPath + '/decouverto/';

import tileList from 'osm-tile-list-json';
import { each } from 'async';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let state = {
      errLoading: false,
      walks: [],
      downloadedWalks: [],
      wlkToDisplay: [],
      downloading: false,
      search: ''
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

  createDirectory(id, cb) {
    fs.exists(rootDirectory + id).then((exists) => {
      if (exists) return cb();
      fs.mkdir(rootDirectory + id).then(cb).catch(cb);
    }).catch(cb)
  }

  downloadWalk(data) {
    if (this.state.downloading) return true;
    let localError = (message) => {
      this.setState({
        downloading: false
      }, (message) => {
        this.error(message);
      });
    }
    this.setState({
      downloading: true
    }, () => {
      this.createDirectory(data.id, (err) => {
        fs.downloadFile({
          fromUrl: rootURL + data.id + '.zip',
          toFile: rootDirectory + data.id + '/tmp.zip',
          begin: () => {
            DialogProgress.hide();
            DialogProgress.show({
              title: 'Téléchargement',
              message: 'Veuillez patientez...',
              isCancelable: false
            });
          },
          progress: (result) => {
            DialogProgress.hide();
            DialogProgress.show({
              title: 'Téléchargement',
              message: 'Veuillez patientez... ' + Math.round(result.bytesWritten / result.contentLength * 100) + '%',
              isCancelable: false
            });
          }
        }).promise.then((result) => {
          DialogProgress.hide();
          let size = result.bytesWritten;
          unzip(rootDirectory + data.id + '/tmp.zip', rootDirectory + data.id)
            .then(() => {
              fs.unlink(rootDirectory + data.id + '/tmp.zip')
                .then(() => {
                  let list = this.state.downloadedWalks;
                  list.push(data.id);
                  AsyncStorage.setItem('downloadedWalks', JSON.stringify(list));
                  DialogProgress.hide();
                  DialogProgress.show({
                    title: 'Téléchargement des cartes',
                    message: 'Veuillez patientez... ',
                    isCancelable: false
                  });
                  this.downloadMap(data.distance, data.id, (progress) => {
                    DialogProgress.hide();
                    DialogProgress.show({
                      title: 'Téléchargement des cartes',
                      message: 'Veuillez patientez... ' + Math.round(progress * 100) + '%',
                      isCancelable: false
                    });
                  }, (err, mapSize) => {
                    DialogProgress.hide();
                    if (err) {
                      if (Math.floor(size * 1e-6) == 0) {
                        size = Math.floor(size * 1e-3) + ' ko';
                      } else {
                        size = Math.floor(size * 1e-6) + ' Mo';
                      }
                      Alert.alert(
                        'Succès',
                        'Téléchargement réussit:\n' + size + ' téléchargés',
                        [
                          { text: 'Ok' },
                        ],
                        { cancelable: false }
                      );
                    } else {
                      size += mapSize;
                      if (Math.floor(size * 1e-6) == 0) {
                        size = Math.floor(size * 1e-3) + ' ko';
                      } else {
                        size = Math.floor(size * 1e-6) + ' Mo';
                      }
                      Alert.alert(
                        'Succès',
                        'Téléchargement réussit: \n' + size + ' téléchargés avec les cartes',
                        [
                          { text: 'Ok' },
                        ],
                        { cancelable: false }
                      );
                    };
                    this.setState({
                      downloading: false
                    }, () => {
                      this.openWalk(data);
                    });
                  })
                })
                .catch(() => { localError('Erreur lors de la suppression du fichier temporaire') })
            }).catch(() => { localError('Échec de la décompression') })
        }).catch(() => { localError('Échec du téléchargement') })
      });
    });
  }

  openWalk(data) {
      /*fs.readFile(rootDirectory + data.id + '/index.json').then((response) => {
          this.props.navigation.navigate('AboutWalk', { ...data, ...JSON.parse(response) });
      }).catch(() => {
          Alert.alert(
              'Erreur',
              'Impossible de lire le parcours',
              [
                  { text: 'Ok' },
              ],
              { cancelable: false }
          );
      })*/
      return false;
  }

  downloadMap (km, id, progress, cb) {
      fs.readFile(rootDirectory + id + '/index.json').then((response) => {
          data = JSON.parse(response);

          let maxZoomLevel = 16;
          if (km < 5000) {
              maxZoomLevel = 18;
          }

          tiles = tileList(data.borders, 12, maxZoomLevel, false, 0.01);
          n = tiles.length;
          c = 0;
          size = 0;

          each(tiles, (tile, callback) => {
              this.createDirectory(id + '/' + tile.z, (err) => {
                  if (err) {
                      console.warn(err)
                      callback(err)
                  } else {
                      this.createDirectory(id + '/' + tile.z + '/' + tile.x, (err) => {
                          if (err) {
                              console.warn(err)
                              callback(err)
                          } else {
                              fs.downloadFile({
                                  fromUrl: 'https://a.tile.openstreetmap.org/' + tile.z + '/' + tile.x + '/' + tile.y + '.png', // to do add random for server URL
                                  toFile: rootDirectory + '/' + id + '/' + tile.z + '/' + tile.x + '/' + tile.y + '.png'
                              }).promise.then((result) => {
                                  size += result.bytesWritten;
                                  c+=1;
                                  progress(c/n)
                                  callback();
                              }).catch(callback)
                          }
                      });
                  }
              });
          }, function() {
              cb(null, size)
          });
      
          
      }).catch(function(err) {
          console.warn(err)
          cb(true)
      })
  }

  error(msg) {
      DialogProgress.hide();
      Alert.alert(
          'Erreur',
          msg,
          [
              { text: 'Ok' },
          ],
          { cancelable: false }
      );
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
                    onPress={() => this.downloadWalk(data)}
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
