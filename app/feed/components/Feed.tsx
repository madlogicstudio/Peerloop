"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/landing/Header";
import { createClient } from "@/lib/supabase/client";
import Post from "./Post";

import {
    ImagePlus,
    PenLine,
    Search,
    Send,
    X,
} from "lucide-react";

type PostType =
    | "Discussion"
    | "Question"
    | "Tutorial"
    | "Skill Exchange";

type FeedTab = "For You" | "Latest" | "Popular";

const postTypes: PostType[] = [
    "Discussion",
    "Question",
    "Tutorial",
    "Skill Exchange",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function FeedPage() {
    const supabase = useMemo(() => createClient(), []);

    const [activeTab, setActiveTab] =
        useState<FeedTab>("For You");

    const [activeFilter, setActiveFilter] =
        useState("All");

    const [searchQuery, setSearchQuery] = useState("");

    const [showComposer, setShowComposer] = useState(false);

    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");

    const [newType, setNewType] =
        useState<PostType>("Discussion");

    const [newSkill, setNewSkill] = useState("");

    const [selectedImage, setSelectedImage] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState<string | null>(null);

    const [isPublishing, setIsPublishing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [feedRefreshKey, setFeedRefreshKey] = useState(0);

    useEffect(() => {
        if (!selectedImage) {
            setImagePreview(null);
            return;
        }

        const previewUrl = URL.createObjectURL(selectedImage);

        setImagePreview(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [selectedImage]);

    const resetComposer = () => {
        setNewTitle("");
        setNewContent("");
        setNewType("Discussion");
        setNewSkill("");
        setSelectedImage(null);
        setErrorMessage("");
        setShowComposer(false);

        const input = document.getElementById(
            "postImage"
        ) as HTMLInputElement | null;

        if (input) {
            input.value = "";
        }
    };

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrorMessage(
                "Please select a JPG, PNG, or WebP image."
            );

            e.target.value = "";
            setSelectedImage(null);
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrorMessage(
                "Image size must not exceed 5 MB."
            );

            e.target.value = "";
            setSelectedImage(null);
            return;
        }

        setErrorMessage("");
        setSelectedImage(file);
    };

    const handlePublish = async () => {
        if (!newTitle.trim() || !newContent.trim()) {
            setErrorMessage(
                "Please provide a title and post content."
            );
            return;
        }

        setIsPublishing(true);
        setErrorMessage("");

        let uploadedImagePath: string | null = null;

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error(
                    "You must be logged in to publish a post."
                );
            }

            if (selectedImage) {
                const extension =
                    selectedImage.type === "image/jpeg"
                        ? "jpg"
                        : selectedImage.type === "image/png"
                        ? "png"
                        : "webp";

                const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

                const {
                    data: uploadData,
                    error: uploadError,
                } = await supabase.storage
                    .from("post-images")
                    .upload(filePath, selectedImage, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: selectedImage.type,
                    });

                if (uploadError) {
                    throw uploadError;
                }

                uploadedImagePath = uploadData.path;
            }

            const { error: insertError } = await supabase
                .from("posts")
                .insert({
                    user_id: user.id,
                    title: newTitle.trim(),
                    content: newContent.trim(),
                    post_type: newType,
                    skill: newSkill.trim() || null,
                    image_path: uploadedImagePath,
                });

            if (insertError) {
                throw insertError;
            }

            resetComposer();

            setFeedRefreshKey((prev) => prev + 1);

        } catch (error) {
            console.error("Post publishing error:", error);

            if (uploadedImagePath) {
                const { error: cleanupError } =
                    await supabase.storage
                        .from("post-images")
                        .remove([uploadedImagePath]);

                if (cleanupError) {
                    console.error(
                        "Image cleanup error:",
                        cleanupError
                    );
                }
            }

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while publishing your post."
            );

        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center bg-[var(--background)] text-[var(--foreground)]">
            <Header />

            <main className="mx-auto w-full max-w-[1280px] min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="flex w-full min-w-0 flex-col gap-5 lg:flex-row lg:gap-6">
                    <section className="w-full min-w-0 flex-1 space-y-4 sm:space-y-5">
                        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-foreground/10 bg-[var(--card)] px-3 py-3 sm:gap-3 sm:px-4">
                            <Search
                                size={20}
                                className="shrink-0 text-[var(--muted-foreground)]"
                            />

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                placeholder="Search posts, skills, or people..."
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)] sm:text-md"
                            />

                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="shrink-0 text-[var(--muted-foreground)] transition hover:text-foreground"
                                    aria-label="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setErrorMessage("");
                                setShowComposer(true);
                            }}
                            className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-2xl border border-foreground/10 bg-[var(--card)]/40 p-3 text-left transition hover:border-[var(--primary)]/40 sm:gap-3 sm:p-4"
                        >
                            <div className="flex shrink-0 items-center justify-center rounded-full bg-[var(--primary)] p-2 text-white">
                                <PenLine size={16} />
                            </div>

                            <span className="min-w-0 flex-1 truncate text-sm text-[var(--muted-foreground)] sm:text-md">
                                Share something with the community...
                            </span>
                        </button>

                        <div className="w-full min-w-0 overflow-hidden border-b border-foreground/10">
                            <div className="flex w-full items-center gap-5 sm:gap-7">
                                {(
                                    ["For You", "Latest", "Popular"] as FeedTab[]
                                ).map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative shrink-0 cursor-pointer whitespace-nowrap py-3 text-md font-bold transition ${
                                            activeTab === tab
                                                ? "text-[var(--primary)]"
                                                : "text-[var(--muted-foreground)] hover:text-foreground"
                                        }`}
                                    >
                                        {tab}

                                        {activeTab === tab && (
                                            <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[var(--primary)]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full min-w-0 overflow-hidden">
                            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
                                {["All", ...postTypes].map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setActiveFilter(filter)}
                                        className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            activeFilter === filter
                                                ? "bg-[#242424] text-white"
                                                : "border border-foreground/10 bg-[var(--card)] text-foreground/70 hover:bg-foreground/5"
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="min-h-[280px] w-full sm:min-h-[420px]">
                            <Post
                                key={feedRefreshKey}
                                activeTab={activeTab}
                                activeFilter={activeFilter}
                                searchQuery={searchQuery}
                            />
                        </div>
                    </section>
                </div>
            </main>

            {showComposer && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center"
                    onClick={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !isPublishing
                        ) {
                            resetComposer();
                        }
                    }}
                >
                    <div className="my-auto max-h-[calc(100dvh-24px)] w-full max-w-2xl overflow-y-auto hide-scrollbar rounded-2xl border border-foreground/10 bg-[var(--card)] p-4 shadow-2xl sm:max-h-[90vh] sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
                            <div className="min-w-0">
                                <h2 className="text-lg font-extrabold sm:text-xl">
                                    Create a Post
                                </h2>

                                <p className="mt-1 text-sm text-[var(--muted-foreground)] sm:text-md">
                                    Share your knowledge with Peerloop.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={resetComposer}
                                disabled={isPublishing}
                                className="shrink-0 cursor-pointer rounded-xl bg-[var(--primary)] p-2 text-white transition hover:bg-[#242424] disabled:opacity-50"
                                aria-label="Close composer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold sm:text-md">
                                    Post Type
                                </label>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {postTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewType(type)}
                                            className={`rounded-xl border px-2 py-3 text-sm font-semibold transition sm:text-md ${
                                                newType === type
                                                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                                                    : "border-foreground/10 hover:bg-foreground/5"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="postTitle"
                                    className="mb-2 block text-sm font-semibold sm:text-md"
                                >
                                    Title
                                </label>

                                <input
                                    id="postTitle"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Give your post a clear title..."
                                    maxLength={150}
                                    disabled={isPublishing}
                                    className="w-full min-w-0 rounded-xl border border-foreground/15 bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] sm:text-md"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="postContent"
                                    className="mb-2 block text-sm font-semibold sm:text-md"
                                >
                                    What's on your mind?
                                </label>

                                <textarea
                                    id="postContent"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Share an idea, ask a question, or teach something..."
                                    rows={5}
                                    disabled={isPublishing}
                                    className="w-full min-w-0 resize-y rounded-xl border border-foreground/15 bg-[var(--background)] px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[var(--primary)] sm:text-md"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="postSkill"
                                    className="mb-2 block text-sm font-semibold sm:text-md"
                                >
                                    Skill or Topic
                                </label>

                                <input
                                    id="postSkill"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="e.g. UI/UX Design"
                                    disabled={isPublishing}
                                    className="w-full min-w-0 rounded-xl border border-foreground/15 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] sm:text-md"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold sm:text-md">
                                    Add an Image

                                    <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                                        (Optional)
                                    </span>
                                </label>

                                <input
                                    id="postImage"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={isPublishing}
                                />

                                {!imagePreview ? (
                                    <label
                                        htmlFor="postImage"
                                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/20 bg-[var(--background)] px-4 py-8 text-center transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 ${
                                            isPublishing
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-pointer"
                                        }`}
                                    >
                                        <div className="rounded-full bg-[var(--primary)]/10 p-3 text-[var(--primary)]">
                                            <ImagePlus size={24} />
                                        </div>

                                        <span className="text-sm font-semibold">
                                            Insert image here
                                        </span>

                                        <span className="text-sm text-[var(--muted-foreground)]">
                                            JPG, PNG, or WebP · Maximum 5 MB
                                        </span>
                                    </label>
                                ) : (
                                    <div className="relative overflow-hidden rounded-xl border border-foreground/10 bg-[var(--background)] p-2">
                                        <img
                                            src={imagePreview}
                                            alt="Selected post image preview"
                                            className="max-h-72 w-full rounded-lg object-contain"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(null);

                                                const input = document.getElementById(
                                                    "postImage"
                                                ) as HTMLInputElement | null;

                                                if (input) {
                                                    input.value = "";
                                                }
                                            }}
                                            disabled={isPublishing}
                                            className="absolute right-4 top-4 rounded-xl bg-black/70 p-2 text-white transition hover:bg-black disabled:opacity-50"
                                            aria-label="Remove selected image"
                                        >
                                            <X size={18} />
                                        </button>

                                        <p className="mt-2 truncate px-1 text-sm text-[var(--muted-foreground)]">
                                            {selectedImage?.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {errorMessage && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600"
                                >
                                    {errorMessage}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handlePublish}
                                    disabled={
                                        isPublishing ||
                                        !newTitle.trim() ||
                                        !newContent.trim()
                                    }
                                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:text-md"
                                >
                                    <Send size={17} />

                                    {isPublishing
                                        ? "Publishing..."
                                        : "Publish Post"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}