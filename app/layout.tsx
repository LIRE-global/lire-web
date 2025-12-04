import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIRE Network - Lithium Recycling Global",
  description: "Building the Global On-Chain Infrastructure for Lithium Battery Circular Economy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
