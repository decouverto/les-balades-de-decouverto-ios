# les-balades-de-decouverto-ios

The application to discover history through rides from Découverto on iOS.


## Features to add afterwards:

* share walk button


## Fonts to be included (less the better)

* `ƒont-awesome-5`
* `material`


## Problem with XCode 

```
rm -rf ~/.itmstransporter/
```


```
 cd ~/Library/Caches && mv com.apple.amp.itmstransporter com.apple.amp.itmstransporter.old
```

## Problem wit React-Native

https://github.com/facebook/react-native/issues/29279

## Problem running debug

https://stackoverflow.com/questions/55235825/error-failed-to-build-ios-project-we-ran-xcodebuild-command-but-it-exited-wit

Install cocoapods in order to be able to perform ‘pod install‘

https://stackoverflow.com/questions/73833458/swiftemitmodule-normal-arm64-emitting-module-for-yogakit-in-target-yogakit

https://stackoverflow.com/questions/60431824/how-to-install-react-native-track-player

https://github.com/facebook/react-native/issues/36758

## Notes on update

Node 18 should be used
```
  "dependencies": {
    "@react-native-community/async-storage": "^1.12.1",
    "@react-native-community/geolocation": "^2.0.2",
    "@react-native-community/masked-view": "^0.1.10",
    "@react-navigation/drawer": "^5.10.0",
    "@react-navigation/native": "^5.8.0",
    "async": "^3.2.0",
    "distance-between-points": "0.0.0",
    "mobx": "^4.2.1",
    "mobx-react": "^5.1.2",
    "osm-tile-list-json": "0.0.2",
    "react": "16.13.1",
    "react-native": "^0.62.2",
    "react-native-elements": "^3.0.0-alpha.1",
    "react-native-fs": "^2.16.6", // didn't changed much
    "react-native-gesture-handler": "^1.8.0", // why, should be updated
    "react-native-htmlview": "^0.16.0", // did'nt changed
    "react-native-maps": "^0.27.1", // changed but does not seams that 
    "react-native-reanimated": "^1.13.1", // why, should be updated
    "react-native-responsive-image": "^2.3.1", // didn't changed
    "react-native-safe-area-context": "^3.1.8", // why ? changed
    "react-native-screens": "^2.11.0", // why ? changed
    "react-native-swift": "^1.2.3", // why ? changed
    "react-native-track-player": "^1.2.3", // changed but easy guide
    "react-native-vector-icons": "^7.1.0", // changed but should be ok, need to adapt the elements to the font family
    "react-native-zip-archive": "^5.0.6" // should be updated, note that it works with expo
  },
```
Maybe try Expo Dev again