import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verbaly - Write like yourself. Every single time.",
  description: "AI-powered writing that learns your unique style and rewrites any AI-generated text to sound authentically like you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#FCFCFC', color: '#0F172A', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
