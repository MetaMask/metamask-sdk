/* eslint-disable import/no-unassigned-import */
/**
 * @format
 */
import 'node-libs-react-native/globals';
import 'react-native-url-polyfill/auto';

import {AppRegistry} from 'react-native';
import {SafeApp} from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => SafeApp);
