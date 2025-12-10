import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#e0f2fe', dark: '#020617' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      {/* Header / App Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Murmurmind</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.subtitleContainer}>
        <ThemedText type="defaultSemiBold">
          Document & permit processing made simple.
        </ThemedText>
        <ThemedText>
          Manage registrations, logins, and item submissions in one place.
        </ThemedText>
      </ThemedView>

      {/* Quick summary */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle">What you can do</ThemedText>
        <ThemedText>
          • Register a new user account{'\n'}
          • Login and logout securely{'\n'}
          • Create items with name, description, and tags{'\n'}
          • See items linked to the user who created them
        </ThemedText>
      </ThemedView>

      {/* App features */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle">Jexterbarsana Features</ThemedText>
        <ThemedText>
          Jexterbarsana is designed for online processing. Each item you submit is
          tagged with your unique ID so the system can track who created it and
          display it in your list.
        </ThemedText>

        <ThemedView style={styles.pillRow}>
          <ThemedView style={styles.pill}>
            <ThemedText type="defaultSemiBold">User Accounts</ThemedText>
          </ThemedView>
          <ThemedView style={styles.pill}>
            <ThemedText type="defaultSemiBold">Items & Tags</ThemedText>
          </ThemedView>
          <ThemedView style={styles.pill}>
            <ThemedText type="defaultSemiBold">UUID Tracking</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Navigation / Demo link (still uses modal route) */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle">Preview screen</ThemedText>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="defaultSemiBold">
              Open Murmurmind sample modal
            </ThemedText>
          </Link.Trigger>
          <Link.Preview />
        </Link>
        <ThemedText>
          This modal route is just a sample while you&apos;re wiring up your
          real Register, Login, and Items screens.
        </ThemedText>
      </ThemedView>

      {/* Dev note – keep the Platform tip so the import is still used */}
      <ThemedView style={styles.sectionCard}>
        <ThemedText type="subtitle">Developer note</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to
          customize this Murmurmind home screen. Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  subtitleContainer: {
    gap: 4,
    marginBottom: 16,
  },
  sectionCard: {
    gap: 8,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)', // subtle border
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
 
