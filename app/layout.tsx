import type { Metadata } from "next";
import "./globals.css"; // Ensure this points to your Tailwind v4 CSS file

export const metadata: Metadata = {
  title: "HealthApp | Modern Telehealth",
  description: "Connect with doctors and manage your medical records online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}