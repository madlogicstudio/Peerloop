import Header from "./components/Header"
import Image from "next/image"

function page() {
    return (
        <div className="h-auto w-full flex flex-col items-center">
            <Header />
            <div className="h-screen max-w-[1280px] w-full flex flex-col items-center justify-center gap-3">
                <Image src="/images/Maintenance.png" height={600} width={600} alt=""/>
                <span className="font-sans font-semibold sm:text-2xl text-xl">Under Maintenance</span>
            </div>
            <span></span>
        </div>
    )
}

export default page