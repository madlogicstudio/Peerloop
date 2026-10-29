
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next");

    // Only allow safe, local redirect paths.
    const destination =
        next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/feed";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
        return NextResponse.redirect(new URL(destination, origin));
        }

        console.error("Auth callback failed:", error.message);
    }

    return NextResponse.redirect(
        new URL("/login?error=auth_callback_failed", origin)
    );
}
