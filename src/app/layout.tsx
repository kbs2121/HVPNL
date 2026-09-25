import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import { criticalCss } from "./critical.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "HSETCL Grid SMS — Digital Twin & Monitoring",
  description:
    "Enterprise GIS digital twin and monitoring platform for Haryana State Electricity Transmission Corporation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${rajdhani.variable} h-full`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </head>
      <body className="h-full overflow-hidden bg-surface-900 font-sans text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
