import React from 'react';
import { Linking, Alert, ScrollView, Button, Modal, View, ActivityIndicator } from 'react-native';


import AsyncStorage from '@react-native-community/async-storage';
import {
  Icon,
  ThemeProvider,
  Header,
  ListItem,
  Text,
  Card,
  SearchBar,
} from 'react-native-elements';

import fs from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

const rootURL = 'http://decouverto.fr/walks/';
const rootDirectory = fs.LibraryDirectoryPath + '/decouverto/';
//console.warn(rootDirectory)

import tileList from 'osm-tile-list-json';
import { each } from 'async';

import FocusEffect from '../lib/focus.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let state = {
      errLoading: false,
      loading: true,
      walks: [],
      downloadedWalks: [],
      wlkToDisplay: [],
      downloading: false,
      search: '',
      downloadingProgress: {
        message: '',
        title: ''
      }
    };
    this.state = state;
    this.updateState = this.updateState.bind(this);
  }

  updateState() {
    AsyncStorage.multiGet(['walks', 'downloadedWalks'], (err, values) => {
      if (values !== null && !err) {
        var obj = {};
        for (var i in values) {
          if (values[i][1] != null) {
            obj[values[i][0]] = JSON.parse(values[i][1]);
          }
        }

        var toUpdate = false;

        if (obj.hasOwnProperty('walks')) {
          if (obj.walks.length != this.state.walks.length) {
            toUpdate = true;
          }
        } 
        if (obj.hasOwnProperty('downloadedWalks')) {
          if (obj.downloadedWalks.length != this.state.downloadedWalks.length) {
            toUpdate = true;
          }
        }
        if (toUpdate) {
          this.setState(obj, () => {
            this.calculateWlkToDisplay();
          });
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    let nextProps = this.props.route;
    if (nextProps.params != undefined && nextProps.params.from != undefined) {
      if (nextProps.params.from == 'AboutWalk') {
        this.updateState();
      }
    }
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
                loading: false,
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
            loading: false
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
        data.downloaded = this.isDownloaded(data.id);
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
      Alert.alert(
        'Erreur',
        message,
        [
          {
            text: 'Ok',
            onPress: () => {
              this.hideDownloadingMessage({});
            }
          }
        ],
        { cancelable: false }
      );

    }
    this.setState({
      downloading: true
    }, () => {
      this.createDirectory(data.id, (err) => {
        fs.downloadFile({
          fromUrl: rootURL + data.id + '.zip',
          toFile: rootDirectory + data.id + '/tmp.zip',
          begin: () => {
            this.showDowloadingMessage({
              title: 'Téléchargement',
              message: 'Veuillez patientez...'
            });
          },
          progress: (result) => {
            this.showDowloadingMessage({
              title: 'Téléchargement',
              message: 'Veuillez patientez... ' + Math.round(result.bytesWritten / result.contentLength * 100) + '%'
            });
          }
        }).promise.then((result) => {
          let size = result.bytesWritten;
          unzip(rootDirectory + data.id + '/tmp.zip', rootDirectory + data.id)
            .then(() => {
              fs.unlink(rootDirectory + data.id + '/tmp.zip')
                .then(() => {
                  let downloadedWalks = this.state.downloadedWalks;
                  downloadedWalks.push(data.id);
                  AsyncStorage.setItem('downloadedWalks', JSON.stringify(downloadedWalks));
                  this.showDowloadingMessage({
                    title: 'Téléchargement des cartes',
                    message: 'Veuillez patientez... '
                  });
                  this.downloadMap(data.distance, data.id, (progress) => {
                    this.showDowloadingMessage({
                      title: 'Téléchargement des cartes',
                      message: 'Veuillez patientez... ' + Math.round(progress * 100) + '%'
                    });
                  }, (err, mapSize) => {
                    this.showDowloadingMessage({ title: 'Téléchargement terminé', message: '' }, () => {
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
                            {
                              text: 'Ok',
                              onPress: () => {
                                this.hideDownloadingMessage({ downloadedWalks, search: '' }, () => {
                                  this.calculateWlkToDisplay();
                                  this.openWalk(data);
                                });
                              }
                            }
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
                            {
                              text: 'Ok',
                              onPress: () => {
                                this.hideDownloadingMessage({ downloadedWalks, search: '' }, () => {
                                  this.calculateWlkToDisplay()
                                  this.openWalk(data);
                                });
                              }
                            }
                          ],
                          { cancelable: false }
                        );
                      };
                    });
                  });
                })
                .catch(() => { localError('Erreur lors de la suppression du fichier temporaire') })
            }).catch(() => { localError('Échec de la décompression') })
        }).catch(() => { localError('Échec du téléchargement') })
      });
    });
  }

  openWalk(data) {
    fs.readFile(rootDirectory + data.id + '/index.json').then((response) => {
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
    });
  }

  isDownloaded(id) {
    for (let k in this.state.downloadedWalks) {
      if (this.state.downloadedWalks[k] == id) {
        return true;
      }
    }
    return false;
  }

  downloadMap(km, id, progress, cb) {
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
                  c += 1;
                  progress(c / n)
                  callback();
                }).catch(callback)
              }
            });
          }
        });
      }, function () {
        cb(null, size)
      });


    }).catch(function (err) {
      console.warn(err)
      cb(true)
    })
  }

  showDowloadingMessage(val, cb) {
    this.setState({
      downloadingProgress: val
    }, () => {
      if (typeof cb === 'function') {
        cb()
      }
    });
  }

  hideDownloadingMessage(obj, cb) {
    this.setState({
      downloading: false,
      downloadingProgress: {
        title: '',
        message: ''
      },
      ...obj
    }, () => {
      if (typeof cb === 'function') {
        cb()
      }
    });
  }

  error(msg) {
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
        <FocusEffect
          onFocus={this.updateState}
          onFocusRemoved={() => false}
        />
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
              name="settings"
              type="material"
              color="#fff"
              onPress={() => this.props.navigation.navigate('Settings')}
            />
          }
          containerStyle={{
            backgroundColor: "#dc3133",
            justifyContent: "space-around",
          }}
        />

        <View>
          <CustomProgressBar visible={this.state.downloading} message={this.state.downloadingProgress.message} title={this.state.downloadingProgress.title} />
          <SearchBar
            placeholder="Rechercher une balade"
            onChangeText={(search) =>
              this.setState({ search: search }, () =>
                this.calculateWlkToDisplay()
              )
            }
            value={this.state.search}
          />
          {(this.state.loading) ? (
            <Card>
              <Text style={{ marginBottom: 20 }}>Chargement...</Text>
              <ActivityIndicator size="large" color="#dc3133" />
            </Card>
          ) : (this.state.errLoading) ? (
            <Card>
              <Text>Impossible de télécharger la liste des dernières balades, vous êtes certainement hors-ligne.</Text>
            </Card>
          ) : (
                <ScrollView>
                  {this.state.wlkToDisplay.map((data, i) => (
                    <ListItem key={i} bottomDivider>
                      <ListItem.Content>
                        <ListItem.Title style={{ color: "#2c3e50" }}>
                          {data.title} {(data.downloaded) ? (
                            <Icon
                              name="walking"
                              type="font-awesome-5"
                              color="#16a085"
                            />
                          ) : (
                              null
                            )}
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
                        {(data.downloaded) ? (
                          <Button
                            title="Ouvrir"
                            color="#16a085"
                            onPress={() => this.openWalk(data)}
                          />
                        ) : (
                            <Button
                              title="Télécharger"
                              onPress={() => this.downloadWalk(data)}
                            />
                          )}
                      </ListItem.Content>
                    </ListItem>
                  ))}
                </ScrollView>
              )}

        </View>
      </ThemeProvider>
    );
  }
}


const CustomProgressBar = ({ visible, title, message }) => (
  <Modal visible={visible}>
    <View style={{ flex: 1, backgroundColor: "#00000020", justifyContent: "center", alignItems: "center" }}>
      <View style={{ backgroundColor: "white", padding: 10, borderRadius: 5, width: "80%", alignItems: "center" }}>
        <Text style={{ fontSize: 20 }}>{title}</Text>
        <Text>{message}</Text>
        <ActivityIndicator size="large" color="#dc3133" />
      </View>
    </View>
  </Modal>
);
