import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AnimatedAppIcon } from '@/components/ui/AnimatedAppIcon';

type RootSplashScreenProps = {
  onLayout?: () => void;
};

export function RootSplashScreen({ onLayout }: RootSplashScreenProps) {
  const iconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(iconOpacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [iconOpacity]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <LinearGradient
        colors={['#1469D2', '#3371BD']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View style={{ opacity: iconOpacity }}>
            <AnimatedAppIcon size={200} />
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1469D2',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
  },
});
