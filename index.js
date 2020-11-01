/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import TrackPlayer from 'react-native-track-player';
import PlayerStore from './app/stores/player';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerEventHandler(async (data) => {
    if(data.type == 'remote-play') {
      TrackPlayer.play()
    } else if(data.type == 'remote-pause') {
      TrackPlayer.pause()
    } else if (data.type === 'playback-state') {
      PlayerStore.playbackState = data.state;
    }
  });