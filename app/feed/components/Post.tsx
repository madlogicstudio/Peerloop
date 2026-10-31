"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PostCard, { type PostData } from "./PostCard";
import { MorphingInfinity } from "@/components/ui/MorphingInfinity";

type FeedTab = "For You" | "Latest" | "Popular";

type Props = {
    activeTab: FeedTab;
    activeFilter: string;
    searchQuery: string;
};

export default function Post({
    activeTab,
    activeFilter,
    searchQuery,
}: Props) {
    const supabase = useMemo(() => createClient(), []);

    const [posts, setPosts] = useState<PostData[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) throw authError;

            setCurrentUserId(user?.id ?? null);

            let query = supabase
                .from("posts")
                .select(`
                    id,
                    user_id,
                    title,
                    content,
                    post_type,
                    skill,
                    image_path,
                    created_at
                `);

            if (activeFilter !== "All") {
                query = query.eq("post_type", activeFilter);
            }

            if (searchQuery.trim()) {
                const search = searchQuery.trim();

                query = query.or(
                    `title.ilike.%${search}%,content.ilike.%${search}%,skill.ilike.%${search}%`
                );
            }

            query = query.order("created_at", {
                ascending: false,
            });

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const fetchedPosts = data || [];

            const userIds = [
                ...new Set(fetchedPosts.map((post) => post.user_id)),
            ];

            const {
                data: profileRows,
                error: profileError,
            } = userIds.length > 0
                ? await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .in("id", userIds)
                : { data: [], error: null };

            if (profileError) throw profileError;

            const postsWithProfiles: PostData[] = fetchedPosts.map((post) => {
                const matchingProfile = (profileRows || []).find(
                    (profile) => profile.id === post.user_id
                );

                return {
                    ...post,
                    profiles: matchingProfile
                        ? [
                            {
                                full_name: matchingProfile.full_name,
                                avatar_url: matchingProfile.avatar_url,
                            },
                        ]
                        : [],
                };
            });

            setPosts(postsWithProfiles);
        } catch (err) {
            console.error("Error fetching posts:", err);

            setError(
                "We couldn't load the posts. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [activeFilter, searchQuery, supabase]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePostDeleted = (postId: string) => {
        setPosts((currentPosts) =>
            currentPosts.filter((post) => post.id !== postId)
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <MorphingInfinity className="h-24 w-24 text-[var(--primary)]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-foreground/10 bg-[var(--card)] p-6 text-center sm:min-h-[300px]">
                <p className="text-sm text-[var(--muted-foreground)]">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchPosts}
                    className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex min-h-[280px] w-full items-center justify-center rounded-2xl border border-foreground/10 bg-[var(--card)] text-center sm:min-h-[300px]">
                <span className="text-2xl font-semibold text-[var(--muted-foreground)]">
                    ---
                </span>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onPostDeleted={handlePostDeleted}
                />
            ))}
        </div>
    );
}