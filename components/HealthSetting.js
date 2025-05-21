import AppleHealthKit from 'react-native-health';

const healthKitOptions = {
  permissions: {
    write: [AppleHealthKit.Constants.Permissions.MindfulSession],
    read: [],
  },
};

AppleHealthKit.initHealthKit(healthKitOptions, (err) => {
  if (err) {
    console.log("HealthKit not available:", err);
  }
});
