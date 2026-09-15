import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/cn";

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

export function Button({
  variant = "default",
  size = "default",
  className,
  textClassName,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === "outline" || variant === "ghost" ? "#7A2C4C" : "#fff"} />}
      {typeof children === "string" ? (
        <Text className={cn("text-sm font-sans-medium", TEXT_CLASSES[variant], textClassName)}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
