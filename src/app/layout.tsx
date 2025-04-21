import "./globals.css";
import Navbar from "../components/Navbar";
import { Geist } from "next/font/google";
import { AuthProvider } from "./providers/AuthProvider";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ODX Perícias",
  description: "A solução ideal para laudos rápidos e confiáveis",
  themeColor: "#5ed8b1",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      {
        url: "/AppImages/android/android-launchericon-192-192.png",
        type: "image/png",
      },
    ],
    apple: "/AppImages/ios/180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className={`${geistSans.variable} antialiased bg-gray-100`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-28 px-4 max-w-6xl mx-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
