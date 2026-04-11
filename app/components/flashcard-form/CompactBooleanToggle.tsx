import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, View, XStack } from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const COMPACT_TOGGLE_HEIGHT = 40;
const TOGGLE_SEGMENT_GAP = 4;
const ACTIVE_SEGMENT_WIDTH = 44;
const INACTIVE_SEGMENT_FLEX = 1;

type CompactBooleanToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accentColor: string;
  errorColor: string;
  activeBackgroundColor: string;
  inactiveIconColor: string;
  inactiveTextColor: string;
  falseLabel: string;
  trueLabel: string;
  falseIcon: ComponentProps<typeof MaterialIcons>['name'];
  trueIcon: ComponentProps<typeof MaterialIcons>['name'];
  falseTestID: string;
  trueTestID: string;
  falseHasError?: boolean;
  trueHasError?: boolean;
  showActiveLabel?: boolean;
  equalSegmentWidths?: boolean;
};

type CompactToggleSegmentProps = {
  active: boolean;
  showLabel: boolean;
  label: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  accentColor: string;
  errorColor: string;
  inactiveIconColor: string;
  inactiveTextColor: string;
  testID: string;
  hasError: boolean;
  showActiveLabel: boolean;
  equalSegmentWidths: boolean;
  onPress: () => void;
  onWidthChange: (width: number) => void;
};

function getSegmentStyle(active: boolean, showActiveLabel: boolean, equalSegmentWidths: boolean) {
  return {
    height: '100%' as const,
    minWidth: 0,
    position: 'relative' as const,
    width: active && !showActiveLabel && !equalSegmentWidths ? ACTIVE_SEGMENT_WIDTH : undefined,
    flex: equalSegmentWidths ? 1 : active ? undefined : INACTIVE_SEGMENT_FLEX,
  };
}

function CompactToggleSegment({
  active,
  showLabel,
  label,
  icon,
  accentColor,
  errorColor,
  inactiveIconColor,
  inactiveTextColor,
  testID,
  hasError,
  showActiveLabel,
  equalSegmentWidths,
  onPress,
  onWidthChange,
}: CompactToggleSegmentProps) {
  return (
    <Pressable
      style={getSegmentStyle(active, showActiveLabel, equalSegmentWidths)}
      onPress={onPress}
      testID={testID}
      accessibilityLabel={testID}
      onLayout={(event) => {
        onWidthChange(event.nativeEvent.layout.width);
      }}
    >
      <XStack
        height="100%"
        justifyContent="center"
        alignItems="center"
        gap="$1.5"
        paddingHorizontal="$2"
      >
        <MaterialIcons name={icon} size={16} color={active ? accentColor : inactiveIconColor} />
        {showLabel && (
          <Text
            flexShrink={1}
            numberOfLines={1}
            fontSize={13}
            fontWeight="700"
            color={inactiveTextColor}
          >
            {label}
          </Text>
        )}
      </XStack>
      {hasError && (
        <MaterialIcons
          name="error-outline"
          size={14}
          color={errorColor}
          style={{ position: 'absolute', top: 4, right: 4 }}
          testID={`${testID}-error-indicator`}
          accessibilityLabel={`${testID}-error-indicator`}
        />
      )}
    </Pressable>
  );
}

export function CompactBooleanToggle({
  value,
  onChange,
  accentColor,
  errorColor,
  activeBackgroundColor,
  inactiveIconColor,
  inactiveTextColor,
  falseLabel,
  trueLabel,
  falseIcon,
  trueIcon,
  falseTestID,
  trueTestID,
  falseHasError = false,
  trueHasError = false,
  showActiveLabel = false,
  equalSegmentWidths = false,
}: CompactBooleanToggleProps) {
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);
  const thumbTranslateX = useSharedValue(0);
  const thumbWidth = useSharedValue(0);

  useEffect(() => {
    if (leftWidth === 0 || rightWidth === 0) {
      return;
    }

    const nextWidth = value ? rightWidth : leftWidth;
    const nextTranslateX = value ? leftWidth + TOGGLE_SEGMENT_GAP : 0;

    thumbWidth.value = withTiming(nextWidth, { duration: 180 });
    thumbTranslateX.value = withTiming(nextTranslateX, { duration: 180 });
  }, [leftWidth, rightWidth, thumbTranslateX, thumbWidth, value]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    if (thumbWidth.value === 0) {
      return { opacity: 0 };
    }

    return {
      opacity: 1,
      width: thumbWidth.value,
      transform: [{ translateX: thumbTranslateX.value }],
    };
  });

  const leftActive = !value;
  const rightActive = value;

  return (
    <View
      flex={1}
      flexBasis={0}
      height={COMPACT_TOGGLE_HEIGHT}
      minWidth={0}
      position="relative"
      padding="$1"
      borderRadius="$10"
      backgroundColor="$color2"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: 2,
            top: 2,
            bottom: 2,
            borderRadius: 999,
            backgroundColor: activeBackgroundColor,
            borderWidth: 1,
            borderColor: accentColor,
          },
          animatedThumbStyle,
        ]}
      />
      <XStack height="100%" gap={TOGGLE_SEGMENT_GAP}>
        <CompactToggleSegment
          active={leftActive}
          showLabel={!leftActive || showActiveLabel}
          label={falseLabel}
          icon={falseIcon}
          accentColor={accentColor}
          errorColor={errorColor}
          inactiveIconColor={inactiveIconColor}
          inactiveTextColor={inactiveTextColor}
          testID={falseTestID}
          hasError={falseHasError}
          showActiveLabel={showActiveLabel}
          equalSegmentWidths={equalSegmentWidths}
          onPress={() => onChange(false)}
          onWidthChange={setLeftWidth}
        />
        <CompactToggleSegment
          active={rightActive}
          showLabel={!rightActive || showActiveLabel}
          label={trueLabel}
          icon={trueIcon}
          accentColor={accentColor}
          errorColor={errorColor}
          inactiveIconColor={inactiveIconColor}
          inactiveTextColor={inactiveTextColor}
          testID={trueTestID}
          hasError={trueHasError}
          showActiveLabel={showActiveLabel}
          equalSegmentWidths={equalSegmentWidths}
          onPress={() => onChange(true)}
          onWidthChange={setRightWidth}
        />
      </XStack>
    </View>
  );
}
