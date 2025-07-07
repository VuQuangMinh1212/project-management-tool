import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppInitializer } from "@/components/AppInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow - Project Management",
  description: "Internal project and task management tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppInitializer />
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
