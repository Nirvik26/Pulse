import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pulse — High-Velocity Engineering Workspace & AI Copilot",
  description:
    "An AI-powered project intelligence platform with interactive Kanban boards, ⌘K spotlight palette, Pomodoro deep work timers, and sprint velocity analytics.",
  keywords: [
    "Project Management",
    "Kanban",
    "Next.js 14",
    "TypeScript",
    "AI Copilot",
    "SaaS",
    "Productivity",
    "Prisma",
  ],
  authors: [{ name: "Nirvik" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
