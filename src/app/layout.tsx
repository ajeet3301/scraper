import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Universal Scraper API Builder", template: "%s | Scraper" },
  description: "Turn any website into a REST API — no code needed.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <QueryProvider>
              {children}
              <Toaster richColors position="bottom-right" closeButton />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
