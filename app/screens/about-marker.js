import React from 'react';
import { Linking, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, Icon, ThemeProvider, Header, Text } from 'react-native-elements';


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

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.route.params;
    }

    componentDidUpdate(prevProps) {
        if (this.props.route.params.title != prevProps.route.params.title) {
            this.setState(this.props.route.params);
        } 
    }


    render() {
        const listImages = (this.state.images || []).map(image => {
            let { width } = Dimensions.get('window');
            width=width*0.8;
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
                        <Card.Divider/>
                        <Button
                            icon={<Icon name='play-arrow' type='material' color='#fff' />}
                            buttonStyle={{marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                            title=" Play" />
                        <Button
                            icon={<Icon name='pause' type='material' color='#fff' />}
                            buttonStyle={{marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                            title=" Pause" />
                    </Card>
                    {listImages}
                </ScrollView>
            </ThemeProvider>
        );
    }
}

