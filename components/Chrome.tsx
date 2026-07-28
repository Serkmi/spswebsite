import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/writing", label: "Writing" },
  { href: "/building", label: "Building" },
  { href: "/marginalia", label: "Marginalia" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rule py-4">
      <Link href="/" className="lbl lbl-ink">
        Sean P. Stewart
      </Link>
      <nav className="flex items-center gap-5">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="lbl lbl-nav">
            {n.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer
      className="mt-24 mb-16 flex flex-wrap items-baseline justify-between gap-6
                 border-t border-rule-strong pt-6"
    >
      <span className="lbl">seanpstewart.com</span>
      <span className="lbl">
        © {new Date().getFullYear()} — built in the open
      </span>
    </footer>
  );
}
