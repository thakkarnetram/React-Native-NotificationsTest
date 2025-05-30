import React, {useEffect} from 'react';
import {Alert, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigation from './src/AppNavigation'; // Ensure this path is correct

const App = () => {
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request permissions on iOS
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          console.log('Notification permissions not granted');
          return;
        }
      }

      // Register the device with FCM
      await messaging().registerDeviceForRemoteMessages();

      // Get the device token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      await AsyncStorage.setItem('fcmToken', token);

      // Listen to token refresh
      messaging().onTokenRefresh(async newToken => {
        console.log('FCM Token refreshed:', newToken);
        await AsyncStorage.setItem('fcmToken', newToken);
      });

      // Create a notification channel (Android)
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
      }

      // Foreground message handler
      messaging().onMessage(async remoteMessage => {
        console.log('Foreground message received:', remoteMessage);
        const {title, body} = remoteMessage.notification;
        await notifee.displayNotification({
          title,
          body,
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });
      });

      // Background and quit state message handler
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage,
        );
        // Navigate to a specific screen if needed
      });

      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage,
            );
            // Navigate to a specific screen if needed
          }
        });

      // Handle notification interactions
      notifee.onForegroundEvent(({type, detail}) => {
        if (type === EventType.PRESS) {
          console.log('User pressed the notification:', detail.notification);
          // Navigate to a specific screen if needed
        }
      });
    };

    initializeNotifications();
  }, []);

  return <AppNavigation />;
};

export default App;
