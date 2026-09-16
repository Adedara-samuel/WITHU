import { useState } from "react";
import { Link, router } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { loginSchema } from "@withu/validation";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api-client";

export default function LoginScreen() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    try {
      await login.mutateAsync(parsed.data);
      router.replace("/");
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

        <Text className="mb-1 font-display text-2xl text-foreground">Welcome back</Text>
        <Text className="mb-6 text-sm text-muted-foreground">Your space is right where you left it.</Text>

        <View className="gap-4">
          <Input placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <PasswordInput placeholder="Password" value={password} onChangeText={setPassword} />
          {error && <Text className="text-sm text-destructive">{error}</Text>}
          <Button size="lg" onPress={onSubmit} loading={login.isPending}>
            Sign in
          </Button>
        </View>

        <View className="mt-6 flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">New here?</Text>
          <Link href="/register">
            <Text className="text-sm font-sans-medium text-primary">Create your space</Text>
          </Link>
        </View>

        <View className="mt-8 rounded-xl border border-dashed border-border p-3">
          <Text className="text-xs text-muted-foreground">
            Demo accounts (after running the seed script): samuel@withu.app / eniobanke@withu.app — password123
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
