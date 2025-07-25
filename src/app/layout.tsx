import { Inter } from "next/font/google";
import { defaultMetadata as metadata } from "@/lib/metadata";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
