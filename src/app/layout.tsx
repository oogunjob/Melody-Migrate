import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Melody Migrate",
    description: "Transfer and sync songs from one platform to another for FREE!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <script async src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
