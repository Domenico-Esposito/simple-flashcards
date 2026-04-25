import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, Group, LinearGradient, Path, vec } from '@shopify/react-native-skia';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const VIEWBOX_WIDTH = 693;
const VIEWBOX_HEIGHT = 797;

const BACK_CARD_PATH_SVG =
  'M459.121,42.393l202.475,541.842c12.597,33.711 -4.545,71.308 -38.256,83.905l-332.824,124.369c-33.711,12.597 -71.308,-4.545 -83.905,-38.256l-202.475,-541.842c-12.597,-33.711 4.545,-71.308 38.256,-83.905l332.824,-124.369c33.711,-12.597 71.308,4.545 83.905,38.256Z';
const FRONT_CARD_PATH_SVG =
  'M691.991,159.484l-51.952,576.099c-3.232,35.842 -34.956,62.318 -70.798,59.086l-353.866,-31.911c-35.842,-3.232 -62.318,-34.956 -59.086,-70.798l51.952,-576.099c3.232,-35.842 34.956,-62.318 70.798,-59.086l353.866,31.911c35.842,3.232 62.318,34.956 59.086,70.798Z';

const stackAnchor = {
  x: 286,
  y: 700,
} as const;

const backCardMotion = {
  rotate: -3.5,
  x: -24,
  y: 12,
} as const;

const frontCardMotion = {
  rotate: 6.5,
  x: 54,
  y: -24,
} as const;

const backCardGradient = {
  start: vec(7.948034, 158.220007),
  end: vec(656.601418, 635.25855),
  colors: ['#E8E8E8', '#E4E4E4', '#DADADA'],
  positions: [0, 0.45, 1],
} as const;

const frontCardGradient = {
  start: vec(235.128211, 68.655495),
  end: vec(613.455244, 779.419619),
  colors: ['#434343', '#292929', '#1F1F1F'],
  positions: [0, 0.54, 1],
} as const;

type CardLayerProps = {
  path: string;
  scale: number;
  gradient: {
    start: ReturnType<typeof vec>;
    end: ReturnType<typeof vec>;
    colors: readonly string[];
    positions: readonly number[];
  };
};

type AnimatedAppIconProps = {
  size?: number;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

function createFanTransform(
  anchorX: number,
  anchorY: number,
  translateX: number,
  translateY: number,
  rotation: number,
) {
  'worklet';

  return [
    { translateX: anchorX + translateX },
    { translateY: anchorY + translateY },
    { rotate: `${rotation}deg` },
    { translateX: -anchorX },
    { translateY: -anchorY },
  ];
}

function CardLayer({ path, scale, gradient }: CardLayerProps) {
  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Group transform={[{ scale }]}>
        <Path path={path}>
          <LinearGradient
            start={gradient.start}
            end={gradient.end}
            colors={[...gradient.colors]}
            positions={[...gradient.positions]}
          />
        </Path>
      </Group>
    </Canvas>
  );
}

export function AnimatedAppIcon({ size = 200, animated = true, style }: AnimatedAppIconProps) {
  const fanProgress = useSharedValue(animated ? 0 : 1);
  const scale = size / VIEWBOX_HEIGHT;
  const contentWidth = VIEWBOX_WIDTH * scale;
  const horizontalInset = (size - contentWidth) / 2;
  const anchorX = horizontalInset + stackAnchor.x * scale;
  const anchorY = stackAnchor.y * scale;

  useEffect(() => {
    cancelAnimation(fanProgress);

    if (!animated) {
      fanProgress.value = 1;
      return;
    }

    fanProgress.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(fanProgress);
    };
  }, [animated, fanProgress]);

  const animatedBackCardStyle = useAnimatedStyle(() => ({
    transform: createFanTransform(
      anchorX,
      anchorY,
      backCardMotion.x * scale * fanProgress.value,
      backCardMotion.y * scale * fanProgress.value,
      backCardMotion.rotate * fanProgress.value,
    ),
  }));

  const animatedFrontCardStyle = useAnimatedStyle(() => ({
    transform: createFanTransform(
      anchorX,
      anchorY,
      frontCardMotion.x * scale * fanProgress.value,
      frontCardMotion.y * scale * fanProgress.value,
      frontCardMotion.rotate * fanProgress.value,
    ),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View style={[styles.layer, animatedBackCardStyle]}>
        <View
          style={[styles.cardFrame, { width: contentWidth, height: size, left: horizontalInset }]}
        >
          <CardLayer path={BACK_CARD_PATH_SVG} scale={scale} gradient={backCardGradient} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.layer, animatedFrontCardStyle]}>
        <View
          style={[styles.cardFrame, { width: contentWidth, height: size, left: horizontalInset }]}
        >
          <CardLayer path={FRONT_CARD_PATH_SVG} scale={scale} gradient={frontCardGradient} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    position: 'relative',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  cardFrame: {
    overflow: 'visible',
    position: 'absolute',
    top: 0,
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});
