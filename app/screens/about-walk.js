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

    openMap(initialPoint) {
        const latLng = `${initialPoint.coords.latitude},${initialPoint.coords.longitude}`;
        const label = 'Point de départ de la randonnée';
        const url = `maps:0,0?q=${label}@${latLng}`
        
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
        
    };


    render() {
        return (
            <ThemeProvider>
                <Header
                    leftComponent={
                        <Icon
                            name="arrow-left"
                            type="font-awesome-5"
                            color="#fff"
                            onPress={() => this.props.navigation.navigate('Home')}
                        />
                    }
                    centerComponent={{ text: "Découverto", style: { color: "#fff" } }}
                    rightComponent={
                        <Icon
                            name="trash-alt"
                            type="font-awesome-5"
                            color="#fff"
                            onPress={() => false}
                        />
                    }
                    containerStyle={{
                        backgroundColor: "#dc3133",
                        justifyContent: "space-around",
                    }}
                />

                <ScrollView>
                    <Card>
                        <Card.Title>{this.state.title}</Card.Title>
                        <Card.Divider/>
                        <Text>La distance du parcours est de <Text style={{ fontWeight: 'bold' }}>{(this.state.distance / 1000).toFixed(1)}km</Text>.{'\n'}</Text>
                        <Text>Thème: {this.state.theme} {'\n'}Secteur: {this.state.zone}</Text>
                
                        <Button
                            onPress={() => this.openMap(this.state.points[0])}
                            icon={<Icon name='map-signs' type='font-awesome-5' color='#fff' />}
                            buttonStyle={{marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                            title=" Se rendre au point de départ" />
                    </Card>
                    <Card>
                        <Card.Title>Avertissements</Card.Title>
                        <Card.Divider/>
                        <Text>La marche est considérée comme un sport par conséquent assurez-vous d'avoir les conditions physiques nécessaires pour pouvoir la pratiquer.{'\n'}</Text>
                        <Text>L'association Découverto, ses auteurs et ses collaborateurs déclinent toutes responsabilités quant à l'utilisation, l'exactitude et la manipulation de l'application.{'\n'}</Text>
                        <Text>Nous vous rappelons que cette application pour smartphone peut à tout moment être victime d'une panne ou d'une déficience technique. Vous ne devez par conséquent pas avoir une foi aveugle en elle et nous vous conseillons de toujours vous munir d'une carte lorsque vous allez en forêt.</Text>
                        <Button
                            icon={<Icon name='map' type='material' color='#fff' />}
                            buttonStyle={{marginTop: 10, borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: '#10ac84'}}
                            title=" Demarrer la promenade"
                            onPress={() => this.props.navigation.navigate('Map', this.state)}
                            />
                    </Card>
                </ScrollView>
            </ThemeProvider>
        );
    }
}

