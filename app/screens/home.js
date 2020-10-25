import React from 'react';
import { Button, ThemeProvider, Header } from 'react-native-elements';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searching: false,
    };
  }

  async componentDidMount() {
  }

  render() {

    return (
        <ThemeProvider>
            <Header
                leftComponent={{ icon: 'menu', color: '#fff' }}
                centerComponent={{ text: 'Découverto', style: { color: '#fff' } }}
                rightComponent={{ icon: 'home', color: '#fff' }}
                containerStyle={{
                    backgroundColor: '#dc3133',
                    justifyContent: 'space-around',
                }}
            />
      <Button title="Hey!" />
    </ThemeProvider>
    );
  }
}