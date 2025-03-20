import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Head from "next/head"; // Importe o Head do Next.js
import "./globals.css";

// Definindo a fonte Geist
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ODX Perícias", // Título personalizado
  description: "A solução ideal para laudos rápidos e confiáveis", // Descrição do app
  icons: {
    icon: "/logo.png", // Caminho correto para o favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <Head>
        <link rel="icon" href="/logo.png" />{" "}
        {/* Definindo o favicon com Head */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="A solução ideal para laudos rápidos e confiáveis"
        />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
