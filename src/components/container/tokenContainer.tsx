//@ts-ignore
import { TokenCard } from '@orbyt/components';
//@ts-ignore
import { colors } from '@orbyt/constants';
import { WalletAction } from '@orbyt/redux';
import React from 'react';
import { View, Text, Animated } from 'react-native';
import { connect } from 'react-redux';

const TokenContainer = (props: any) => {
  const { getTokenList } = WalletAction(props);
  const opacity = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState<any>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { tokenList, address, settings, providerUrl } = props;

  function slideUp() {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }

  React.useEffect(() => {
    if (mounted) {
      // getTokenList(address, settings);
      setTimeout(slideUp, 2000);
      setLoading(false);
    }
    setMounted(true);
  }, [mounted]);

  React.useEffect(() => {
    getTokenList(address, settings);
  }, [providerUrl]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          margin: 10,
          display: 'flex',
        },
        {
          opacity,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'SF-Pro-Rounded-Bold',
          fontSize: 25,
          color: colors.orange,
        }}
      >
        TOKENS
      </Text>
      {loading ? (
        <View
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SF-Pro-Rounded-Bold',
              fontSize: 20,
              color: 'gray',
            }}
          >
            LOADING
          </Text>
        </View>
      ) : !loading && tokenList.length === 0 ? (
        <View
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SF-Pro-Rounded-Bold',
              fontSize: 20,
              color: 'gray',
            }}
          >
            No Tokens Found
          </Text>
        </View>
      ) : (
        tokenList.map((item: any, index: any) => {
          return (
            <TokenCard
              key={index}
              logo={item.logo}
              name={item.symbol}
              symbol={item.symbol}
              amount={item.balance}
            />
          );
        })
      )}
    </Animated.View>
  );
};

const mapStateToProps = (state: any) => {
  return {
    address: state.wallet.address,
    tokenList: state.wallet.tokenList,
    settings: state.wallet.settings,
    providerUrl: state.wallet.providerUrl,
  };
};

export default connect(mapStateToProps)(TokenContainer);
