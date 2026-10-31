"use client"

import Header from "./components/Header"
import Image from "next/image"
import { useState } from "react";
import FeedPage from "./components/Feed";
import SettingsPage from "./components/Settings";
import Bookmarks from "./components/Bookmarks";

function page() {

    const [isMaintenance ,setIsMaintenance] = useState(false);
    const [isActive, setIsActive] = useState("feed");

    return (
        <div className="h-auto w-full flex flex-col items-center">
            <Header setIsActive={setIsActive}/>
            {isMaintenance && <div className="h-screen max-w-[1280px] w-full flex flex-col items-center justify-center gap-3">
                <Image src="/images/Maintenance.png" height={600} width={600} alt=""/>
                <span className="font-sans font-semibold sm:text-2xl text-xl">Under Maintenance</span>
            </div>}
            {isActive == "feed" && 
                <FeedPage />
            }
            {isActive == "bookmarks" && 
                <Bookmarks setIsActive={setIsActive} />
            }
            {isActive == "settings" && 
                <SettingsPage setIsActive={setIsActive} />
            }

        </div>
    )
}

export default page