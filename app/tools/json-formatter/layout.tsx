import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'JSON Toolkit | DevForge',
    description: 'Format, validate, and beautify your JSON data with ease',
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
