import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoadRescue — Technician Portal",
  description: "Manage your availability, view assigned rescue jobs, and update job status in real time.",
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
      </head>
      <body>{children}</body>
    </html>
  );
}
