import "./globals.css";
import type { Metadata } from "next";
import { WagmiProvider } from "@chengzf-dev/web3-course-ui";

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
        <WagmiProvider>
          <div className="min-h-screen bg-background-dark text-white">
            {children}
          </div>
        </WagmiProvider>
      </body>
    </html>
  );
}
