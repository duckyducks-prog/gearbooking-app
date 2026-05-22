import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { BookingDraftProvider } from "@/lib/booking-draft-context";
import { Header } from "@/components/header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Studio Gear",
  description: "Equipment booking for the video team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <UserProvider>
          <BookingDraftProvider>
            <Header />
            <main className="max-w-7xl mx-auto px-6 py-10 relative z-1">
              {children}
            </main>
          </BookingDraftProvider>
        </UserProvider>
      </body>
    </html>
  );
}
