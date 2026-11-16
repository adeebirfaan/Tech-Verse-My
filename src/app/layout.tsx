import type { Metadata } from "next";
import { Rethink_Sans, Shantell_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const rethink = Rethink_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rethink",
  display: "swap",
});

const shantell = Shantell_Sans({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-shantell",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Techverse MY",
  description: "Discover Malaysian-made apps and websites. A curated showcase of local builders and digital products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${rethink.variable} ${shantell.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
