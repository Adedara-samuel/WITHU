import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

type ToastVariant = "default" | "success" | "error" | "love";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ACCENT: Record<ToastVariant, string> = {
  default: "#7A2C4C",
  success: "#16A34A",
  error: "#C6402F",
  love: "#D9704A",
};

function ToastCard({ toast, onHide }: { toast: ToastItem; onHide: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(onHide);
    }, 3800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{ opacity, borderLeftColor: ACCENT[toast.variant] }}
      className="mb-2 rounded-xl border-l-4 bg-card px-4 py-3 shadow-md"
    >
      <Pressable onPress={onHide}>
        <Text className="font-sans-medium text-sm text-foreground">{toast.title}</Text>
        {toast.description && <Text className="mt-0.5 text-xs text-muted-foreground">{toast.description}</Text>}
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View pointerEvents="box-none" className="absolute bottom-24 left-4 right-4 z-50">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onHide={() => dismiss(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
