// utils/analytics.js
import * as amplitude from '@amplitude/analytics-react-native';


let initialized = false;

export const initAnalytics = () => {
  if (initialized) return;
  amplitude.init('8d2f7b7a042773aa23e56b7f36913614'); // Replace with your real API key
  initialized = true;
  console.log('✅ Amplitude initialized');
};

export const track = (eventName, props = {}) => {
  if (!initialized) initAnalytics();
  amplitude.logEvent(eventName, props);
};
