import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#63746E"
      className={cn("h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground", className)}
      {...props}
    />
  );
}

export function PasswordInput({ className, ...props }: Omit<TextInputProps, "secureTextEntry"> & { className?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View className="relative justify-center">
      <TextInput
        placeholderTextColor="#63746E"
        secureTextEntry={!visible}
        className={cn("h-12 rounded-xl border border-border bg-background px-4 pr-12 text-base text-foreground", className)}
        {...props}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        hitSlop={10}
        className="absolute right-1 h-10 w-10 items-center justify-center"
      >
        {visible ? <EyeOff size={18} color="#63746E" /> : <Eye size={18} color="#63746E" />}
      </Pressable>
    </View>
  );
}

export function Textarea({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      multiline
      placeholderTextColor="#63746E"
      textAlignVertical="top"
      className={cn("min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground", className)}
      {...props}
    />
  );
}
