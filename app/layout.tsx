import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        {/* Navbar - Mobile Responsive & Fixed Image Size */}
        <header className="sticky top-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            {/* Logo and Title Container */}
            <div className="flex items-center gap-3 w-full justify-center md:justify-start md:w-auto">
              <div className="flex items-center justify-center h-12 md:h-14 shrink-0">
                <img
                  src="/sign.png"
                  alt="VTH Vanguard Logo"
                  className="max-h-full max-w-[150px] md:max-w-[200px] object-contain drop-shadow-md"
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFF8DC] whitespace-nowrap">
                VTH VANGUARD
              </h1>
            </div>

            {/* Navigation (Centered on mobile) */}
            <nav className="flex gap-4 md:gap-6 text-sm md:text-base w-full justify-center md:justify-end md:w-auto">
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
