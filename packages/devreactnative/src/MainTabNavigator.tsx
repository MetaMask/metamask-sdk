import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {MD3Theme, useTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {DemoScreen} from './screens/DemoScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {DemoStack, MainTab, SettingsStack} from './screens/navigation.params';

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
            title: 'Demo',
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
        <MainTab.Screen
          name="settings"
          options={{
            headerShown: true,
            title: 'Settings',
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons
                name="cog-outline"
                color={color}
                size={size}
              />
            ),
          }}>
          {() => (
            <SettingsStack.Navigator>
              <SettingsStack.Screen
                name="settings_main"
                component={SettingsScreen}
                options={{headerShown: false}}
              />
            </SettingsStack.Navigator>
          )}
        </MainTab.Screen>
      </MainTab.Navigator>
    </View>
  );
};
