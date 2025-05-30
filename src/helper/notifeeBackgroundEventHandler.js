// notifeeBackgroundEventHandler.js
import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.ACTION_PRESS && pressAction?.id === 'default') {
    console.log('User tapped the notification (background/quit):', notification);
    // Handle navigation logic or data here if needed
  }
});
