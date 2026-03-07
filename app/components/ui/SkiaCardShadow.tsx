import { useState, type ReactNode } from 'react';
import { type LayoutChangeEvent, View, type ViewStyle } from 'react-native';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';

export type ShadowConfig = {
  dx: number;
  dy: number;
  blur: number;
  color: string;
};

type SkiaCardShadowProps = {
  borderRadius: number;
  backgroundColor: string;
  shadows: ShadowConfig[];
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Renders a Skia-powered drop shadow behind a rounded card.
 * The background fill is handled by a regular View; Skia only draws
 * the shadow (via shadowOnly) for a clean separation of concerns.
 */
export function SkiaCardShadow({
  borderRadius,
  backgroundColor,
  shadows,
  children,
  style,
}: SkiaCardShadowProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== layout.width || height !== layout.height) {
      setLayout({ width, height });
    }
  };

  const spread = shadows.reduce(
    (max, s) => Math.max(max, s.blur + Math.max(Math.abs(s.dx), Math.abs(s.dy))),
    0,
  );

  return (
    <View style={[style, { overflow: 'visible' }]} onLayout={handleLayout}>
      {layout.width > 0 && layout.height > 0 && (
        <Canvas
          style={{
            position: 'absolute',
            left: -spread,
            top: -spread,
            width: layout.width + spread * 2,
            height: layout.height + spread * 2,
          }}
          pointerEvents="none"
        >
          <RoundedRect
            x={spread}
            y={spread}
            width={layout.width}
            height={layout.height}
            r={borderRadius}
            color={backgroundColor}
          >
            {shadows.map((s, i) => (
              <Shadow key={i} dx={s.dx} dy={s.dy} blur={s.blur} color={s.color} shadowOnly />
            ))}
          </RoundedRect>
        </Canvas>
      )}
      <View style={{ flex: 1, borderRadius, overflow: 'hidden', backgroundColor }}>{children}</View>
    </View>
  );
}
