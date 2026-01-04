import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WhenFree - Find time to hang out with friends",
  description: "Simple scheduling app to find when everyone is free for breakfast, lunch, dinner, or all day hangouts.",
  openGraph: {
    title: "WhenFree",
    description: "Find the perfect time to hang out with friends",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
