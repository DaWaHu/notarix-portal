import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notarix",
  description: "Notarix notary workflow portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}