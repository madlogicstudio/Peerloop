"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    UserRound,
    Settings,
    LogOut,
    Compass,
    Users,
    Bookmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    full_name: string | null;
    avatar_url: string | null;
};

export default function Header() {
    const [navOpen, setNavOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [fullName, setFullName] = useState("User");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [initials, setInitials] = useState("U");
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        let active = true;

        async function loadProfile() {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (!active) return;

            if (error || !user) {
                router.replace("/login");
                return;
            }

            setEmail(user.email ?? "");

            const metadataName =
                user.user_metadata?.full_name ??
                user.user_metadata?.name ??
                user.email?.split("@")[0] ??
                "User";

            const metadataAvatar =
                user.user_metadata?.avatar_url ??
                user.user_metadata?.picture ??
                null;

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", user.id)
                .maybeSingle<Profile>();

            if (!active) return;

            const name = profile?.full_name || metadataName;
            const avatar = profile?.avatar_url || metadataAvatar;

            setFullName(name);
            setAvatarUrl(avatar);

            const nameParts = name.trim().split(/\s+/).filter(Boolean);
            const userInitials =
                nameParts.length > 1
                    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                    : nameParts[0]?.slice(0, 2) || "U";

            setInitials(userInitials.toUpperCase());
            setLoading(false);
        }

        loadProfile();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) {
                router.replace("/login");
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            const target = event.target as Node;

            if (
                profileRef.current &&
                !profileRef.current.contains(target)
            ) {
                setProfileOpen(false);
            }

            if (
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
                setNavOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setNavOpen(false);
                setProfileOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const closeMobileMenu = () => setNavOpen(false);

    async function handleSignOut() {
        setSigningOut(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Failed to sign out:", error.message);
            setSigningOut(false);
            return;
        }

        router.replace("/login");
        router.refresh();
    }

    function handleSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const query = searchQuery.trim();
        if (!query) return;

        router.push(`/explore?q=${encodeURIComponent(query)}`);
        setSearchQuery("");
        setNavOpen(false);
    }

    return (
        <header className="sticky top-0 z-50 w-full flex flex-col items-center border-b border-foreground/10 bg-[var(--background)]/95 backdrop-blur-xl">
            <div className=" flex w-full max-w-[1280px] w-full items-center gap-4 sm:px-4 px-2 sm:py-3 py-2">
                {/* Logo */}
                <Link
                    href="/feed"
                    className="flex shrink-0 items-center gap-2.5"
                    aria-label="Peerloop home"
                >
                    <Image
                        src="/Web-icon.png"
                        height={38}
                        width={38}
                        alt="Peerloop"
                        className="sm:h-8 sm:w-8 h-8 w-8"
                        priority
                    />

                    <span className="font-semibold sm:text-[1.5rem] text-[1.2rem] hovered">
                        Peerloop
                    </span>
                </Link>

                <form
                    onSubmit={handleSearch}
                    className="ml-auto hidden w-full max-w-md md:flex"
                    role="search"
                >
                    <div className="flex w-full items-center gap-2 px-3 rounded-xl border border-foreground/10 bg-[var(--card)] transition focus-within:border-[var(--primary)]">
                        <Search
                            size={18}
                            className="shrink-0 text-[var(--muted-foreground)]"
                        />

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search skills, posts, communities..."
                            aria-label="Search Peerloop"
                            className="w-full bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-[var(--muted-foreground)]"
                        />

                        <button
                            type="submit"
                            className="sr-only"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Right-side actions */}
                <div className="ml-auto flex shrink-0 items-center sm:gap-3 md:ml-0">
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>

                    <Link
                        href="/notifications"
                        aria-label="Notifications"
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
                    >
                        <Bell size={20} />
                    </Link>

                    {/* Profile dropdown */}
                    <div ref={profileRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setProfileOpen((open) => !open)}
                            aria-label="Open profile menu"
                            aria-expanded={profileOpen}
                            className="cursor-pointer sm:flex hidden items-center gap-2 rounded-xl p-1.5 transition hover:bg-foreground/5"
                        >
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
                                {!loading && avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={fullName}
                                        width={36}
                                        height={36}
                                        unoptimized
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>

                            <ChevronDown
                                size={16}
                                className={`hidden text-foreground/60 transition-transform sm:block ${
                                    profileOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--card)] p-2 shadow-xl">
                                <div className="border-b border-foreground/10 px-3 py-3">
                                    <p className="truncate text-md font-semibold text-foreground">
                                        {loading ? "Loading profile..." : fullName}
                                    </p>

                                    <p className="mt-1 truncate text-md text-[var(--muted-foreground)]">
                                        {email}
                                    </p>
                                </div>

                                <div className="py-2">
                                    <Link
                                        href="/profile"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-md text-foreground/80 transition hover:bg-foreground/5"
                                    >
                                        <UserRound size={18} />
                                        My Profile
                                    </Link>

                                    <Link
                                        href="/saved"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-md text-foreground/80 transition hover:bg-foreground/5"
                                    >
                                        <Bookmark size={18} />
                                        Saved Posts
                                    </Link>

                                    <Link
                                        href="/settings"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-md text-foreground/80 transition hover:bg-foreground/5"
                                    >
                                        <Settings size={18} />
                                        Settings
                                    </Link>
                                </div>

                                <div className="border-t border-foreground/10 pt-2 pl-1">
                                    <button
                                        type="button"
                                        onClick={handleSignOut}
                                        disabled={signingOut}
                                        className="cursor-pointer flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-md text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        <LogOut size={18} />
                                        {signingOut ? "Signing out..." : "Sign out"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        type="button"
                        onClick={() => setNavOpen((open) => !open)}
                        aria-label={navOpen ? "Close navigation" : "Open navigation"}
                        aria-expanded={navOpen}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition hover:bg-foreground/5 lg:hidden"
                    >
                        {navOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile navigation */}
            {navOpen && (
                <div
                    ref={menuRef}
                    className="border-t border-foreground/10 bg-[var(--background)] px-4 pb-5 pt-4 lg:hidden w-full"
                >
                    <form onSubmit={handleSearch} className="mb-4 md:hidden h-full w-full">
                        <div className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-[var(--card)] px-3.5">
                            <Search
                                size={18}
                                className="text-[var(--muted-foreground)]"
                            />

                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search Peerloop..."
                                aria-label="Search Peerloop"
                                className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-[var(--muted-foreground)]"
                            />
                        </div>
                    </form>

                    <nav className="flex flex-col gap-1">

                        <Link
                            href="/profile"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 transition hover:bg-foreground/5"
                        >
                            <UserRound size={19} />
                            My Profile
                        </Link>

                        <Link
                            href="/saved"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 transition hover:bg-foreground/5"
                        >
                            <Bookmark size={19} />
                            Saved Posts
                        </Link>

                        <Link
                            href="/settings"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 transition hover:bg-foreground/5"
                        >
                            <Settings size={19} />
                            Settings
                        </Link>

                        <div className="my-3 border-t border-foreground/10" />

                        <div className="mt-auto flex items-center justify-between px-3 py-2">
                            <span className="text-sm text-[var(--muted-foreground)]">
                                Appearance
                            </span>
                            <ThemeToggle />
                        </div>

                        <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                            <LogOut size={18} />
                            {signingOut ? "Signing out..." : "Sign out"}
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
