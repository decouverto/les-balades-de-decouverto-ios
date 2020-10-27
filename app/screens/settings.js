import React from 'react';
import { Linking, Alert, ScrollView, View } from 'react-native';
import { Card, Button, Icon, ThemeProvider, Header, Text } from 'react-native-elements';


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.route.params;
    }

    componentDidMount() {
    }

    componentWillUnmount() {
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
                    containerStyle={{
                        backgroundColor: "#dc3133",
                        justifyContent: "space-around",
                    }}
                />

                <ScrollView>
                    <Text h2 style={{marginLeft: 10}}>Gérer les promenades téléchargées</Text>
                </ScrollView>
            </ThemeProvider>
        );
    }
}

