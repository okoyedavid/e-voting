import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "E-voting",
  title: { default: "E-voting — Online Electronic Voting", template: "%s · E-voting" },
  description: "Create beautiful paid voting events, collect verified votes and see winners live.",
  openGraph: {
    type: "website",
    siteName: "E-voting",
    title: "E-voting — Online Electronic Voting and Election Management System",
    description: "Create voting events, securely cast paid votes online, monitor live results and determine winners electronically.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
