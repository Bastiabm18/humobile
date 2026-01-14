import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Inter, Roboto_Mono, Playfair_Display, Goldman } from 'next/font/google';

import "./globals.css";
import Navbar from "./components/Nav";
import { AuthProvider } from "@/context/AuthContext";
import LayoutManager from "./components/LayoutManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

// Nueva fuente - Goldman (display, moderna)
const goldman = Goldman({
  weight: ['400', '700'], // Puedes ajustar los pesos según necesites
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-goldman',
});

export const metadata: Metadata = {
  title: "Humobile",
  description: "Humobile | Chile",
  // VIEWPORT NECESARIO PARA EVITAR EL ZOOM AUTOMATICO DE LA PAGINA EN PRODUCTIVO
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"  >

      
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${goldman.variable} font-goldman antialiased custom-scrollbar`}
        >
        <AuthProvider>
        <LayoutManager>
        <div className="-mt-16 bg-neutral-950">
        {children}
        </div>
        </LayoutManager>
    </AuthProvider>
      </body>
    </html>
  );
}
