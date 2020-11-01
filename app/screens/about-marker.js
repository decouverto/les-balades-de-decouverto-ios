import React from 'react';
import { Linking, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, Icon, ThemeProvider, Header, Text } from 'react-native-elements';

import { observer } from 'mobx-react';
import fs from 'react-native-fs';
const rootDirectory = fs.LibraryDirectoryPath + '/decouverto/';
import ResponsiveImage from 'react-native-responsive-image';

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

import TrackPlayer from 'react-native-track-player';
import PlayerStore from '../stores/player';



class AboutMarker extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.route.params;
        this.togglePlayback = this.togglePlayback.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.route.params.sound != prevProps.route.params.sound) {
            TrackPlayer.getCurrentTrack().then((current) => {
                this.setState({ currentPlaying: (current == this.props.route.params.sound), ...this.props.route.params });
            }).catch(() => {
                this.setState({ currentPlaying: true, ...this.props.route.params });
            })
        }
    }

    componentDidMount() {
        TrackPlayer.getCurrentTrack().then((current) => {
            this.setState({ currentPlaying: (current == this.state.sound) });
        }).catch(() => {
            this.setState({ currentPlaying: true });
        })
    }

    togglePlayback() {
        let s = {
            id: this.state.sound,
            url: 'file://' + rootDirectory + this.state.walk.id + '/sounds/' + this.state.sound,
            title: this.state.title,
            album: this.state.walk.title,
            artist: 'Découverto'
        }
        TrackPlayer.getPosition().then((position) => {
            if (position == 0) {
                TrackPlayer.add([s])
                this.setState({ currentPlaying: true }, TrackPlayer.play);
            } else {
                TrackPlayer.getCurrentTrack().then((current) => {
                    if ((PlayerStore.playbackState === TrackPlayer.STATE_PAUSED || PlayerStore.playbackState === TrackPlayer.STATE_STOPPED) && current == this.state.sound) {
                        TrackPlayer.getDuration().then((duration) => {
                            if (Number(position).toFixed(1) == Number(duration).toFixed(1)) {
                                this.changingTrack = true;
                                TrackPlayer.reset();
                                TrackPlayer.add([s])
                                this.setState({ currentPlaying: true }, TrackPlayer.play);
                                this.changingTrack = false;

                            } else {
                                this.setState({ currentPlaying: true }, TrackPlayer.play);
                            }
                        })
                    } else if (current != this.state.sound) {
                        this.changingTrack = true;
                        TrackPlayer.reset();
                        TrackPlayer.add([s])
                        this.setState({ currentPlaying: true }, TrackPlayer.play);
                        this.changingTrack = false;
                    } else {
                        TrackPlayer.pause();
                    }
                });
            }
        });
    }



    render() {
        const listImages = (this.state.images || []).map(image => {
            let { width } = Dimensions.get('window');
            width = width * 0.8;
            let height = (width * image.height) / image.width;
            return (<Card key={makeid()}>
                <ResponsiveImage source={{ isStatic: true, uri: 'file://' + rootDirectory + this.state.walk.id + '/images/' + image.path }} initHeight={height} initWidth={width} />
            </Card>)
        });
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
                />

                <ScrollView>
                    <Card>
                        <Card.Title>Explication audio "{this.state.title}"</Card.Title>
                        <Card.Divider />
                        {((PlayerStore.playbackState === TrackPlayer.STATE_PLAYING || PlayerStore.playbackState === TrackPlayer.STATE_BUFFERING) && this.state.currentPlaying && !this.changingTrack) ? (
                            <Button
                                onPress={this.togglePlayback}
                                icon={<Icon name='pause' type='material' color='#fff' />}
                                buttonStyle={{ marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                                title=" Pause" />
                        ) : (
                            <Button
                                onPress={this.togglePlayback}
                                icon={<Icon name='play-arrow' type='material' color='#fff' />}
                                buttonStyle={{ marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0 }}
                                title=" Play" />
                        )}
                    </Card>
                    {listImages}
                </ScrollView>
            </ThemeProvider>
        );
    }
}

export default observer(AboutMarker);