"use client";

import Head from "next/head";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Geist } from "next/font/google";
import { AuthProvider } from "./providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <Head>
        <title>ODX Perícias</title>
        <meta
          name="description"
          content="A solução ideal para laudos rápidos e confiáveis"
        />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* favicon original */}
        <link rel="icon" href="/logo.png" />

        {/* ícone PWA Android */}
        <link
          rel="icon"
          href="/AppImages/android/android-launchericon-192-192.png"
        />

        {/* manifesto para PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* ícone touch para iOS */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/AppImages/ios/180.png"
        />

        {/* cor da barra de status no Android */}
        <meta name="theme-color" content="#5ed8b1" />

        {/* habilita modo standalone no iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* estilo da status bar no iOS: black-translucent, black ou default */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </Head>
      <body className={`${geistSans.variable} antialiased bg-gray-100`}>
        <AuthProvider>
          <Navbar />
          <main className="pt-28 px-4 max-w-6xl mx-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
