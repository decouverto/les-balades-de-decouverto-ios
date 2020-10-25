import React from 'react';
import { Linking, Alert, View, Share, ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Icon, Divider, ThemeProvider, Header, ListItem, Text } from 'react-native-elements';

const rootURL = 'http://decouverto.fr/walks/';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let state = { errLoading: false, walks: [], downloadedWalks: [], wlkToDisplay: [], downloading: false, selectedSector: 'all', selectedTheme: 'all', selectedType: 'all', search: '', searching: false }
    this.state = state;
  }

  componentDidMount() {
        //AsyncStorage.multiSet([['walks', JSON.stringify([])], ['downloadedWalks', JSON.stringify([])]]);
        AsyncStorage.multiGet(['walks', 'downloadedWalks'], (err, values) => {
            if (values !== null && !err) {
                var obj = {};
                for (var i in values) {
                    if (values[i][1] != null) {
                        obj[values[i][0]] = JSON.parse(values[i][1]);
                    }
                }
                this.setState(obj, () => {
                    Linking.addEventListener('url', function (event) {
                        this.openDeepLink(event.url);
                    });
                    this.calculateWlkToDisplay()
                });
            }
            fetch(rootURL + 'index.json')
                .then((response) => response.json())
                .then((responseJson) => {
                    if (this._mounted) {
                        responseJson.sort(function (a, b) {
                            if (a.title < b.title) { return -1; }
                            if (a.title > b.title) { return 1; }
                            return 0;
                        });
                       this.setState({
                            errLoading: false,
                            walks: responseJson
                        }, () => {
                            if (this.state.wlkToDisplay.length == 0) {
                                if (Platform.OS === 'android') {
                                    Linking.getInitialURL().then(url => {
                                        this.openDeepLink(url);
                                    });
                                } else {
                                    Linking.addEventListener('url', function (event) {
                                        this.openDeepLink(event.url);
                                    });
                                }
                            }
                            this.calculateWlkToDisplay();
                        });
                    }
                    AsyncStorage.setItem('walks', JSON.stringify(responseJson));
                })
                .catch(() => {
                    this.setState({
                        errLoading: true
                    });
                });
        });
    }

  shareWalk(data) {
        Share.share(
            {
                message: `${data.title}\n${data.description} Elle fait ${(data.distance / 1000).toFixed(1)}km.\nhttps://decouverto.fr/rando/${data.id}`
            }
        );
    }

  calculateWlkToDisplay(id) {
    if (id) {
        var found = this.state.walks.find(function (element) {
            return element.id === id;
        });
        if (found) {
            return this.setState({ wlkToDisplay: [found], searching: true, search: found.title });
        }
    }
    var arr = [];
    this.state.walks.forEach((data) => {
        let err = false;
        if (this.state.selectedSector != 'all' && this.state.selectedSector != data.zone) {
            err = true;
        }
        if (this.state.selectedTheme != 'all' && this.state.selectedTheme != data.theme) {
            err = true;
        }
        if (this.state.selectedType != 'all' && this.state.selectedType != data.fromBook) {
            err = true;
        }
        if (this.state.search != '') {
            if (data.zone.search(new RegExp(this.state.search, 'i')) == -1 && data.theme.search(new RegExp(this.state.search, 'i')) == -1 && data.description.search(new RegExp(this.state.search, 'i')) == -1 && data.title.search(new RegExp(this.state.search, 'i')) == -1) {
                err = true;
            }
        }
        if (!err) {
            //data.downloaded = this.isDownloaded(data.id);
            arr.push(data);
        }
    })
    arr.sort(function (a, b) {
        if (a.downloaded == b.downloaded) return 0
        if (a.downloaded && !b.downloaded) return -1
        if (b.downloaded && !a.downloaded) return 1
        return 0
    });
    this.setState({ wlkToDisplay: arr })
}

    onSectorChange(sector) {
        this.setState({
            selectedSector: sector
        }, this.calculateWlkToDisplay);
    }

    onThemeChange(theme) {
        this.setState({
            selectedTheme: theme
        }, this.calculateWlkToDisplay);
    }

    onTypeChange(type) {
        this.setState({
            selectedType: type
        }, this.calculateWlkToDisplay);
    }

    onSearch(search) {
        this.setState({
            search: search
        }, this.calculateWlkToDisplay);
    }

  render() {

    return (
        <ThemeProvider>
            <Header
                leftComponent={<Icon name='menu' type='material' color='#fff' onPress={() => this.props.navigation.openDrawer()} />}
                centerComponent={{ text: 'Découverto', style: { color: '#fff' } }}
                rightComponent={<Icon name='search' type='search' color='#fff' onPress={() => this.setState({ searching: !this.state.searching, selectedTheme: 'all', selectedSector: 'all', selectedType: 'all', search: '' }, () => /*this.calculateWlkToDisplay()*/ false)} />}
                containerStyle={{
                    backgroundColor: '#dc3133',
                    justifyContent: 'space-around',
                }}
            />
        <Divider style={{ backgroundColor: '#dc3133' }} />
        <ScrollView>
        {
            this.state.wlkToDisplay.map((data, i) => (
            <ListItem key={i} bottomDivider>
                <ListItem.Content>
                <ListItem.Title style={{color: '#2c3e50'}}>{data.title}</ListItem.Title>
                <ListItem.Subtitle style={{color: '#34495e'}}>{(data.distance / 1000).toFixed(1)}km</ListItem.Subtitle>
                {(data.fromBook == 'true') ? (
                                                            <Text style={{color: '#7f8c8d'}}>Tracé uniquement</Text>
                                                        ) : (
                                                                <Text style={{color: '#7f8c8d'}}>Balade commentée</Text>
                                                            )}
                                                            <Text italic={data.fromBook}>{data.description}</Text>
                                                            <Button title="Télécharger" onPress={() => /*this.downloadWalk(data)*/false} />
                                                            
                </ListItem.Content>
            </ListItem>
            ))
        }
        </ScrollView>
    </ThemeProvider>
    );
  }
}