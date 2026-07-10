import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notarix Signings Portal",
  description:
    "A security-first notarial transaction platform for orders, documents, assignments, and remote online notarization.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
