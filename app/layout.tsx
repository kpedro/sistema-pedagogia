import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import Providers from "@/components/providers";

const noto = Noto_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MVP Pedagogia",
  description: "Sistema multi-escola (Educação Básica/AM) - MVP funcional",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={noto.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
