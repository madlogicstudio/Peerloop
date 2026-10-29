import Link from "next/link"
import { BookOpen, ArrowUpRight } from "lucide-react"

function Cta() {
    return (
        <div className="max-w-[1280px] w-full relative overflow-hidden rounded-2xl bg-[#FFE829] p-5 text-[#242424] sm:p-6">
                <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[16px] border-[#F0491D]/20" />

                <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0491D] text-white">
                        <BookOpen size={20} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold leading-tight">
                        Have a skill to share?
                    </h2>

                    <p className="mt-2 text-md leading-6 text-[#242424]/75">
                        Join the community and turn what you know into someone
                        else&apos;s next big discovery.
                    </p>

                    <Link
                        href="/signup"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#242424] px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#F0491D]"
                    >
                        Join Peerloop
                        <ArrowUpRight size={16} />
                    </Link>
                </div>
        </div>
    )
}

export default Cta