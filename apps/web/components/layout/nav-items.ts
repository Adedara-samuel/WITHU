import { Gamepad2, Heart, MessageCircle, Sparkles, Image as ImageIcon } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/space", label: "Our Space", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/together", label: "Together", icon: Sparkles },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/memories", label: "Memories", icon: ImageIcon },
] as const;
