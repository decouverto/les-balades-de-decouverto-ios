import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Linking, Alert, ScrollView, View, Button } from 'react-native';
import { Card, Icon, ThemeProvider, Header, ListItem, Text } from 'react-native-elements';


import fs from 'react-native-fs';

import { parallel, every } from 'async';

const rootDirectory = fs.LibraryDirectoryPath + '/decouverto/';

import { useFocusEffect } from '@react-navigation/native';
function FocusEffect({ onFocus, onFocusRemoved }) {
    useFocusEffect(
      React.useCallback(() => {
        onFocus();
        return () => onFocusRemoved();
      }, [onFocus, onFocusRemoved]),
    );
    return null;
}

export default class App extends React.Component {
    

    constructor(props) {
        super(props);
        this.state = { walks: [], downloadedWalks: [], wlkToDisplay: [], loading: true };
        this.updateState = this.updateState.bind(this);
    }

    updateState () {
        AsyncStorage.multiGet(['walks', 'downloadedWalks'], (err, values) => {
            if (values !== null && !err) {
                var obj = {};
                for (var i in values) {
                    if (values[i][1] != null) {
                        obj[values[i][0]] = JSON.parse(values[i][1]);
                    }
                }
                if (obj.downloadedWalks.length != this.state.downloadedWalks.length) {
                    this.setState(obj, () => {
                        this.calculateWlkToDisplay()
                    });
                }
                
            }
        });
    } 

    componentDidMount() {
        this.updateState();
    }

    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
      }

    isDownloaded(id) {
        for (let k in this.state.downloadedWalks) {
            if (this.state.downloadedWalks[k] == id) {
                return true;
            }
        }
        return false;
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
        })
    }

    removeWalk(data) {
        Alert.alert(
            'Attention',
            'Êtes-vous sûr de vouloir supprimer la promenade ' + data.title + ' de votre téléphone ?',
            [
                { text: 'Annuler' },
                {
                    text: 'OK', onPress: () => {
                        let walks = this.state.walks;
                        for (let i = walks.length; i--;) {
                            if (walks[i].id === data.id) {
                                walks.splice(i, 1);
                                break;
                            }
                        }
                        let downloadedWalks = this.state.downloadedWalks;
                        let k = downloadedWalks.indexOf(data.id);
                        if (k > -1) {
                            downloadedWalks.splice(k, 1);
                        }
                        this.setState({ walks: walks, downloadedWalks: downloadedWalks }, () => {
                            this.calculateWlkToDisplay();
                            AsyncStorage.setItem('downloadedWalks', JSON.stringify(this.state.downloadedWalks));
                        });
                        fs.unlink(rootDirectory + data.id)
                            .then(() => {
                                Alert.alert(
                                    'Succès',
                                    'Les fichiers ont bien été supprimées.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            })
                            .catch(() => {
                                Alert.alert(
                                    'Erreur',
                                    'Fichiers déja supprimés.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    removeAllWalks(data) {
        Alert.alert(
            'Attention',
            'Êtes-vous sûr de vouloir supprimer toutes les balades de votre téléphone ?',
            [
                { text: 'Annuler' },
                {
                    text: 'OK', onPress: () => {
                        let notDeleted = [];
                        every(this.state.downloadedWalks, (file, cb) => {
                            fs.unlink(rootDirectory + file).then(() => {
                                cb(null, true);
                            }).catch(err => {
                                notDeleted.push(file)
                                cb(err);
                            });
                        }, err => {
                            if (err) {
                                this.setState({ downloadedWalks: notDeleted }, () => {
                                    this.calculateWlkToDisplay();
                                    AsyncStorage.setItem('downloadedWalks', JSON.parse(notDeleted));
                                });
                                Alert.alert(
                                    'Erreur',
                                    'Certains fichiers n\'ont pas été supprimées.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            } else {
                                this.setState({ walks: [], downloadedWalks: [], wlkToDisplay: [] }, () => {
                                    AsyncStorage.setItem('downloadedWalks', '[]');
                                });
                                Alert.alert(
                                    'Succès',
                                    'Les fichiers ont bien été supprimées.',
                                    [
                                        { text: 'Ok' },
                                    ],
                                    { cancelable: false }
                                );
                            }
                        });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    readSize(f, callback) {
        fs.readDir(f).then(r => {
            let functions = []
            r.forEach(file=> {
                functions.push((cb) => {
                        if (file.isFile()) {
                            cb(null, file.size)
                        } else {
                            this.readSize(file.path, cb)
                        }
                })
            })
            parallel(functions, (err, result) => {
                if (err) callback(err)
                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                callback(null, result.reduce(reducer, 0));
            });
        }).catch((err) => {
            callback(err);
        });

    }

    calculateWlkToDisplay() {
        var func = [];
        this.state.walks.forEach((d) => {
            if (this.isDownloaded(d.id)) {
                func.push(callback => {
                    this.readSize(rootDirectory + d.id, (err, size) => {
                        if (err) {
                            size = 0
                        }
                        if (Math.floor(size * 1e-6) == 0) {
                            size = Math.floor(size * 1e-3) + ' ko';
                        } else {
                            size = Math.floor(size * 1e-6) + ' Mo';
                        }
                        d.size = size
                        callback(null, d);
                    });
                });
            }
        });
        parallel(func, (err, arr) => {
            this.setState({ wlkToDisplay: arr, loading: false });
        });
    }

    componentWillUnmount() {
    }


    render() {
        return (
            <ThemeProvider>
                <FocusEffect
                        onFocus={this.updateState}
                        onFocusRemoved={()=>false}
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
                    containerStyle={{
                        backgroundColor: "#dc3133",
                        justifyContent: "space-around",
                    }}
                />

                <ScrollView>
                    <Text h2 style={{marginLeft: 10}}>Balades téléchargées</Text>
                    {(this.state.loading) ? (
                        <Text style={{ marginTop: 20 }}>Chargement...</Text>
                    ) : (this.state.wlkToDisplay.length == 0) ? (
                            <Card>
                                <Text style={{ marginBottom: 20 }}>Aucune balade téléchargée.</Text>
                                <Button
                                    onPress={() => this.props.navigation.navigate('Home')}
                                    icon={<Icon name='download' type='font-awesome-5' color='#fff' />}
                                    buttonStyle={{marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                                    title=" Télécharger des balades" />
                            </Card>
                            ) : (
                                <View>
                                {this.state.wlkToDisplay.map((data, i) => (
                                    <ListItem key={i} bottomDivider>
                                      <ListItem.Content>
                                        <ListItem.Title onPress={() => this.removeWalk(data)} style={{ color: "#2c3e50" }}>
                                          {data.title} 
                                        </ListItem.Title>
                                            <Button
                                              title="Supprimer"
                                              onPress={() => this.removeWalk(data)}
                                            />
                                      </ListItem.Content>
                                    </ListItem>
                                  ))}
                                    <ListItem>
                                            <Button onPress={() => this.removeAllWalks()}
                                                title=" Supprimer toutes les balades" />
                                    </ListItem>
                                  </View>
                            )}
                </ScrollView>
            </ThemeProvider>
        );
    }
}

