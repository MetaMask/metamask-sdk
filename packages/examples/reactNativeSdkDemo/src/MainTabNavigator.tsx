import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {MD3Theme, useTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {DemoScreen} from './screens/DemoScreen';
import {DemoStack, MainTab} from './screens/navigation.params';

const getStyles = ({theme}: {theme: MD3Theme}) => {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1, // The color you want for the bottom part of the screen
    },
  });
};

export const MainTabNavigator = () => {
  const theme = useTheme();
  const styles = useMemo(() => getStyles({theme}), [theme]);
  return (
    <View style={styles.container}>
      <MainTab.Navigator
        initialRouteName="demo"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
        }}>
        <MainTab.Screen
          name="demo"
          options={{
            headerShown: true,
            title: 'MetaMask ReactNativeSDK - Demo',
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons
                name="chart-pie"
                color={color}
                size={size}
              />
            ),
          }}>
          {() => (
            <DemoStack.Navigator>
              <DemoStack.Screen
                name="demo_main"
                component={DemoScreen}
                options={{headerShown: false}}
              />
            </DemoStack.Navigator>
          )}
        </MainTab.Screen>
      </MainTab.Navigator>
    </View>
  );
};
