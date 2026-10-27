"use client"

import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Menu } from "lucide-react"

function Header() {
    return (
        <section className="w-full flex flex-row itemcs-center justify-center p-3">
            <div className="font-sans max-w-[1280px] w-full flex flex-row sm:items-end items-center justify-between">
                <div className="flex flex-row items-center gap-3">
                    <Image src='/Web-icon.png' height={42} width={42} alt="Peerloop-web-icon" className="sm:h-10 sm:w-10 h-8 w-8"/>
                    <Link href="/">
                        <span className="font-semibold sm:text-2xl text-xl hovered">Peerloop</span>
                    </Link>
                </div>
                <div className="sm:flex hidden flex-row items-end gap-4 text-[15px] text-foreground/80 font-medium">
                    <Link href="/" className="hovered">Explore</Link>
                    <Link href="/" className="hovered">Communities</Link>
                    <Link href="/" className="hovered">How It Works</Link>
                </div>
                <div className="sm:flex hidden flex-row items-center gap-4 text-sm">
                    <ThemeToggle />
                    <Link href="/" className="border border-[var(--primary)] bg-[var(--card)] hover:bg-[var(--primary)]/10 rounded-xl px-4 py-2 transition">Login</Link>
                    <Link href="/" className="bg-[var(--primary)] px-4 py-2 rounded-xl text-white hover:bg-[#242424] transition">Signup</Link>
                </div>
                <div className="sm:hidden flex">
                    <Menu size={26} />
                </div>
            </div>
            
        </section>
    )
}

export default Header