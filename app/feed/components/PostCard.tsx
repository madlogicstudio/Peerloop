"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { FormEvent } from "react";

import {
    Bookmark,
    MessageCircle,
    MoreHorizontal,
    ThumbsUp,
    Trash2,
    X,
    Send,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export type PostData = {
    id: string;
    user_id: string;
    title: string;
    content: string;
    post_type: string;
    skill: string | null;
    image_path: string | null;
    created_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    }[] | null;
};

type CommentData = {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    }[] | null;
};

type Props = {
    post: PostData;
    currentUserId: string | null;
    onPostDeleted: (postId: string) => void;
    onBookmarkRemoved?: (postId: string) => void;
};

export default function PostCard({
    post,
    currentUserId,
    onPostDeleted,
    onBookmarkRemoved,
}: Props) {
    const supabase = useMemo(() => createClient(), []);

    const [imageError, setImageError] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [likeError, setLikeError] = useState("");

    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [bookmarkError, setBookmarkError] = useState("");

    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentCount, setCommentCount] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");

    const imageUrl = post.image_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${post.image_path}`
        : null;

    const profile = post.profiles?.[0];
    const authorName = profile?.full_name || "Peerloop Member";
    const avatarUrl = profile?.avatar_url;

    const isOwnPost = currentUserId === post.user_id;

    const formattedDate = new Date(post.created_at).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );

    useEffect(() => {
        let cancelled = false;

        const fetchInteractionData = async () => {
            try {
                const [
                    likesResult,
                    userLikeResult,
                    commentsResult,
                    bookmarkResult,
                ] = await Promise.all([
                    supabase
                        .from("post_likes")
                        .select("*", { count: "exact", head: true })
                        .eq("post_id", post.id),

                    currentUserId
                        ? supabase
                              .from("post_likes")
                              .select("post_id")
                              .eq("post_id", post.id)
                              .eq("user_id", currentUserId)
                              .maybeSingle()
                        : Promise.resolve({
                              data: null,
                              error: null,
                          }),

                    supabase
                        .from("post_comments")
                        .select("*", { count: "exact", head: true })
                        .eq("post_id", post.id),

                    currentUserId
                        ? supabase
                              .from("post_bookmarks")
                              .select("post_id")
                              .eq("post_id", post.id)
                              .eq("user_id", currentUserId)
                              .maybeSingle()
                        : Promise.resolve({
                              data: null,
                              error: null,
                          }),
                ]);

                if (likesResult.error) throw likesResult.error;
                if (userLikeResult.error) throw userLikeResult.error;
                if (commentsResult.error) throw commentsResult.error;
                if (bookmarkResult.error) throw bookmarkResult.error;

                if (cancelled) return;

                setLikeCount(likesResult.count ?? 0);
                setLiked(!!userLikeResult.data);
                setCommentCount(commentsResult.count ?? 0);
                setBookmarked(!!bookmarkResult.data);
            } catch (err) {
                console.error("Error loading post interactions:", err);
            }
        };

        fetchInteractionData();

        return () => {
            cancelled = true;
        };
    }, [supabase, post.id, currentUserId]);

    const handleLike = async () => {
        if (!currentUserId || likeLoading) return;

        setLikeLoading(true);
        setLikeError("");

        const previousState = liked;

        setLiked(!previousState);
        setLikeCount((count) =>
            Math.max(0, count + (previousState ? -1 : 1))
        );

        try {
            if (previousState) {
                const { error } = await supabase
                    .from("post_likes")
                    .delete()
                    .eq("post_id", post.id)
                    .eq("user_id", currentUserId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("post_likes")
                    .insert({
                        post_id: post.id,
                        user_id: currentUserId,
                    });

                if (error) throw error;
            }
        } catch (err) {
            console.error("Error updating like:", err);

            setLiked(previousState);
            setLikeCount((count) =>
                Math.max(0, count + (previousState ? 1 : -1))
            );

            setLikeError("Unable to update your like. Please try again.");
        } finally {
            setLikeLoading(false);
        }
    };

    const handleBookmark = async () => {
        if (!currentUserId || bookmarkLoading) return;

        setBookmarkLoading(true);
        setBookmarkError("");

        const previousState = bookmarked;

        setBookmarked(!previousState);

        try {
            if (previousState) {
                const { error } = await supabase
                    .from("post_bookmarks")
                    .delete()
                    .eq("post_id", post.id)
                    .eq("user_id", currentUserId);

                if (error) throw error;

                onBookmarkRemoved?.(post.id);
            } else {
                const { error } = await supabase
                    .from("post_bookmarks")
                    .insert({
                        post_id: post.id,
                        user_id: currentUserId,
                    });

                if (error) throw error;
            }
        } catch (err) {
            console.error("Error updating bookmark:", err);

            setBookmarked(previousState);

            setBookmarkError(
                "Unable to update bookmark. Please try again."
            );
        } finally {
            setBookmarkLoading(false);
        }
    };

    const fetchComments = useCallback(async () => {
        setCommentsLoading(true);
        setCommentError("");

        try {
            const { data, error } = await supabase
                .from("post_comments")
                .select("id, post_id, user_id, content, created_at")
                .eq("post_id", post.id)
                .order("created_at", { ascending: true });

            if (error) throw error;

            const fetchedComments = data ?? [];

            const userIds = [
                ...new Set(
                    fetchedComments.map((comment) => comment.user_id)
                ),
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

            const commentsWithProfiles: CommentData[] =
                fetchedComments.map((comment) => {
                    const matchingProfile = (profileRows ?? []).find(
                        (profile) => profile.id === comment.user_id
                    );

                    return {
                        ...comment,
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

            setComments(commentsWithProfiles);
            setCommentCount(commentsWithProfiles.length);
        } catch (err) {
            console.error("Error fetching comments:", err);

            setCommentError(
                "Unable to load comments. Please try again."
            );
        } finally {
            setCommentsLoading(false);
        }
    }, [supabase, post.id]);

    const toggleComments = () => {
        const shouldOpen = !commentsOpen;

        setCommentsOpen(shouldOpen);

        if (shouldOpen) {
            fetchComments();
        }
    };

    const handleAddComment = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!currentUserId || commentSubmitting) return;

        const trimmedComment = commentText.trim();

        if (!trimmedComment) return;

        setCommentSubmitting(true);
        setCommentError("");

        try {
            const { data, error } = await supabase
                .from("post_comments")
                .insert({
                    post_id: post.id,
                    user_id: currentUserId,
                    content: trimmedComment,
                })
                .select("id, post_id, user_id, content, created_at")
                .single();

            if (error) throw error;

            const {
                data: commenterProfile,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", currentUserId)
                .maybeSingle();

            if (profileError) {
                console.error(
                    "Unable to fetch commenter profile:",
                    profileError
                );
            }

            const newComment: CommentData = {
                ...data,
                profiles: commenterProfile
                    ? [
                          {
                              full_name: commenterProfile.full_name,
                              avatar_url: commenterProfile.avatar_url,
                          },
                      ]
                    : [],
            };

            setComments((current) => [...current, newComment]);
            setCommentCount((count) => count + 1);
            setCommentText("");
        } catch (err) {
            console.error("Error adding comment:", err);

            setCommentError(
                "Unable to add your comment. Please try again."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    const openDeleteModal = () => {
        setMenuOpen(false);
        setDeleteError("");
        setConfirmDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;

        setConfirmDeleteOpen(false);
        setDeleteError("");
    };

    const handleDeletePost = async () => {
        if (!isOwnPost || !currentUserId || deleting) return;

        setDeleting(true);
        setDeleteError("");

        try {
            const { data, error: deleteError } = await supabase
                .from("posts")
                .delete()
                .eq("id", post.id)
                .eq("user_id", currentUserId)
                .select("id");

            if (deleteError) throw deleteError;

            if (!data || data.length === 0) {
                throw new Error(
                    "Post could not be deleted. Check your permissions."
                );
            }

            if (post.image_path) {
                const { error: storageError } = await supabase.storage
                    .from("post-images")
                    .remove([post.image_path]);

                if (storageError) {
                    console.error(
                        "Post deleted, but image removal failed:",
                        storageError
                    );
                }
            }

            setConfirmDeleteOpen(false);
            onPostDeleted(post.id);
        } catch (err) {
            console.error("Error deleting post:", err);

            setDeleteError(
                "Unable to delete this post. Please try again."
            );

            setDeleting(false);
        }
    };

    return (
        <>
            <article className="overflow-hidden rounded-2xl border border-foreground/10 bg-[var(--card)]">
                <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={authorName}
                                className="size-11 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white">
                                {authorName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold sm:text-md">
                                {authorName}
                            </h3>

                            <p className="text-sm text-[var(--muted-foreground)]">
                                {formattedDate}
                            </p>
                        </div>
                    </div>

                    {isOwnPost && (
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                aria-label="More post options"
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="cursor-pointer rounded-full p-2 text-[var(--muted-foreground)] transition hover:bg-foreground/5"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-foreground/10 bg-[var(--card)] p-1.5 shadow-lg">
                                    <button
                                        type="button"
                                        onClick={openDeleteModal}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                                    >
                                        <Trash2 size={18} />
                                        Delete post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {deleteError && !confirmDeleteOpen && (
                    <div className="mx-4 mb-3 flex items-center justify-between gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 sm:mx-5">
                        <p className="text-sm text-red-500">
                            {deleteError}
                        </p>

                        <button
                            type="button"
                            onClick={() => setDeleteError("")}
                            aria-label="Dismiss error"
                            className="shrink-0 text-red-500 hover:opacity-70"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                            {post.post_type}
                        </span>

                        {post.skill && (
                            <span className="rounded-full bg-foreground/5 px-3 py-1 text-sm font-medium text-[var(--muted-foreground)]">
                                {post.skill}
                            </span>
                        )}
                    </div>

                    <h2 className="text-lg font-extrabold sm:text-xl">
                        {post.title}
                    </h2>

                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80 sm:text-md">
                        {post.content}
                    </p>
                </div>

                {imageUrl && !imageError && (
                    <div className="w-full border-y border-foreground/10 bg-[var(--background)]">
                        <img
                            src={imageUrl}
                            alt={post.title}
                            onError={() => setImageError(true)}
                            className="block h-auto w-full"
                        />
                    </div>
                )}

                {(likeCount > 0 || commentCount > 0) && (
                    <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3 text-sm text-[var(--muted-foreground)] sm:px-5">
                        <span>
                            {likeCount > 0 && (
                                <>
                                    {likeCount}{" "}
                                    {likeCount === 1 ? "like" : "likes"}
                                </>
                            )}
                        </span>

                        {commentCount > 0 && (
                            <button
                                type="button"
                                onClick={toggleComments}
                                className="cursor-pointer transition hover:text-[var(--primary)]"
                            >
                                {commentCount}{" "}
                                {commentCount === 1
                                    ? "comment"
                                    : "comments"}
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between gap-2 p-4 sm:px-5">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleLike}
                            disabled={!currentUserId || likeLoading}
                            aria-pressed={liked}
                            className={`inline-flex cursor-pointer items-center gap-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                liked
                                    ? "text-[var(--primary)]"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                            }`}
                        >
                            <ThumbsUp
                                size={19}
                                className={liked ? "fill-current" : ""}
                            />

                            {liked ? "Liked" : "Like"}
                        </button>

                        <button
                            type="button"
                            onClick={toggleComments}
                            aria-expanded={commentsOpen}
                            className={`inline-flex cursor-pointer items-center gap-2 text-sm font-semibold transition ${
                                commentsOpen
                                    ? "text-[var(--primary)]"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                            }`}
                        >
                            <MessageCircle size={19} />
                            Comment
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleBookmark}
                        disabled={!currentUserId || bookmarkLoading}
                        aria-label={
                            bookmarked ? "Remove bookmark" : "Save post"
                        }
                        aria-pressed={bookmarked}
                        title={
                            bookmarked ? "Remove bookmark" : "Save post"
                        }
                        className={`rounded-full p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            bookmarked
                                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "text-[var(--muted-foreground)] hover:bg-foreground/5 hover:text-[var(--primary)]"
                        }`}
                    >
                        <Bookmark
                            size={19}
                            className={bookmarked ? "fill-current" : ""}
                        />
                    </button>
                </div>

                {likeError && (
                    <div className="px-4 pb-3 sm:px-5">
                        <p className="text-sm text-red-500">
                            {likeError}
                        </p>
                    </div>
                )}

                {bookmarkError && (
                    <div className="px-4 pb-3 sm:px-5">
                        <p className="text-sm text-red-500">
                            {bookmarkError}
                        </p>
                    </div>
                )}

                {commentsOpen && (
                    <div className="border-t border-foreground/10 bg-foreground/[0.02] p-4 sm:p-5">
                        <h3 className="mb-4 text-sm font-bold">
                            Comments ({commentCount})
                        </h3>

                        {commentsLoading ? (
                            <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                                Loading comments...
                            </p>
                        ) : commentError && comments.length === 0 ? (
                            <div className="flex items-center justify-between gap-3 rounded-xl bg-red-500/10 p-3">
                                <p className="text-sm text-red-500">
                                    {commentError}
                                </p>

                                <button
                                    type="button"
                                    onClick={fetchComments}
                                    className="shrink-0 text-sm font-semibold text-red-500 hover:underline"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                                No comments yet. Start the conversation!
                            </p>
                        ) : (
                            <div className="mb-5 space-y-4">
                                {comments.map((comment) => {
                                    const commentProfile =
                                        comment.profiles?.[0];

                                    const name =
                                        commentProfile?.full_name ||
                                        "Peerloop Member";

                                    return (
                                        <div
                                            key={comment.id}
                                            className="flex items-start gap-3"
                                        >
                                            {commentProfile?.avatar_url ? (
                                                <img
                                                    src={commentProfile.avatar_url}
                                                    alt={name}
                                                    className="size-9 shrink-0 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                                                    {name.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1 rounded-xl bg-[var(--card)] px-3 py-2.5">
                                                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-sm font-bold">
                                                        {name}
                                                    </p>

                                                    <p className="text-sm text-[var(--muted-foreground)]">
                                                        {new Date(
                                                            comment.created_at
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {currentUserId ? (
                            <form
                                onSubmit={handleAddComment}
                                className="space-y-2"
                            >
                                <textarea
                                    value={commentText}
                                    onChange={(event) =>
                                        setCommentText(event.target.value)
                                    }
                                    placeholder="Write a comment..."
                                    rows={2}
                                    maxLength={2000}
                                    className="w-full resize-none rounded-xl border border-foreground/10 bg-[var(--card)] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
                                />

                                {commentError && (
                                    <p className="text-sm text-red-500">
                                        {commentError}
                                    </p>
                                )}

                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-[var(--muted-foreground)]">
                                        {commentText.length}/2000
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={
                                            !commentText.trim() ||
                                            commentSubmitting
                                        }
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Send size={16} />

                                        {commentSubmitting
                                            ? "Posting..."
                                            : "Post comment"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-[var(--muted-foreground)]">
                                Sign in to join the conversation.
                            </p>
                        )}
                    </div>
                )}
            </article>

            {confirmDeleteOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDeleteModal();
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        aria-describedby="delete-modal-description"
                        className="w-full max-w-md rounded-2xl border border-foreground/10 bg-[var(--card)] p-5 shadow-2xl sm:p-6"
                    >
                        <h2
                            id="delete-modal-title"
                            className="text-lg font-bold sm:text-xl"
                        >
                            Delete post?
                        </h2>

                        <p
                            id="delete-modal-description"
                            className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]"
                        >
                            Are you sure you want to delete this post? This
                            action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                                <p className="text-sm text-red-500">
                                    {deleteError}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="cursor-pointer rounded-xl border border-foreground/20 bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--card)]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeletePost}
                                disabled={deleting}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={17} />
                                        Delete post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
 