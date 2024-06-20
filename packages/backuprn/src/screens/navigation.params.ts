import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigatorScreenParams} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

export type SettingsStackParamList = {
  settings_main: undefined;
};

export type OnboardStackParamList = {
  onboard_main: undefined;
};

export type DemoStackParamList = {
  demo_main: undefined;
};

export type MainTabParamList = {
  demo: NavigatorScreenParams<DemoStackParamList>;
  onboard: NavigatorScreenParams<OnboardStackParamList>;
  settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootStackParamList = {
  main: NavigatorScreenParams<MainTabParamList>;
};

export const OnboardStack = createNativeStackNavigator<OnboardStackParamList>();
export const DemoStack = createNativeStackNavigator<DemoStackParamList>();
export const SettingsStack =
  createNativeStackNavigator<SettingsStackParamList>();
export const MainTab = createBottomTabNavigator<MainTabParamList>();
export const RootStack = createNativeStackNavigator<RootStackParamList>();
