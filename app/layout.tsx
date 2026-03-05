import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Notary Portal",
  description: "Secure document management for professional notaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <main className="min-h-screen flex justify-center">
          <div className="w-full max-w-7xl p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
