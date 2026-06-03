import React, { useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  ContentScreen,
  HomeScreen,
  LessonPrepScreen,
  PlatformBrowserScreen,
  ReportsScreen,
  ScheduleScreen,
  StudentProfileScreen,
} from './src/screens';
import { BottomTabs, ScreenHeader } from './src/ui';
import { theme } from './src/theme';
import { teacherProfile } from './src/data';

const TABS: Array<{
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { key: 'home', label: 'الرئيسية', icon: 'view-dashboard-outline' },
  { key: 'prep', label: 'تحضيري', icon: 'book-open-page-variant-outline' },
  { key: 'noor', label: 'نور', icon: 'school-outline' },
  { key: 'madrasati', label: 'المنصة', icon: 'home-variant-outline' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const screen = useMemo(() => {
    switch (activeTab) {
      case 'prep':
        return <LessonPrepScreen />;
      case 'madrasati':
        return <PlatformBrowserScreen platform="madrasati" />;
      case 'noor':
        return <PlatformBrowserScreen platform="noor" />;
      case 'content':
        return <ContentScreen />;
      case 'schedule':
        return <ScheduleScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'student':
        return <StudentProfileScreen />;
      case 'home':
      default:
        return <HomeScreen onJumpTo={setActiveTab} />;
    }
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {activeTab === 'madrasati' || activeTab === 'noor' ? null : (
          <ScreenHeader
            title="لوحة المعلم"
            subtitle={`${teacherProfile.school} · ${teacherProfile.dateLabel}`}
            name={teacherProfile.name}
            onBellPress={() => setActiveTab('reports')}
          />
        )}
        <View style={styles.screen}>{screen}</View>
        <BottomTabs tabs={TABS} activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screen: {
    flex: 1,
  },
});
