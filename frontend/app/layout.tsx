import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { PwaRegister } from "./pwa-register";

export const metadata: Metadata = {
  title: {
    default: "EV Academy · Precision training for electric mobility",
    template: "%s · EV Academy",
  },
  description:
    "Professional training in high-voltage EV systems, battery technology, power electronics and electric drive systems. Earn verifiable certificates from a specialist EV engineering academy.",
  keywords: [
    "EV training",
    "electric vehicle maintenance",
    "high-voltage safety",
    "battery diagnostics",
    "EV certification",
    "EV engineering",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EV Academy",
  },
  openGraph: {
    title: "EV Academy · Precision training for electric mobility",
    description:
      "High-voltage safety, battery diagnostics, charging, drive systems and HV wiring — taught in a working lab and certified online.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-ink text-[#F2F4F7]">
        <AuthProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
