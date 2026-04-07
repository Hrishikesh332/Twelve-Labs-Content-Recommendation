import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Reccomender",
  description: "Recommend the video content with the help of the Twelve Labs Embedding and the Qdrant Search",
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
