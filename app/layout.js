import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://7fitsi-production.up.railway.app'),
  title: "7cero Sports | Indumentaria Deportiva Premium",
  description: "Tienda online de indumentaria deportiva. Rendimiento, calidad y estilo para tus entrenamientos. Compra directo por WhatsApp.",
  openGraph: {
    title: '7cero Sports | Indumentaria Deportiva',
    description: 'Tienda online de indumentaria deportiva premium. Compra directo por WhatsApp.',
    url: 'https://7fitsi-production.up.railway.app',
    siteName: '7cero Sports',
    images: [
      {
        url: '/images/sports_store_bg.png',
        width: 1200,
        height: 630,
        alt: '7cero Sports',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
