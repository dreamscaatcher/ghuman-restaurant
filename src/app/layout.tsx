import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "../components/layout/AppShell";
import { ThemeRegistry } from "../components/providers/ThemeRegistry";
import { CartProvider } from "../components/providers/CartProvider";
import { RoleProvider } from "../components/providers/RoleProvider";
import { AuthSessionProvider } from "../components/providers/AuthSessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghuman Restaurant Platform",
  description:
    "Unified restaurant experience for guests, managers, and kitchen staff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthSessionProvider>
          <RoleProvider>
            <CartProvider>
              <ThemeRegistry>
                <AppShell>{children}</AppShell>
              </ThemeRegistry>
            </CartProvider>
          </RoleProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
