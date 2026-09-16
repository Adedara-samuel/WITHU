import { useState } from "react";
import { Link, router } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { registerSchema } from "@withu/validation";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { useRegister } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api-client";

export default function RegisterScreen() {
  const register = useRegister();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    setError(null);
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    try {
      await register.mutateAsync(parsed.data);
      router.replace("/onboarding/couple");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-8 items-center gap-2">
          <Image source={require("../../assets/icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        </View>

        <Text className="mb-1 font-display text-2xl text-foreground">Create your space</Text>
        <Text className="mb-6 text-sm text-muted-foreground">A private place for the two of you starts here.</Text>

        <View className="gap-4">
          <Input placeholder="Your name" value={form.name} onChangeText={set("name")} />
          <Input placeholder="Username" autoCapitalize="none" value={form.username} onChangeText={set("username")} />
          <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set("email")} />
          <PasswordInput placeholder="Password (min 8 characters)" value={form.password} onChangeText={set("password")} />
          {error && <Text className="text-sm text-destructive">{error}</Text>}
          <Button size="lg" onPress={onSubmit} loading={register.isPending}>
            Create account
          </Button>
        </View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Already have a space?</Text>
          <Link href="/login">
            <Text className="text-sm font-sans-medium text-primary">Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
