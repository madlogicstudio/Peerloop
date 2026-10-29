
import Image from "next/image";
import Link from "next/link";
import {
    ArrowUpRight,
    BookOpen,
    Compass,
    Heart,
  Users,
} from "lucide-react";

const footerLinks = {
    discover: [
        { label: "Explore skills", href: "/explore" },
        { label: "Communities", href: "/communities" },
        { label: "How it works", href: "/how-it-works" },
    ],
    account: [
        { label: "Create an account", href: "/signup" },
        { label: "Log in", href: "/login" },
    ],
};

export default function Footer() {
    return (
        <footer className="max-w-[1280px] w-full mt-6">
            <div className="overflow-hidden sm:rounded-xl border border-foreground/10 bg-[var(--card)]">
                {/* Main footer */}
                <div className="grid gap-10 px-6 py-10 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:gap-12 lg:px-12 lg:py-14">
                    {/* Brand */}
                    <div className="max-w-sm">
                        <Link
                        href="/"
                        aria-label="Peerloop homepage"
                        className="inline-flex items-center gap-3"
                        >
                        <Image
                            src="/Web-icon.png"
                            alt="Peerloop logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain"
                        />
                        <span className="text-2xl font-bold tracking-tight">
                            Peerloop
                        </span>
                        </Link>

                        <p className="mt-5 text-md leading-7 text-[var(--muted-foreground)]">
                            A community where everyone has something to teach and
                            something to learn.
                        </p>

                        <div className="mt-6 inline-flex items-center px-3 py-2">
                            <span className="text-md font-medium">
                                A community-driven skill-sharing platform
                            </span>
                        </div>
                    </div>

                    {/* Discover */}
                    <div>
                        <h2 className="text-lg font-bold">Discover</h2>
                        <ul className="mt-5 space-y-4">
                        {footerLinks.discover.map((link) => (
                            <li key={link.label}>
                            <Link
                                href={link.href}
                                className="inline-flex items-center gap-1 text-md text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                            >
                                {link.label}
                                <ArrowUpRight
                                size={13}
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                                />
                            </Link>
                            </li>
                        ))}
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h2 className="text-lg font-bold">Your account</h2>
                        <ul className="mt-5 space-y-4">
                        {footerLinks.account.map((link) => (
                            <li key={link.label}>
                            <Link
                                href={link.href}
                                className="text-md text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                            >
                                {link.label}
                            </Link>
                            </li>
                        ))}
                        </ul>
                    </div>             
                </div>

                {/* Bottom bar */}
                <div className="mx-6 border-t border-foreground/10 sm:mx-8 lg:mx-12" />

                <div className="flex flex-col gap-4 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
                    <p className="text-sm text-[var(--muted-foreground)]">
                        © {new Date().getFullYear()} Peerloop. All rights reserved.
                    </p>

                    <p className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        Made for curious minds
                        <Heart size={14} className="fill-[var(--primary)] text-[var(--primary)]" />
                    </p>
                </div>
            </div>
        </footer>
    );
}
