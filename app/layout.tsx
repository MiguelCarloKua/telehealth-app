import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css"; 

export const metadata: Metadata = {
  title: "LinKod | Modern Telehealth",
  description: "Connect with doctors and manage your medical records online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning is required on the html tag for next-themes to work properly
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased min-h-screen flex flex-col transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}