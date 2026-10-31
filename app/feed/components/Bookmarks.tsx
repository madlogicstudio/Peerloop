
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Bookmark,
    RefreshCw,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
import { MorphingInfinity } from "@/components/ui/MorphingInfinity";
import { createClient } from "@/lib/supabase/client";
import PostCard from "./PostCard";
import { PostData } from "./PostCard";

type Props = {
    setIsActive: React.Dispatch<React.SetStateAction<string>>;
}

export default function Bookmarks({setIsActive}: Props) {
    const supabase = useMemo(() => createClient(), []);

    const [posts, setPosts] = useState<PostData[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
 
    const fetchBookmarks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            // Get authenticated user
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) throw authError;

            if (!user) {
                setCurrentUserId(null);
                setPosts([]);
                return;
            }

            setCurrentUserId(user.id);

            // Fetch user's bookmarks
            const { data: bookmarkRows, error: bookmarkError } =
                await supabase
                    .from("post_bookmarks")
                    .select("post_id, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

            if (bookmarkError) throw bookmarkError;

            // No bookmarked posts
            if (!bookmarkRows || bookmarkRows.length === 0) {
                setPosts([]);
                return;
            }

            const postIds = bookmarkRows.map(
                (bookmark) => bookmark.post_id
            );

            // Fetch the actual posts and their authors
            const { data: postsData, error: postsError } = await supabase
                .from("posts")
                .select(`
                    id,
                    user_id,
                    title,
                    content,
                    post_type,
                    skill,
                    image_path,
                    created_at,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .in("id", postIds);

            if (postsError) throw postsError;

            // Keep the same order as the user's bookmarks
            const fetchedPosts = (postsData ?? []) as unknown as PostData[];

            const sortedPosts = postIds
                .map((postId) =>
                    fetchedPosts.find((post) => post.id === postId)
                )
                .filter(
                    (post): post is PostData => post !== undefined
                );

            setPosts(sortedPosts);
        } catch (err) {
            console.error("Error fetching bookmarks:", err);
            setError("Unable to load your saved posts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    // =========================================
    // INITIAL FETCH
    // =========================================

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);
 
    const handleBookmarkRemoved = (postId: string) => {
        setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== postId)
        );
    };

    // =========================================
    // DELETE POST
    // =========================================

    const handlePostDeleted = (postId: string) => {
        setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== postId)
        );
    };

    // =========================================
    // LOADING STATE
    // =========================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <MorphingInfinity className="h-24 w-24 text-[var(--primary)]"/>
            </div>
        );
    }

    // =========================================
    // NOT SIGNED IN
    // =========================================

    if (!currentUserId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                        <Bookmark
                            size={30}
                            className="text-[var(--primary)]"
                        />
                    </div>

                    <h2 className="text-xl font-bold">
                        Sign in to view your bookmarks
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        Your saved posts will appear here once you sign in
                        to your Peerloop account.
                    </p>
                </div>
            </div>
        );
    }

    // =========================================
    // MAIN RENDER
    // =========================================

    return (
        <div className="max-w-[1280px] w-full space-y-3 p-6">

            {/* Page Header */}
            <div className="flex items-center justify-between gap-3">

                <div className="w-full mb-6">
                    <span onClick={() => setIsActive("feed")}
                        className="cursor-pointer hover:text-[var(--primary)] inline-flex items-center gap-2 text-md text-[var(--muted-foreground)] transition "
                    >
                        <ArrowLeft size={18} />
                        Back to Feed
                    </span>
                </div>

                <button
                    type="button"
                    onClick={fetchBookmarks}
                    disabled={loading}
                    aria-label="Refresh bookmarks"
                    title="Refresh bookmarks"
                    className="flex p-2 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[var(--primary)] text-white transition hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw size={18} />
                </button>

            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-500"
                    />

                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-500">
                            Something went wrong
                        </p>

                        <p className="mt-1 text-sm text-red-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchBookmarks}
                            className="mt-2 cursor-pointer text-sm font-semibold text-red-500 hover:underline"
                        >
                            Try again
                        </button>
                    </div>

                </div>
            )}

            {/* Bookmark Count */}
            {!error && posts.length > 0 && (
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                    {posts.length}{" "}
                    {posts.length === 1 ? "saved post" : "saved posts"}
                </p>
            )}

            {/* Empty State */}
            {!error && posts.length === 0 && (
                <div className="rounded-2xl border border-foreground/10 bg-[var(--card)] px-5 py-14 text-center">

                    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                        <Bookmark
                            size={30}
                            className="text-[var(--primary)]"
                        />
                    </div>

                    <h2 className="text-lg font-bold">
                        No saved posts yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
                        When you find something interesting, click the
                        bookmark icon on a post to save it here.
                    </p>

                </div>
            )}

            {/* Bookmarked Posts */}
            {!error && posts.length > 0 && (
                <div className="space-y-5">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUserId}
                            onPostDeleted={handlePostDeleted}
                            onBookmarkRemoved={handleBookmarkRemoved}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}
