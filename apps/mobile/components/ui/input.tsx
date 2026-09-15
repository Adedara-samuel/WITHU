import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="#6B5D63"
      className={cn("h-12 rounded-xl border border-border bg-background px-4 text-base text-foreground", className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      multiline
      placeholderTextColor="#6B5D63"
      textAlignVertical="top"
      className={cn("min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground", className)}
      {...props}
    />
  );
}
