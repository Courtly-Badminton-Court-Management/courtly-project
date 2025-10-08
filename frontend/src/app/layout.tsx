// src/app/layout.tsx
import "./globals.css";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import AuthBootstrap from "@/ui/providers/AuthBootstrap";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = { title: "Courtly" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-dvh bg-courtBg text-onyx font-sans">
        <Providers>
          <AuthBootstrap />
          {children}
        </Providers>
      </body>
    </html>
  );
}
