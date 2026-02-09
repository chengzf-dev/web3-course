import "./globals.css";
import type { Metadata } from "next";
import WagmiAppProvider from "../components/wagmi-provider";

export const metadata: Metadata = {
  title: "Web3 University",
  description: "Web3 University - learn and earn with YD tokens"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiAppProvider>
          <div className="min-h-screen bg-background-dark text-white">
            {children}
          </div>
        </WagmiAppProvider>
      </body>
    </html>
  );
}
