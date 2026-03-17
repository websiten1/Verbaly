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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#F8F9FC', color: '#4A5568', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
