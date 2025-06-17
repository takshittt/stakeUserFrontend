import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "@/app/thirdweb";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MindWave DAO - Staking Platform",
  description: "A new way to build a better future together through staking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <React.StrictMode>
          <ThirdwebProvider>
            <div className="main-container">{children}</div>
          </ThirdwebProvider>
        </React.StrictMode>
      </body>
    </html>
  );
}
