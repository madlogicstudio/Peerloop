"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LoaderCircle,
    Sparkles,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">(
        "error"
    );

    const supabase = createClient();

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (error) throw error;

        window.location.assign("/explore");
        } catch (error) {
        setMessage(
            error instanceof Error
            ? error.message
            : "Unable to log in. Please try again."
        );
        setMessageType("error");
        setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setMessage("");
        setGoogleLoading(true);

        try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        } catch (error) {
        setMessage(
            error instanceof Error
            ? error.message
            : "Unable to log in with Google. Please try again."
        );
        setMessageType("error");
        setGoogleLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15";

    return (
        <main className="min-h-dvh w-full bg-[var(--background)] px-4 text-[var(--foreground)]">
            <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">

                {/* Login form */}
                <div className="grid flex-1 items-center p-3">
                <section className="mx-auto w-full max-w-[440px]">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Welcome back.
                        </h1>

                        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
                            Log in to reconnect with your community and keep learning
                            together.
                        </p>
                    </div>

                    {/* Feedback */}
                    {message && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className={`mb-5 flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-5 ${
                        messageType === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                        }`}
                    >
                        {messageType === "success" ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        ) : (
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        )}
                        <p>{message}</p>
                    </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold">
                        Email address
                        </label>

                        <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={inputClass}
                        required
                        disabled={loading || googleLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold"
                        >
                            Password
                        </label>

                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-[var(--primary)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline"
                        >
                            Forgot password?
                        </Link>
                        </div>

                        <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className={`${inputClass} pr-12`}
                            required
                            disabled={loading || googleLoading}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            aria-label={
                            showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                            {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                            ) : (
                            <Eye className="h-5 w-5" />
                            )}
                        </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="cursor-pointer group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                        <>
                            <LoaderCircle className="h-5 w-5 animate-spin" />
                            Logging in...
                        </>
                        ) : (
                        <>
                            Log in
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                        )}
                    </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                        or continue with
                    </span>
                    <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>

                    {/* Google login */}
                    <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading}
                    className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-semibold transition hover:border-[var(--foreground)]/30 hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {googleLoading ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                        <svg
                        aria-hidden="true"
                        viewBox="0 0 48 48"
                        className="h-5 w-5"
                        >
                        <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.05 13.22l7.98 6.19C12.92 13.72 18.03 9.5 24 9.5Z"
                            transform="translate(0 4)"
                        />
                        <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.87 46.98 24.55Z"
                            transform="translate(0 -1)"
                        />
                        <path
                            fill="#FBBC05"
                            d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
                        />
                        <path
                            fill="#34A853"
                            d="M24 47c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-5.97 0-11.08-4.22-12.97-9.91l-7.98 6.19C6.51 41.62 14.62 47 24 47Z"
                            transform="translate(0 -1)"
                        />
                        </svg>
                    )}

                    Continue with Google
                    </button>

                    <p className="mt-7 text-center text-sm leading-6 text-[var(--muted-foreground)]">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-[var(--primary)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline"
                    >
                        Sign up
                    </Link>
                    </p>

                    <p className="mt-5 text-center text-sm leading-6 text-[var(--muted-foreground)]">
                    Knowledge flows both ways. Pick up where you left off.
                    </p>
                </section>
                </div>

            </div>
        </main>
    );
}
