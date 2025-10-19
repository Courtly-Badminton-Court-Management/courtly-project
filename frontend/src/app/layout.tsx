// src/app/layout.tsx
import "./globals.css";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import AuthBootstrap from "@/ui/providers/AuthBootstrap";
import type { Metadata } from "next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Courtly — Badminton Court Booking",
  description: "Book badminton courts easily with CL Coins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
       <head>
        <link rel="icon" href="/brand/icon2.png/" type="image/x-icon" />
      </head>

      <body className="min-h-dvh bg-cream text-onyx font-sans">
        <Providers>
          <AuthBootstrap />
          {children}
        </Providers>
      </body>
    </html>
  );
}
