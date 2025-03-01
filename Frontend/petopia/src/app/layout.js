import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Petopia",
  description: "Meow meow meow",
  icons: "/background/dog.svg",
};

import { Inter } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { size } from "lodash";

const inter = Inter({ subsets: ['latin'] });
import { GOOGLE_CLIENT_ID } from "../../env-config";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
        >
          <CartProvider>
            {children}
          </CartProvider>
        </body>
      </GoogleOAuthProvider>
    </html>
  );
}