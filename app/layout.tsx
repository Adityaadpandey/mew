import { AppProvider } from "@/lib/app-context";
import { ThemeProvider } from "@/lib/theme-provider";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eraser - Collaborative Documentation & Diagrams",
  description: "The collaborative documentation and diagramming tool for engineering teams",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark);
                  document.documentElement.classList.add(resolved ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
