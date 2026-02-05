import Link from "next/link";
import WalletConnect from "./wallet-connect";

const links = [
  { href: "/", label: "Courses" },
  { href: "/exchange", label: "Exchange" },
  { href: "/author/dashboard", label: "Author" },
  { href: "/admin", label: "Admin" }
];

export default function SiteHeader() {
  return (
    <header className="border-b border-border-dark bg-background-dark/90 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-4">
        <Link className="text-lg font-bold" href="/">
          Web3 University
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} className="text-sm text-text-muted hover:text-white" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <WalletConnect />
      </div>
    </header>
  );
}
