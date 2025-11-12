import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cove - AI-Powered Housing for Interns & Young Professionals",
  description: "Find your perfect sublet and roommate match with AI. Safe, stress-free, and social housing for college interns and young professionals in major U.S. cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
