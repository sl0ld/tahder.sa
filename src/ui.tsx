import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { theme } from './theme';

type HeaderProps = {
  title: string;
  subtitle?: string;
  name?: string;
  onBellPress?: () => void;
};

type BottomTabsProps = {
  tabs: Array<{ key: string; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }>;
  activeTab: string;
  onChangeTab: (key: string) => void;
};

type PillProps = {
  label: string;
  tone?: 'primary' | 'teal' | 'amber' | 'rose' | 'muted';
};

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ScreenHeader({ title, subtitle, name, onBellPress }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        {name ? <Text style={styles.headerName}>{name}</Text> : null}
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable onPress={onBellPress} style={styles.bellButton}>
        <MaterialCommunityIcons
          name="bell-outline"
          size={20}
          color={theme.colors.primaryDeep}
        />
      </Pressable>
    </View>
  );
}

export function BottomTabs({ tabs, activeTab, onChangeTab }: BottomTabsProps) {
  return (
    <View style={styles.tabsWrap}>
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        renderItem={({ item }) => {
          const active = item.key === activeTab;
          return (
            <Pressable
              onPress={() => onChangeTab(item.key)}
              style={[styles.tabItem, active && styles.tabItemActive]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={19}
                color={active ? '#FFFFFF' : theme.colors.muted}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, actionLabel, onActionPress }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({ label, tone = 'muted' }: PillProps) {
  return (
    <View style={[styles.pill, pillToneStyles[tone]]}>
      <Text style={[styles.pillText, pillTextToneStyles[tone]]}>{label}</Text>
    </View>
  );
}

type ButtonProps = {
  label: string;
  secondary?: boolean;
  compact?: boolean;
  onPress?: () => void;
};

export function Button({ label, secondary, compact, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        compact && styles.buttonCompact,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.buttonTextSecondary,
          compact && styles.buttonTextCompact,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  accent?: 'primary' | 'teal' | 'amber' | 'rose';
  note?: string;
};

export function StatCard({ label, value, accent = 'primary', note }: StatCardProps) {
  return (
    <View style={[styles.statCard, statAccentStyles[accent]]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {note ? <Text style={styles.statNote}>{note}</Text> : null}
    </View>
  );
}

type ProgressProps = {
  value: number;
  accent?: 'primary' | 'teal' | 'amber' | 'rose';
};

export function ProgressBar({ value, accent = 'primary' }: ProgressProps) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(value, 100)}%` },
          progressAccentStyles[accent],
        ]}
      />
    </View>
  );
}

export function GhostDivider() {
  return <View style={styles.divider} />;
}

const raisedSurface = Platform.select({
  web: {
    boxShadow: '0 10px 24px rgba(13, 38, 76, 0.10)',
  },
  default: {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});

const floatingSurface = Platform.select({
  web: {
    boxShadow: '0 6px 16px rgba(13, 38, 76, 0.10)',
  },
  default: {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});

const pillToneStyles = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primarySoft },
  teal: { backgroundColor: theme.colors.tealSoft },
  amber: { backgroundColor: theme.colors.amberSoft },
  rose: { backgroundColor: theme.colors.roseSoft },
  muted: { backgroundColor: theme.colors.surfaceAlt },
});

const pillTextToneStyles = StyleSheet.create({
  primary: { color: theme.colors.primary },
  teal: { color: theme.colors.teal },
  amber: { color: theme.colors.amber },
  rose: { color: theme.colors.rose },
  muted: { color: theme.colors.muted },
});

const statAccentStyles = StyleSheet.create({
  primary: { borderColor: theme.colors.primarySoft },
  teal: { borderColor: theme.colors.tealSoft },
  amber: { borderColor: theme.colors.amberSoft },
  rose: { borderColor: theme.colors.roseSoft },
});

const progressAccentStyles = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primary },
  teal: { backgroundColor: theme.colors.teal },
  amber: { backgroundColor: theme.colors.amber },
  rose: { backgroundColor: theme.colors.rose },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerName: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: theme.colors.text,
    textAlign: 'right',
    marginTop: 2,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'right',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...floatingSurface,
  },
  tabsWrap: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingVertical: 10,
  },
  tabsContent: {
    paddingHorizontal: 10,
    gap: 6,
    flexDirection: 'row-reverse',
  },
  tabItem: {
    minWidth: 72,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    color: theme.colors.muted,
    fontWeight: '700',
    fontSize: 11,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    ...raisedSurface,
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'right',
  },
  sectionAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
  },
  sectionActionText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  buttonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  buttonTextSecondary: {
    color: theme.colors.primary,
  },
  buttonTextCompact: {
    fontSize: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
  },
  statValue: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 24,
    textAlign: 'right',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  statNote: {
    color: theme.colors.primary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
  progressTrack: {
    height: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.line,
    marginVertical: 14,
  },
});
