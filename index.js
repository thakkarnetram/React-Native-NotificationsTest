/**
 * @format
 */
import notifee from '@notifee/react-native';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
notifee.registerForegroundService((notification) => {
  return new Promise(() => {
    // Long running task...
  });
});
AppRegistry.registerComponent(appName, () => App);
