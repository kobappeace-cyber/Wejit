import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wejit — Votre boutique, partout avec vous",
  description: "Créez et gérez votre boutique avec Wejit.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
