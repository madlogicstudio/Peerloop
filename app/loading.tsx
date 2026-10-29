import { MorphingInfinity } from "@/components/ui/MorphingInfinity";

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
            <div className="flex flex-col items-center gap-4">
                <MorphingInfinity className="h-12 w-12 text-[var(--primary)]"/>
            </div>
        </div>
    );
}