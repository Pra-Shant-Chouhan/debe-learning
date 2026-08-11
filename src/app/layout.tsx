import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Debe Learning — Parent & Student Portal",
  description: "Manage upcoming tutoring sessions and schedule requests.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full light">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900 antialiased selection:bg-orange-500 selection:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
