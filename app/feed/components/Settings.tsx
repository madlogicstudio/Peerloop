"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MorphingInfinity } from "@/components/ui/MorphingInfinity";
import {
    Settings,
    UserRound,
    Mail,
    LockKeyhole,
    Camera,
    Save,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    CalendarDays,
    ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    full_name: string | null;
    avatar_url: string | null;
};

type Props = {
    setIsActive: React.Dispatch<React.SetStateAction<string>>;
}

export default function SettingsPage({setIsActive} : Props) {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile
    const [userId, setUserId] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Account
    const [createdAt, setCreatedAt] = useState("");

    // Password
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // States
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Load user profile
    useEffect(() => {
        let active = true;

        async function loadProfile() {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (!active) return;

            if (authError || !user) {
                router.replace("/login");
                return;
            }

            setUserId(user.id);
            setEmail(user.email ?? "");
            setCreatedAt(user.created_at);

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", user.id)
                .maybeSingle<Profile>();

            if (!active) return;

            if (error) {
                setProfileError(error.message);
            }

            setFullName(
                profile?.full_name ??
                user.user_metadata?.full_name ??
                user.user_metadata?.name ??
                ""
            );

            setAvatarUrl(
                profile?.avatar_url ??
                user.user_metadata?.avatar_url ??
                user.user_metadata?.picture ??
                null
            );

            setLoading(false);
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, [router, supabase]);

    // Avatar preview
    useEffect(() => {
        if (!avatarFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(avatarFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    // Initials
    const initials =
        fullName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";

    // Avatar selection
    function handleAvatarChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        setProfileError("");
        setProfileSuccess("");

        if (!file.type.startsWith("image/")) {
            setProfileError("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setProfileError("Image size must not exceed 5MB.");
            event.target.value = "";
            return;
        }

        setAvatarFile(file);
    }

    // Save profile
    async function handleSaveProfile(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setProfileError("");
        setProfileSuccess("");

        if (!fullName.trim()) {
            setProfileError("Full name is required.");
            return;
        }

        setSavingProfile(true);

        try {
            let updatedAvatarUrl = avatarUrl;

            // Upload avatar
            if (avatarFile) {
                const extension =
                    avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";

                const filePath =
                    `${userId}/${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, avatarFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: avatarFile.type,
                    });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                updatedAvatarUrl = data.publicUrl;
            }

            // Update profile table
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName.trim(),
                    avatar_url: updatedAvatarUrl,
                })
                .eq("id", userId);

            if (updateError) throw updateError;

            // Update local state
            setAvatarUrl(updatedAvatarUrl);
            setAvatarFile(null);

            setProfileSuccess(
                "Your profile has been updated successfully."
            );

            router.refresh();
        } catch (err) {
            setProfileError(
                err instanceof Error
                    ? err.message
                    : "Failed to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    }

    // Change password
    async function handleChangePassword(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (newPassword.length < 6) {
            setPasswordError(
                "Your password must contain at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Your passwords do not match.");
            return;
        }

        setSavingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            setNewPassword("");
            setConfirmPassword("");

            setPasswordSuccess(
                "Your password has been changed successfully."
            );
        } catch (err) {
            setPasswordError(
                err instanceof Error
                    ? err.message
                    : "Failed to change your password."
            );
        } finally {
            setSavingPassword(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <MorphingInfinity className="h-24 w-24 text-[var(--primary)]"/>
            </div>
        );
    }

    return (
        <main className="min-h-screen w-full bg-[var(--background)] ">

            <div className="mx-auto max-w-[1280px] w-full px-4 py-8 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="w-full mb-6">
                    <span onClick={() => setIsActive("feed")}
                        className="cursor-pointer hover:text-[var(--primary)] inline-flex items-center gap-2 text-md text-[var(--muted-foreground)] transition "
                    >
                        <ArrowLeft size={18} />
                        Back to Feed
                    </span>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

                    {/* Sidebar */}
                    <aside className="h-fit rounded-2xl border border-foreground/10 bg-[var(--card)] p-3 lg:sticky lg:top-24">

                        <p className="px-3 py-3 text-sm font-semibold tracking-wide text-[var(--muted-foreground)]">
                            General
                        </p>

                        <nav className="flex flex-col gap-1">

                            <a
                                href="#profile"
                                className="flex items-center gap-3 rounded-xl bg-[var(--primary)]/10 px-3 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)]/15"
                            >
                                <UserRound size={19} />
                                Profile
                            </a>

                            <a
                                href="#account"
                                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
                            >
                                <Mail size={19} />
                                Account Information
                            </a>

                            <a
                                href="#password"
                                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
                            >
                                <LockKeyhole size={19} />
                                Change Password
                            </a>

                        </nav>

                
                    </aside>

                    {/* Main Settings Content */}
                    <div className="min-w-0 space-y-6">

                        {/* PROFILE SETTINGS */}
                        <form
                            id="profile"
                            onSubmit={handleSaveProfile}
                            className="scroll-mt-28 rounded-2xl border border-foreground/10 bg-[var(--card)] p-5 shadow-sm sm:p-7"
                        >
                            <div className="mb-7 border-b border-foreground/10 pb-5">
                                <h2 className="text-lg font-bold text-foreground">
                                    Profile
                                </h2>
                                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                    Manage your personal information and profile picture.
                                </p>
                            </div>

                            {/* Avatar */}
                            <div className="mb-8">
                                <label className="mb-3 block text-sm font-semibold text-foreground">
                                    Profile Picture
                                </label>

                                <div className="flex flex-wrap items-center gap-5">

                                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-2xl font-bold text-white">
                                        {previewUrl || avatarUrl ? (
                                            <Image
                                                src={previewUrl || avatarUrl!}
                                                alt="Profile picture"
                                                fill
                                                unoptimized
                                                sizes="96px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            initials
                                        )}
                                    </div>

                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                                        >
                                            <Camera size={17} />
                                            Change Photo
                                        </button>

                                        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                            JPG, PNG or other image formats.
                                        </p>
                                        <p className="text-sm text-[var(--muted-foreground)]">
                                            Maximum file size: 5MB.
                                        </p>

                                        {avatarFile && (
                                            <p className="mt-2 text-sm font-medium text-[var(--primary)]">
                                                {avatarFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="mb-6">
                                <label
                                    htmlFor="fullName"
                                    className="mb-2 block text-sm font-semibold text-foreground"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Enter your full name"
                                    maxLength={100}
                                    required
                                    className="w-full rounded-xl border border-foreground/15 bg-[var(--background)] px-4 py-3 text-sm text-foreground outline-none transition focus:border-[var(--primary)]"
                                />
                            </div>

                            {/* Feedback */}
                            {profileError && (
                                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    {profileError}
                                </div>
                            )}

                            {profileSuccess && (
                                <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
                                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                                    {profileSuccess}
                                </div>
                            )}

                            <div className="flex justify-end border-t border-foreground/10 pt-5">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {savingProfile ? (
                                        <>
                                            <Loader2 size={17} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* ACCOUNT INFORMATION */}
                        <section
                            id="account"
                            className="scroll-mt-28 rounded-2xl border border-foreground/10 bg-[var(--card)] p-5 shadow-sm sm:p-7"
                        >
                            <div className="mb-7 border-b border-foreground/10 pb-5">
                                <h2 className="text-lg font-bold text-foreground">
                                    Account Information
                                </h2>
                                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                    View your account details and registration information.
                                </p>
                            </div>

                            <div className="space-y-6">

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">
                                        Email Address
                                    </label>

                                    <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-[var(--background)] px-4 py-3">
                                        <Mail
                                            size={19}
                                            className="shrink-0 text-[var(--muted-foreground)]"
                                        />

                                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                                            {email}
                                        </span>

                                        <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-sm font-medium text-green-600">
                                            Verified
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                        Your email address is associated with your Peerloop account.
                                    </p>
                                </div>

                                {/* User ID */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">
                                        Account ID
                                    </label>

                                    <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-[var(--background)] px-4 py-3">
                                        <UserRound
                                            size={19}
                                            className="shrink-0 text-[var(--muted-foreground)]"
                                        />

                                        <span className="min-w-0 truncate text-sm text-foreground/70">
                                            {userId}
                                        </span>
                                    </div>
                                </div>

                                {/* Created At */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-foreground">
                                        Member Since
                                    </label>

                                    <div className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-[var(--background)] px-4 py-3">
                                        <CalendarDays
                                            size={19}
                                            className="shrink-0 text-[var(--muted-foreground)]"
                                        />

                                        <span className="text-sm text-foreground">
                                            {createdAt
                                                ? new Date(createdAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "Not available"}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* CHANGE PASSWORD */}
                        <form
                            id="password"
                            onSubmit={handleChangePassword}
                            className="scroll-mt-28 rounded-2xl border border-foreground/10 bg-[var(--card)] p-5 shadow-sm sm:p-7"
                        >
                            <div className="mb-7 border-b border-foreground/10 pb-5">
                                <h2 className="text-lg font-bold text-foreground">
                                    Change Password
                                </h2>
                                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                                    Choose a strong password to keep your account secure.
                                </p>
                            </div>

                            <div className="space-y-5">

                                {/* New Password */}
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="mb-2 block text-sm font-semibold text-foreground"
                                    >
                                        New Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            placeholder="Enter new password"
                                            minLength={6}
                                            required
                                            autoComplete="new-password"
                                            className="w-full rounded-xl border border-foreground/15 bg-[var(--background)] px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-[var(--primary)]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-sm font-semibold text-foreground"
                                    >
                                        Confirm New Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(e.target.value)
                                            }
                                            placeholder="Confirm new password"
                                            minLength={6}
                                            required
                                            autoComplete="new-password"
                                            className="w-full rounded-xl border border-foreground/15 bg-[var(--background)] px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-[var(--primary)]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition hover:text-foreground"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-[var(--muted-foreground)]">
                                    Your password must contain at least 6 characters.
                                </p>

                            </div>

                            {/* Feedback */}
                            {passwordError && (
                                <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
                                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="mt-7 flex justify-end border-t border-foreground/10 pt-5">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {savingPassword ? (
                                        <>
                                            <Loader2 size={17} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <LockKeyhole size={17} />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </main>
    );
}
