import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./component/provider";
import Header from "./component/Header";
import ConditionalHeader from "./component/ConditionalHeader";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "LCM Dashboard",
    description: "AI-powered WhatsApp lead management platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <ConditionalHeader />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
