/**
 * @format
 */
import 'node-libs-react-native/globals';
import 'react-native-url-polyfill/auto';

import {AppRegistry} from 'react-native';
import { ConnectedApp } from './src/ConnectedApp';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => ConnectedApp);
