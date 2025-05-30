import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Received background FCM message:', remoteMessage);
  // Optional: Use Notifee to show notification manually
});
