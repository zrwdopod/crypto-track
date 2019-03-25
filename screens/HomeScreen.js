import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux'
import * as actions from '../actions/Home'

import {
    AsyncStorage,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Picker
} from 'react-native';
import {WebBrowser} from 'expo';

import {MonoText} from '../components/StyledText';

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buy: 0,
            sell: 0,
            ratesBaseEUR: {},
            buyCurrencyType: 'CNY',
            sellCurrencyType: 'AUD',
            rate: 0,
            revenue: 0,
            revenueRate: 0,
            cryptoType: 'BTC',
            cryptoCoins: ['BTC', 'ETH'],
            cryptoBuyRate: 0,
            cryptoSellRate: 0
        };
    }

    static navigationOptions = {
        header: null,
    };

    async componentDidMount() {
        try {
            const res = await axios.get('http://data.fixer.io/api/latest?access_key=1bdc93b9c2565de8d7a70d5b9a735130');
            let ratesBaseEUR = res.data.rates;

            let cryptoType = await AsyncStorage.getItem('CRYPTO_TYPE');

            if (cryptoType) {
                this.setState({cryptoType});
            }
            let buyCurrencyType = await AsyncStorage.getItem('BUY_CURRENCY_TYPE');
            if (buyCurrencyType) {
                this.setState({buyCurrencyType});
            }
            let sellCurrencyType = await AsyncStorage.getItem('SELL_CURRENCY_TYPE');
            if (sellCurrencyType) {
                this.setState({sellCurrencyType});
            }
            await this.setState({ratesBaseEUR: ratesBaseEUR});
            await this.setRate();
            this.setCryptoRate();
        } catch (err) {
            // alert(JSON.stringify(err));
        }

    }

    async setCryptoRate() {
        const {cryptoType} = this.state;
        try {
            // const params = {
            //     start: 1,
            //     limit: 5000,
            //     convert: 'USD'
            // };
            // const cryptoRes = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${cryptoType}?apikey=D2A8FF26-AB8A-4CED-8B5B-D08B4473B6D5`);

            // const params = {
            //     apikey: 'D2A8FF26-AB8A-4CED-8B5B-D08B4473B6D5'
            // };
            // const cryptoRes = await this.props.getLatestCurrencyRate(params);
            const cryptoRes = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${cryptoType}?apikey=D2A8FF26-AB8A-4CED-8B5B-D08B4473B6D5`);
            let ratesBaseBitCoin = cryptoRes.data.rates;
            let EUR = ratesBaseBitCoin.filter(item => item.asset_id_quote === 'EUR');
            const {ratesBaseEUR, buyCurrencyType, sellCurrencyType} = this.state;
            let rateBuyBaseEUR = ratesBaseEUR[buyCurrencyType];
            let rateSellBaseEUR = ratesBaseEUR[sellCurrencyType];
            if (EUR[0]) {
                this.setState({cryptoBuyRate: rateBuyBaseEUR * EUR[0].rate, cryptoSellRate: rateSellBaseEUR * EUR[0].rate});
            } else {
                // alert('未获取到EUR[0]');
            }
        } catch (err) {
            // alert(JSON.stringify(err));
        }
    }

    async setRate() {
        const {ratesBaseEUR, buyCurrencyType, sellCurrencyType} = this.state;
        let rate = ratesBaseEUR[buyCurrencyType] / ratesBaseEUR[sellCurrencyType];
        this.setState({rate: rate});

    }

    async buyCurrencyTypeChange(itemValue, itemIndex) {
        await this.setState({buyCurrencyType: itemValue});
        await AsyncStorage.setItem('BUY_CURRENCY_TYPE', itemValue);
        this.setRate();

    }

    async sellCurrencyTypeChange(itemValue, itemIndex) {
        await this.setState({sellCurrencyType: itemValue});
        await AsyncStorage.setItem('SELL_CURRENCY_TYPE', itemValue);
        this.setRate();
    }

    async cryptoTypeChange(itemValue, itemIndex) {
        await this.setState({cryptoType: itemValue});
        await AsyncStorage.setItem('CRYPTO_TYPE', itemValue);
        this.setCryptoRate();
    }

    async buyChange(buy) {
        await this.setState({buy});
        this.calculate();
    }

    async sellChange(sell) {
        await this.setState({sell: sell});
        this.calculate();
    }

    calculate() {
        let {buyCurrencyType, buy, sell, rate} = this.state;
        buy = parseInt(buy, 10);
        sell = parseInt(sell, 10);
        if (buy > 0 && sell > 0) {

            let sellTarget = sell * rate;
            let revenue = sellTarget - buy;
            let revenueRate = revenue / buy;
            let msg = `盈利:${revenue.toFixed(2)}${buyCurrencyType},盈利率:${(revenueRate * 100).toFixed(2)}%`;
            this.setState({rate, revenue, revenueRate, msg});
        } else {
            this.setState({msg: '没有计算结果'});
        }
    }

    render() {
        const {rate, cryptoCoins, buy, sell, msg, ratesBaseEUR, buyCurrencyType, sellCurrencyType, cryptoType, cryptoBuyRate, cryptoSellRate} = this.state;
        return (
            <View style={styles.container}>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.currencyPanel}>
                        <Picker
                            selectedValue={buyCurrencyType}
                            style={{flex: 1}}
                            onValueChange={this.buyCurrencyTypeChange.bind(this)}>
                            {Object.keys(ratesBaseEUR).map((key, i) => {
                                return <Picker.Item key={key} value={key} label={key}/>
                            })}
                        </Picker>
                        <View style={styles.ratePanel}>
                            <Text style={styles.rateText}>{rate.toFixed(2) + '  :  1'}</Text>
                        </View>
                        <Picker
                            selectedValue={sellCurrencyType}
                            style={{flex: 1}}

                            onValueChange={this.sellCurrencyTypeChange.bind(this)}>
                            {Object.keys(ratesBaseEUR).map((key, i) => {
                                return <Picker.Item key={key} value={key} label={key}/>
                            })}
                        </Picker>

                    </View>
                    <View style={styles.cryptoPanel}>
                        <Picker
                            selectedValue={cryptoType}
                            style={{width: '100%'}}
                            onValueChange={this.cryptoTypeChange.bind(this)}>
                            {cryptoCoins.map((key, i) => {
                                return <Picker.Item key={key} value={key} label={key}/>
                            })}
                        </Picker>
                    </View>

                    <View style={styles.cryptoRatePanel}>
                        <TextInput
                            style={styles.input}
                            value={cryptoBuyRate.toFixed(2)}
                        />
                        <TextInput
                            style={styles.input}
                            value={cryptoSellRate.toFixed(2)}
                        />

                    </View>
                    <View style={styles.inputCurrencyPanel}>
                        <TextInput
                            style={styles.input}
                            onChangeText={this.buyChange.bind(this)}
                            value={buy.toString()}
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={this.sellChange.bind(this)}
                            value={sell.toString()}
                        />

                    </View>
                    <View style={styles.msgPanel}>
                        <Text style={styles.output}>{msg}</Text>
                    </View>
                    <View style={styles.welcomeContainer}>
                        <Image
                            source={
                                __DEV__
                                    ? require('../assets/images/icon.png')
                                    : require('../assets/images/icon.png')
                            }
                            style={styles.welcomeImage}
                        />
                    </View>
                    {/*<View style={styles.getStartedContainer}>*/}
                    {/*{this._maybeRenderDevelopmentModeWarning()}*/}

                    {/*<Text style={styles.getStartedText}>Get started by opening</Text>*/}

                    {/*<View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>*/}
                    {/*<MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>*/}
                    {/*</View>*/}

                    {/*<Text style={styles.getStartedText}>*/}
                    {/*Change this text and your app will automatically reload.*/}
                    {/*</Text>*/}
                    {/*</View>*/}

                    {/*<View style={styles.helpContainer}>*/}
                    {/*<TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>*/}
                    {/*<Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>*/}
                    {/*</TouchableOpacity>*/}
                    {/*</View>*/}
                </ScrollView>

                {/*<View style={styles.tabBarInfoContainer}>*/}
                {/*<Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>*/}

                {/*<View style={[styles.codeHighlightContainer, styles.navigationFilename]}>*/}
                {/*<MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>*/}
                {/*</View>*/}
                {/*</View>*/}
            </View>
        );
    }

// _maybeRenderDevelopmentModeWarning() {
//   if (__DEV__) {
//     const learnMoreButton = (
//       <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
//         Learn more
//       </Text>
//     );
//
//     return (
//       <Text style={styles.developmentModeText}>
//         Development mode is enabled, your app will be slower but you can use useful development
//         tools. {learnMoreButton}
//       </Text>
//     );
//   } else {
//     return (
//       <Text style={styles.developmentModeText}>
//         You are not in development mode, your app will run at full speed.
//       </Text>
//     );
//   }
// }

// _handleLearnMorePress = () => {
//   WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
// };
//
// _handleHelpPress = () => {
//   WebBrowser.openBrowserAsync(
//     'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
//   );
// };
}

export default HomeScreen;
// export default connect(
//     ({}) => ({}), {...actions},
// )(HomeScreen)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    currencyPanel: {
        flex: 1,
        flexDirection: 'row',
    },
    ratePanel: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rateText: {
        fontSize: 20,
        borderColor: 'gray',
        // borderWidth: 1,
    },
    cryptoPanel: {
        flex: 1,
        flexDirection: 'column',
    },
    cryptoRatePanel: {
        flex: 1,
        flexDirection: 'row',
    },
    inputCurrencyPanel: {
        flex: 1,
        flexDirection: 'row',
    },

    msgPanel: {
        flex: 1,
        flexDirection: 'row',
    },

    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop:10,
        paddingLeft:10,
        width: '50%'
    },
    msg: {
        height: 40,
        borderColor: 'gray',
        // borderWidth: 1,
        width: '40%'
    },

    icon: {
        flex: 1,
        flexDirection: 'row',
    },


    // developmentModeText: {
    //   marginBottom: 20,
    //   color: 'rgba(0,0,0,0.4)',
    //   fontSize: 14,
    //   lineHeight: 19,
    //   textAlign: 'center',
    // },
    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    welcomeImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    // getStartedContainer: {
    //   alignItems: 'center',
    //   marginHorizontal: 50,
    // },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)',
    },
    // codeHighlightContainer: {
    //   backgroundColor: 'rgba(0,0,0,0.05)',
    //   borderRadius: 3,
    //   paddingHorizontal: 4,
    // },
    // getStartedText: {
    //   fontSize: 17,
    //   color: 'rgba(96,100,109, 1)',
    //   lineHeight: 24,
    //   textAlign: 'center',
    // },
    // tabBarInfoContainer: {
    //   position: 'absolute',
    //   bottom: 0,
    //   left: 0,
    //   right: 0,
    //   ...Platform.select({
    //     ios: {
    //       shadowColor: 'black',
    //       shadowOffset: { height: -3 },
    //       shadowOpacity: 0.1,
    //       shadowRadius: 3,
    //     },
    //     android: {
    //       elevation: 20,
    //     },
    //   }),
    //   alignItems: 'center',
    //   backgroundColor: '#fbfbfb',
    //   paddingVertical: 20,
    // },
    // tabBarInfoText: {
    //   fontSize: 17,
    //   color: 'rgba(96,100,109, 1)',
    //   textAlign: 'center',
    // },
    navigationFilename: {
        marginTop: 5,
    },
    // helpContainer: {
    //   marginTop: 15,
    //   alignItems: 'center',
    // },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
