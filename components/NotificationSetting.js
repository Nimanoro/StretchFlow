import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  Platform,
  Alert,
  StyleSheet,
  Linking,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import {
  saveScheduleNotification,
  getScheduleNotification,
} from '../utils/userStorage';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-stretch', {
    name: 'Daily Stretch Reminder',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

// 🔝  put this near the top of the file
const QUOTES = [
  '“Movement is medicine.”',
  '“A five‑minute stretch beats a five‑hour slump.”',
  '“Reset your body, refresh your mind.”',
  '“Tension is who you think you should be; relaxation is who you are.”',
  '“Tiny habits compound.”',
];
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];

};

function nextOccurrence(hour, minute) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}

async function scheduleOnce(hour, minute) {
  await ensureChannel();
  const fireDate = nextOccurrence(hour, minute);
  const randomQuote = getRandomQuote();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Time to Reset!',
      body: randomQuote,
      sound: 'default',
    },
    trigger: fireDate, // one‑shot
    channelId: Platform.OS === 'android' ? 'daily-stretch' : undefined,
  });
  console.log(`Scheduled next reminder → ${fireDate.toLocaleString()}`);
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);   // committed state
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  });
  
  const [pickerVisible, setPickerVisible] = useState(false); // overlay
  const [draftTime, setDraftTime] = useState(time);          // temp value
  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';
  const themed = getThemedStyles(isDark);

  /* ---------- mount / listener ---------- */
  useEffect(() => {
    (async () => {
      await loadSettings();
    })();

    const sub = Notifications.addNotificationReceivedListener(async () => {
      const saved = await getScheduleNotification();
      if (saved?.hour !== undefined)
        await scheduleOnce(saved.hour, saved.minute);
    });
    return () => sub.remove();
  }, []);

  /* ---------- persistence ---------- */
  async function loadSettings() {
    const saved = await getScheduleNotification();
    if (!saved) return;
    const { enabled: e, hour, minute } = saved;
    const restored = new Date();
    restored.setHours(hour, minute, 0, 0);
    setTime(restored);
    setEnabled(e);
    if (e) await scheduleOnce(hour, minute);
  }

  async function requestPermission() {
    if (!Device.isDevice) return false;
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const { status: after } = await Notifications.requestPermissionsAsync();
    if (after === 'granted') return true;

    Alert.alert(
      'Notifications Disabled',
      'Enable notifications in settings to get daily stretch reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () =>
            Platform.OS === 'ios'
              ? Notifications.openSettings()
              : Linking.openSettings(),
        },
      ]
    );
    return false;
  }

  /* ---------- handlers ---------- */
  async function handleToggle(on) {
    if (!on) {
      setEnabled(false);
      await Notifications.cancelAllScheduledNotificationsAsync();
      await saveScheduleNotification({
        enabled: false,
        hour: time.getHours(),
        minute: time.getMinutes(),
      });
      return;
    }
    const ok = await requestPermission();
    if (!ok) return;

    setDraftTime(time);
    setPickerVisible(true); // open overlay
  }

  function handlePickerChange(_, selected) {
    if (selected) setDraftTime(selected);
  }

  async function confirmTime() {
    const picked = new Date(draftTime);
    picked.setSeconds(0);
    picked.setMilliseconds(0);

    const hour = picked.getHours();
    const minute = picked.getMinutes();

    setTime(picked);
    setEnabled(true);
    setPickerVisible(false);

    await Notifications.cancelAllScheduledNotificationsAsync();
    await scheduleOnce(hour, minute);
    await saveScheduleNotification({ enabled: true, hour, minute });
  }

  function cancelPick() {
    // If user was enabling for the first time, revert switch
    if (!enabled) setEnabled(false);
    setPickerVisible(false);
  }

  /* ---------- UI ---------- */
  return (
    <View style={[styles.container, themed.card]}>
      <View style={styles.toggleRow}>
        <View style={styles.row}>
      <Ionicons name="time" size={20} color={isDark ? '#10B981' : '#34D399'}  />
      <Text style={[styles.title, isDark && { color: '#fff' }]}>
        Daily Reminder
        
      </Text>
      </View> 
        <Switch value={enabled} onValueChange={handleToggle} />
      </View>

      {enabled && (
        <View style={styles.toggleRow}>
          <Text style={[styles.label, isDark && { color: '#fff' }]}>
            Reminder Time
          </Text>
          <Pressable
            onPress={() => {
              setDraftTime(time);
              setPickerVisible(true);
            }}
            style={styles.timeButton}
          >
            <Text style={styles.timeText}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
        </View>
      )}

      {/* --------- Picker Overlay --------- */}
      <Modal
        animationType="slide"
        transparent
        visible={pickerVisible}
        onRequestClose={cancelPick}
      >
        <View style={styles.overlay}>
          <View style={[styles.card, isDark && { backgroundColor: '#1a1a1a' }]}>
            <DateTimePicker
              value={draftTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handlePickerChange}
            />

            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelBtn} onPress={cancelPick}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={confirmTime}>
                <Text style={styles.confirmTxt}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                            */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#374151',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  timeText: {
    color: '#10B981',
    fontWeight: '600',
  },
  /* ----- overlay ----- */
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 8,
  },
  cancelTxt: {
    color: '#888',
    fontSize: 16,
  },
  confirmTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


const getThemedStyles = (isDark) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#0F172A' : '#F0F4F3',
    },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#334155' : '#E5E7EB',
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    text: {
      color: isDark ? '#F3F4F6' : '#111827',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    input: {
      backgroundColor: isDark ? '#1E293B' : '#fff',
      borderColor: isDark ? '#475569' : '#D1D5DB',
      color: isDark ? '#F3F4F6' : '#111827',
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      marginTop: 8,
    },
    link: {
      color: isDark ? '#93C5FD' : '#3B82F6',
    },
    subtleWarning: {
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
  });
