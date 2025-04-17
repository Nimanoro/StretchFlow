import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Pressable, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const STORAGE_KEY = 'stretchflow_notification_settings';

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);


  const loadSettings = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
  
    if (json) {
      const { enabled, hour, minute } = JSON.parse(json);
      setEnabled(enabled);
  
      const d = new Date();
      d.setHours(hour);
      d.setMinutes(minute);
      setTime(d);
    } else {
      // No settings saved yet — default to 3:00 PM
      const defaultTime = new Date();
      defaultTime.setHours(15);
      defaultTime.setMinutes(0);
      setTime(defaultTime);
      
      // Optional: auto-schedule 3PM if user has notifications enabled already
      const granted = await registerPermission();
      if (granted) await scheduleNotification(defaultTime);
    }
  };
  

  const saveSettings = async (newEnabled, newTime = time) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        enabled: newEnabled,
        hour: newTime.getHours(),
        minute: newTime.getMinutes(),
      })
    );
  };

  const registerPermission = async () => {
    if (!Device.isDevice) {
      alert('Push notifications only work on a physical device.');
      return false;
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  };

  


  const scheduleNotification = async (selectedTime) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const motivationalQuotes = [
        "You're one stretch away from feeling better 💪",
        "Move your body, clear your mind 🧘",
        "A little stretch = big impact 🙌",
        "Let your muscles breathe today 🫁",
        "Feel the flow — stretch it out 🌀",
      ];
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to stretch 🧘',
        body: randomQuote,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour: selectedTime.getHours(),
        minute: selectedTime.getMinutes(),
        repeats: true,
      },
    });

    Alert.alert(
      'Reminder Set ✅',
      `You’ll be reminded daily at ${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );
  };
  

  const toggleEnabled = async (value) => {
    setEnabled(value);
    await saveSettings(value);
  
    const granted = await registerPermission();
    if (!granted) return;
  
    if (value) {
      await scheduleNotification(time);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };
  

  const handleTimeChange = async (event, selectedTime) => {
    if (selectedTime) {
      setTime(selectedTime);
      setShowPicker(Platform.OS === 'ios');
      await saveSettings(true, selectedTime);
      await scheduleNotification(selectedTime);
    } else {
      setShowPicker(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Daily Stretch Reminder</Text>
        <Switch value={enabled} onValueChange={toggleEnabled} />
      </View>

      {enabled && (
        <View style={{ marginTop: 10 }}>
          <Pressable onPress={() => setShowPicker(true)}>
            <Text style={{ fontSize: 14, marginTop: 8, color: '#10B981' }}>

              Reminder time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      )}
    </View>
  );
}
