import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, Icon, ThemeProvider, Header, Text } from 'react-native-elements';

import fs from 'react-native-fs';
const rootDirectory = fs.LibraryDirectoryPath + '/decouverto/';

import MapView, { Polyline, Marker, PROVIDER_APPLE, UrlTile } from 'react-native-maps';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.route.params;
        this.centerMap = this.centerMap.bind(this);
        this.mapRef = null;
    }

    componentDidMount() {
        this.centerMap();
    }

    componentDidUpdate(prevProps) {
        if (this.props.route.params.id != prevProps.route.params.id) {
            this.setState(this.props.route.params, this.centerMap);
        } 
    }

    centerMap() {
        this.mapRef.fitToCoordinates(this.state.borders, {
            edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
            animated: true,
        });
    }

    render() {
        let maxZoomLevel = 16;
        if (this.state.distance < 5000) {
            maxZoomLevel = 18;
        }
        return (
            <ThemeProvider>
                <Header
                    leftComponent={
                        <Icon
                            name="arrow-left"
                            type="font-awesome-5"
                            color="#fff"
                            onPress={() => this.props.navigation.goBack()}
                        />
                    }
                    centerComponent={{ text: "Découverto", style: { color: "#fff" } }}
                    containerStyle={{
                        backgroundColor: "#dc3133",
                        justifyContent: "space-around",
                    }}
                    rightComponent={
                        <Icon
                          name="my-location"
                          type="material"
                          color="#fff"
                          onPress={() => this.centerMap()}
                        />
                      }
                />

                <View style={styles.main_container}>
                        <MapView
                        initialRegion={{
                            latitude: this.state.points[0].coords.latitude,
                            longitude: this.state.points[0].coords.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                        style={styles.map}
                        showsCompass={true}
                        minZoomLevel={12}
                        maxZoomLevel={maxZoomLevel}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        mapType={'standard'}
                        loadingEnabled={true}
                        ref={(ref) => { this.mapRef = ref }}
                        provider={PROVIDER_APPLE}
                        >
                        
                        <View>
                        {this.state.points.map(marker => (
                            <Marker
                                onCalloutPress={() => this.props.navigation.navigate('AboutMarker', { ...marker, walk: this.state })}
                                coordinate={marker.coords}
                                title={marker.title}
                                ref={marker.title}
                                key={marker.title}
                            />
                            
                        ))}
                        <UrlTile
                            urlTemplate ={'file://'+ rootDirectory + this.state.id + '/{z}/{x}/{y}.png'}
                            tileSize={256}
                            zIndex={-3}
                            maximumZ={maxZoomLevel}
                        />
                        <Polyline
                            coordinates={this.state.itinerary}
                            strokeColor='#000'
                            strokeWidth={3}
                            zIndex={-2}
                        />
                        </View>
                    </MapView>
                </View>
                <Text style={styles.over}>{this.state.title}</Text>
            </ThemeProvider>
        );
    }
}


const styles = StyleSheet.create({
    main_container: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 50,
        height: '100%',
        width: '100%',
        alignItems: 'stretch',
    },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1
    },
    over: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        marginRight: 0,
        marginLeft: 0,
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1
    }
});