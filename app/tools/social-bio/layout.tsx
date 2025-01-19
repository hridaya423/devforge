import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Social Bio | DevForge',
    description: 'Give all your social media in a instant!',
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
