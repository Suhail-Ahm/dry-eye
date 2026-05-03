import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dry Eye Disease — EDA Dashboard",
  description:
    "Exploratory Data Analysis dashboard for the Dry Eye Disease dataset. Visualize distributions, correlations, feature importance, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}
