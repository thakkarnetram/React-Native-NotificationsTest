import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {navigate} from '../AppNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const channelId = 'missedAlarm';
export const channelName = 'Missed Alarms';

const showForegroundNotification = async (message: any) => {
  if (!message || !message?.notification) {
    return;
  }
  const {title, body} = message.notification;
  const {type} = message?.data;

  let obj = {
    title,
    body,
    android: {
      channelId: channelId, //pass the same channel id for which channel is created
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
  };
  if (type) {
    //if type exist, pass it to the notification object
    obj.data = {type};
  }
  notifee.displayNotification(obj);
};

export const setNotificationsHandler = async () => {
  let granted = await checkNotificationPermissionStatus();
  if (!granted) {
    return;
  }
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  await AsyncStorage.setItem('token', token);

  notifee.isChannelCreated(channelId).then(isCreated => {
    if (!isCreated) {
      notifee.createChannel({
        id: channelId,
        name: channelName,
        sound: 'default',
      });
    }
  });

  notifee.onForegroundEvent(({type, detail}) => {
    switch (type) {
      case EventType.DISMISSED: {
        //User dismiss notification that received in foreground
        console.log('Notification dismissed');
        break;
      }
      case EventType.PRESS: {
        console.log('Notification pressed');
        const {type} = detail?.notification?.data;
        switch (type) {
          case 'missedAlarms':
            navigate('MissedAlarms');
            break;
          default:
            break;
        }
        break;
      }
    }
  });

  messaging().onMessage(showForegroundNotification);
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Background state: Notification tapped:');
    if (remoteMessage?.notification?.data) {
      const {type} = remoteMessage?.notification?.data;
      switch (type) {
        case 'missedAlarms':
          navigate('MissedAlarms');
          break;
        default:
          break;
      }
    }
  });
};
