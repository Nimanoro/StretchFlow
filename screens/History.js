import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getStretchDates, getLastStretchSessions } from '../utils/userStorage';
import { ThemeContext } from '../context/ThemeContext';
import { getUserData } from '../utils/userStorage';
export default function HistoryScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [history, setHistory] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, activeDays: 0, streak: 0 });
  const { themeName } = useContext(ThemeContext);
  const isDark = themeName === 'dark';

  useEffect(() => {
    const loadHistory = async () => {
      const sessions = await getLastStretchSessions();
      const dates = await getStretchDates(); // [{ date: 'YYYY-MM-DD' }]
      const dateStrings = [...new Set(dates.map(d => d.date))];

      setAllSessions(sessions);

      const marks = {};

      // Add dots and selection for completed days
      dateStrings.forEach(date => {
        marks[date] = {
          selected: selectedDate === date,
          selectedColor: selectedDate === date ? '#DCFCE7' : undefined,
          selectedTextColor: selectedDate === date ? '#10B981' : undefined,
          marked: true,
          dotColor: '#10B981',
        };
      });

      // If selected day has no stretch session, mark it explicitly
      if (selectedDate && !marks[selectedDate]) {
        marks[selectedDate] = {
          selected: true,
          selectedColor: '#DCFCE7',
          selectedTextColor: '#10B981',
        };
      }

      setMarkedDates(marks);

      const filtered = selectedDate
        ? sessions.filter(s => s.date === selectedDate)
        : sessions;

      setHistory(filtered.sort((a, b) => new Date(b.time) - new Date(a.time)));
      const userData = await getUserData();

      setSummary({
        total: sessions.length,
        activeDays: dateStrings.length,
        streak: userData?.streak
      });
    };

    loadHistory();
  }, [selectedDate, isDark]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <Text style={[styles.title, { color: isDark ? '#F3F4F6' : '#111827' }]}>Stretching History</Text>

      <View style={[styles.summaryBox, { backgroundColor: isDark ? '#1F2937' : '#E5F9F0' }]}>
        <Text style={[styles.summaryText, { color: isDark ? '#F3F4F6' : '#065F46' }]}>
          ✅ Sessions: {summary.total} ‣ Active Days: {summary.activeDays} ‣ Streak: {summary.streak}🔥
        </Text>
      </View>

      <Calendar
        markingType="dot"
        markedDates={markedDates}
        onDayPress={(day) => {
          const selected = day.dateString;
          if (selected === selectedDate) {
            setSelectedDate('');
          } else {
            setSelectedDate(selected);
          }
        }}
        theme={{
          calendarBackground: isDark ? '#0F172A' : '#F9FAFB',
          textSectionTitleColor: isDark ? '#9CA3AF' : '#6B7280',
          dayTextColor: isDark ? '#F3F4F6' : '#111827',
          arrowColor: '#10B981',
          selectedDayBackgroundColor: '#DCFCE7',
          selectedDayTextColor: '#10B981',
          todayTextColor: '#10B981',
        }}
        style={{ calendarBackground: isDark ? '#0F172A' : '#F9FAFB',
            marginBottom: 20 }}
      />

      {selectedDate ? (
        <Pressable
          onPress={() => setSelectedDate('')}
        >
          <Text style={styles.clearFilter}>Clear filter</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}>
            <View style={styles.cardRow}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" style={{ marginRight: 10 }} />
              <Text style={[styles.cardTitle, { color: isDark ? '#F3F4F6' : '#111827' }]}>
                {item.title || 'Stretch Session'}
              </Text>
            </View>
            <Text style={[styles.cardDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.date} • {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          selectedDate ? (
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No sessions logged on this day.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearFilter: {
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
});
