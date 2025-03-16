import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "端数合わせ作業日報",
  description: "製造現場向けの端数合わせ作業日報アプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 p-4 shadow-md">
            <h1 className="text-white text-xl font-bold text-center">
              端数合わせ作業日報
            </h1>
          </header>
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </body>
    </html>
  );
}
