import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VTH - Vanguard Management",
  description: "Faction tracking system for Torn City",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#0D0D0D] text-[#E0E0E0] min-h-screen flex flex-col`}
      >
        {/* Navbar - Glassmorphism Effect */}
        <header className="sticky top-0 z-50 bg-[#0d0d0d]/70 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/sign.png"
                alt="VTH Vanguard Logo"
                width={60}
                height={60}
                style={{ width: "auto", height: "auto" }}
                className="object-contain drop-shadow-md"
              />
              <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFF8DC]">
                VTH VANGUARD
              </h1>
            </div>
            <nav className="hidden md:flex gap-6">
              <span className="text-[#D4AF37] font-semibold border-b-2 border-[#D4AF37] pb-1 cursor-pointer">
                Member Tracking
              </span>
              <span className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                Member Ranking
              </span>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
