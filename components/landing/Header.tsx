"use client"

import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Menu, XIcon } from "lucide-react"
import { useState, useRef } from "react"
import { MorphingInfinity } from "../ui/MorphingInfinity"

function Header() {

    const [navOpen, setNavOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    return (
        <section className="w-full flex flex-row itemcs-center justify-center">
            <div className="font-sans max-w-[1280px] w-full flex flex-row sm:items-end items-center justify-between p-3 border-b border-foreground/10">
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
                    <Link href="/login" className="border border-[var(--primary)] bg-[var(--card)] hover:bg-[var(--primary)]/10 rounded-xl px-4 py-2 transition">Login</Link>
                    <Link href="/signup" className="bg-[var(--primary)] px-4 py-2 rounded-xl text-white hover:bg-[#242424] transition">Signup</Link>
                </div>
                {navOpen?
                    <XIcon size={24} className="fadeIn sm:hidden flex text-foreground/80" onClick={() => setNavOpen(false)}/>
                    :
                    <Menu size={24} className="fadeIn sm:hidden flex text-foreground/80" onClick={() => setNavOpen(true)}/>
                }
            </div>
            <div ref={menuRef} className={`w-full h-full lg:hidden flex flex-col items-start justify-start gap-3 
                bg-[var(--background)] fixed top-12 left-0 transition-transform duration-300 border-b border-foreground/10
                ${navOpen ? "translate-x-0" : "-translate-x-full"}
                ${!navOpen ? "translate-x-full" : "-translate-x-0"}`}>
                
                <div className="w-full flex flex-col items-start py-4 px-3">
                    <div className="my-3">
                        <ThemeToggle />
                    </div>
                    
                    <Link href="/" className="font-sans text-sm cursor-pointer hovered border-b border-foreground/20 p-3 w-full text-foreground/60">Home</Link> 
                    <Link href="/explore" className="font-sans text-sm cursor-pointer hovered border-b border-foreground/20 p-3 w-full text-foreground/60">Explore</Link> 
                    <Link href="/communities" className="font-sans text-sm cursor-pointer hovered border-b border-foreground/20 p-3 w-full text-foreground/60">Communities</Link>
                    <Link href="/how-it-works" className="font-sans text-sm cursor-pointer hovered border-b border-foreground/20 p-3 w-full text-foreground/60">How It Works</Link>  
                </div>

                <div className="w-full mt-auto flex flex-col items-center gap-3 justify-between py-4 px-3 mb-12">
                    <Link href="/login"
                        className="w-full text-center border border-[var(--primary)] font-semibold text-foreground/80 rounded-full px-3 py-2 text-sm cursor-pointer">Login</Link>
                    <Link href="/signup"
                        className="w-full text-center text-white bg-[var(--primary)] font-semibold rounded-full px-3 py-2 text-sm cursor-pointer">SignUp</Link>
                </div>

            </div>  
        </section>
    )
}

export default Header