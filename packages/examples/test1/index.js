/**
 * @format
 */
import 'node-libs-react-native/globals';
import 'react-native-url-polyfill/auto';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log(`registering component ${appName}`);
AppRegistry.registerComponent(appName, () => App);
