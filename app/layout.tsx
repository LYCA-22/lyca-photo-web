import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "LYCA Photo",
  description: "林園高中班聯會雲端相簿系統 by lyps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="z-40 sticky top-0 bg-white/80 backdrop-blur-md p-3 px-5 font-bold text-xl">
          LYCA Photo
        </header>
        {children}
      </body>
    </html>
  );
}
