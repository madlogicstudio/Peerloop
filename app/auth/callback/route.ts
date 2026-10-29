
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const next = searchParams.get("next");

    // Allow only safe, relative redirect paths.
    const destination =
        next && next.startsWith("/") && !next.startsWith("//")
            ? next
            : "/feed";

    // Ensure an authorization code was provided.
    if (!code) {
        return NextResponse.redirect(
            new URL("/login?error=missing_code", origin)
        );
    }

    try {
        const supabase = await createClient();

        // Exchange the OAuth authorization code for a session.
        const { error } =
            await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Auth callback failed:", error.message);

            return NextResponse.redirect(
                new URL("/login?error=auth_callback_failed", origin)
            );
        }

        // Redirect to the requested page or the default feed.
        return NextResponse.redirect(
            new URL(destination, origin)
        );
    } catch (error) {
        console.error("Unexpected auth callback error:", error);

        return NextResponse.redirect(
            new URL("/login?error=auth_callback_failed", origin)
        );
    }
}
