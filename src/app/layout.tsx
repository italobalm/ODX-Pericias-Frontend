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
        <link rel="icon" href="/logo.png" />
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
