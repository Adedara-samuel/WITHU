import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.5), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--ember) / 0.45), transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-2">
          <Image src="/logo.png" alt="WITHU" width={40} height={40} className="rounded-xl" priority />
        </div>
        <div className="relative max-w-md space-y-3">
          <p className="font-display text-4xl leading-tight">
            Even when we&apos;re apart, we&apos;re still together.
          </p>
          <p className="text-primary-foreground/80">
            A private space for the two of you — chat, play, watch, and hold onto every moment, no matter the
            distance.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          Built for two. Yours, always.
        </p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
