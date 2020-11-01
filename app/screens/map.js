import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Icon, ThemeProvider, Header, Button } from 'react-native-elements';

import { observer } from "mobx-react";

import fs from 'react-native-fs';
const rootDirectory = fs.LibraryDirectoryPath + '/decouverto/';

import MapView, { Polyline, Marker, PROVIDER_APPLE, UrlTile } from 'react-native-maps';

import TrackPlayer from 'react-native-track-player';
import PlayerStore from '../stores/player';

class MapScreen extends React.Component {
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
                <View style={styles.button_audio_container}>
                {(PlayerStore.playbackState == TrackPlayer.STATE_PLAYING || PlayerStore.playbackState === TrackPlayer.STATE_BUFFERING) ? (
                        <Button
                        onPress={() => TrackPlayer.pause()}
                        icon={<Icon name='pause' type='material' color='#fff' />}
                        buttonStyle={styles.button_audio}
                        title="" />
                ) : null}
                {(PlayerStore.playbackState == TrackPlayer.STATE_PAUSED) ? (
                        <Button
                        onPress={() => TrackPlayer.play()}
                        buttonStyle={styles.button_audio}
                        icon={<Icon name='play-arrow' type='material' color='#fff' />}
                        title="" /> 
                ) : null}
                </View>
            </ThemeProvider>
        );
    }
}

export default observer(MapScreen);

const styles = StyleSheet.create({
    main_container: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        flex: 1,
        zIndex: -1
    },
    button_audio_container: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        marginRight: 0,
        marginLeft: 0,
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1
    },
    button_audio: {
        backgroundColor: '#dc3133',
        width: 70,
        height: 50
    }
});