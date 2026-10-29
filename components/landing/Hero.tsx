import Link from "next/link";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Check,
    Compass,
    Lightbulb,
    Sparkles,
    Users,
    Asterisk
} from "lucide-react";

const skillExchanges = [
    {
        title: "UI Design",
        type: "Teach",
        initials: "JD",
        avatar: "bg-[#F0491D]",
    },
    {
        title: "JavaScript Basics",
        type: "Learn",
        initials: "AM",
        avatar: "bg-[#242424]",
    },
];

export default function Hero() {
    return (
        <section className="font-sans grid mt-12 rounded-xl max-w-[1280px] w-full items-center gap-12 overflow-hidden pb-16 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:px-12 lg:pb-20 lg:pt-8">
        {/* Hero content */}
            <div className="relative z-10 w-full sm;px-0 px-3">

                <h1 className="w-full sm:text-7xl text-6xl font-bold leading-[1.04] tracking-[-0.055em]">
                    Knowledge
                <br />
                    Flows
                <br />
                <span className="relative mt-1 inline-block text-[var(--primary)]">
                    Both Ways.
                    <svg
                    viewBox="0 0 500 16"
                    fill="none"
                    aria-hidden="true"
                    className="absolute -bottom-2 left-0 w-full"
                    >
                    <path
                        d="M4 10C116 2 333 2 496 8"
                        stroke="#FFE829"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    </svg>
                </span>
                </h1>

                <p className="mt-8 max-w-lg text-base leading-7 text-[var(--muted-foreground)] sm:text-lg sm:leading-8">
                    Share what you know, discover what others know, and grow
                    together—one skill at a time.
                </p>

                {/* CTA buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    href="/explore"
                    className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[var(--primary)] px-6 py-3 font-semi-bold rounded-xl text-white hover:bg-[#242424] transition"
                >
                    Start learning
                    <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                    />
                </Link>

                <Link
                    href="/communities"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-[var(--card)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--primary)]/10"
                >
                    Explore communities
                </Link>
                </div>

                {/* Community preview */}
                <div className="mt-10 flex items-center gap-3">
                    <Asterisk size={24} className="text-[var(--primary)]"/>
                    <p className="text-md leading-6 text-[var(--muted-foreground)]">
                        A growing community of curious learners
                    </p>
                </div>
            </div>

            {/* Hero illustration */}
            <div className="relative mx-auto flex min-h-[430px] w-full max-w-[620px] items-center justify-center sm:min-h-[540px] lg:min-h-[610px]">
                {/* Decorative shapes */}
                <div className="absolute left-[15%] top-[15%] h-20 w-20 rounded-full bg-[#FFE829] sm:h-24 sm:w-24" />

                <div className="absolute right-[10%] top-[9%] h-12 w-12 rounded-full bg-[var(--primary)] sm:h-16 sm:w-16" />

                <div className="absolute left-[9%] top-[22%] h-[310px] w-[310px] rounded-full bg-[var(--primary)] sm:h-[390px] sm:w-[390px]" />

                <div className="absolute bottom-[6%] right-[9%] h-32 w-32 rounded-full bg-[#242424] sm:h-44 sm:w-44" />

                {/* Skill exchange card */}
                <div className="absolute left-[6%] top-[19%] z-10 w-[78%] max-w-[420px] -rotate-[3deg] rounded-[28px] border border-foreground/10 bg-[var(--card)] p-5 shadow-2xl shadow-black/10 sm:p-7">
                    <div className="mb-5 flex items-center justify-between gap-2">
                        <h2 className="text-lg font-bold tracking-tight sm:text-2xl">
                            Today&apos;s skill exchange
                        </h2>
                        <span className="rounded-full bg-[#FFE829] p-2 text-[#242424]">
                            <Lightbulb size={18} />
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {skillExchanges.map((skill) => (
                        <Link
                            href="/explore"
                            key={skill.title}
                            className="group flex items-center gap-3 rounded-2xl border border-foreground/10 bg-[var(--background)] p-3 transition-all hover:-translate-y-0.5 hover:border-[var(--primary)]/50 sm:gap-4 sm:p-4"
                        >
                            <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white sm:h-14 sm:w-14 ${skill.avatar}`}
                            >
                            {skill.initials}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold sm:text-base">
                                    {skill.title}
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                    skill.type === "Teach"
                                        ? "bg-[#F0491D]/15 text-[var(--primary)]"
                                        : "bg-[#FFE829] text-[#242424]"
                                    }`}
                                >
                                    {skill.type}
                                </span>
                            </div>

                            <ArrowUpRight
                            size={20}
                            className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </Link>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <Check size={16} className="text-[var(--primary)]" />
                        Everyone has something to share
                    </div>
                </div>

                {/* Share knowledge card */}
                <Link
                    href="/signup"
                    className="absolute sm:right-0 right-6 top-[12%] z-20 flex w-[38%] max-w-[200px] -rotate-[7deg] flex-col items-start rounded-[24px] bg-[#FFE829] p-4 text-[#242424] shadow-xl transition-transform hover:rotate-0 sm:p-6"
                >
                    <BookOpen size={34} strokeWidth={1.8} />

                    <p className="mt-5 text-lg font-bold leading-tight sm:text-2xl">
                        Share your knowledge
                    </p>

                    <div className="mt-4 flex w-full justify-end">
                        <ArrowUpRight size={23} />
                    </div>
                </Link>

                {/* Community card */}
                <Link
                href="/communities"
                className="absolute bottom-[11%] sm:right-0 right-4 z-20 w-[58%] max-w-[290px] rotate-[4deg] rounded-[24px] border border-foreground/10 bg-[var(--card)] p-4 shadow-xl transition-transform hover:rotate-0 sm:p-5"
                >
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3D2FA] text-[#242424]">
                        <Users size={21} />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Popular community
                        </p>
                        <p className="mt-1 truncate text-sm font-bold sm:text-base">
                            Creative Coding
                        </p>
                    </div>

                    <ArrowUpRight size={18} className="ml-auto shrink-0" />
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Users size={14} />
                    Learn, create, and collaborate
                </div>
                </Link>

                {/* Decorative accents */}
                <div className="absolute bottom-[12%] left-[3%] -rotate-12 text-[#FFE829]">
                    <ArrowDownRight size={48} strokeWidth={2.5} />
                </div>

                <div className="absolute right-[1%] top-[38%] -rotate-12 text-foreground">
                    <Sparkles size={32} />
                </div>

                <div className="absolute bottom-0 left-[18%] hidden items-center gap-2 rounded-full border border-foreground/10 bg-[var(--card)] px-4 py-2.5 text-sm font-medium shadow-sm sm:flex">
                    <Compass size={16} className="text-[var(--primary)]" />
                    Learn together. Grow together.
                </div>
            </div>
        </section>
    );
}
