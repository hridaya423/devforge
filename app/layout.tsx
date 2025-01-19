import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevForge",
  description: "Craft exceptional developer experiences with our premium toolset",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
