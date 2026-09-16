import { ActivityIndicator, Pressable, Text, type GestureResponderEvent, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/cn";

// react-native-reanimated's Animatable typings lag behind the React types this
// project uses, so createAnimatedComponent needs a loose cast here.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable as any);

type Variant = "default" | "secondary" | "outline" | "ghost" | "ember" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

const VARIANT_CLASSES: Record<Variant, string> = {
  default: "bg-primary",
  secondary: "bg-secondary",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  ember: "bg-ember",
  destructive: "bg-destructive",
};

const TEXT_CLASSES: Record<Variant, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  ember: "text-ember-foreground",
  destructive: "text-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  default: "h-11 px-5",
  sm: "h-9 px-4",
  lg: "h-14 px-7",
  icon: "h-11 w-11",
};

interface ButtonProps extends PressableProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  children: React.ReactNode;
}

// A bouncy spring-back scale plus a light haptic tick on every press is the single
// highest-leverage way to make the whole app feel alive, since almost every action
// goes through here - this is the "it just feels good to tap" quality of apps like
// Instagram/TikTok, not just a visual nicety.
export function Button({
  variant = "default",
  size = "default",
  className,
  textClassName,
  loading,
  disabled,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPressIn={(e: GestureResponderEvent) => {
        scale.value = withSpring(0.9, { stiffness: 600, damping: 15 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        scale.value = withSpring(1, { stiffness: 300, damping: 8 });
        onPressOut?.(e);
      }}
      style={animatedStyle}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === "outline" || variant === "ghost" ? "#276852" : "#fff"} />}
      {typeof children === "string" ? (
        <Text className={cn("text-sm font-sans-medium", TEXT_CLASSES[variant], textClassName)}>{children}</Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
